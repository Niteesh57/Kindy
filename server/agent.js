import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * Google ADK & Gemini Flash Agent for Interactive Avatar
 * Instructs Gemini Flash to output conversational dialogue enriched with
 * multi-layered emotional expressions and hand gestures.
 */

const SYSTEM_INSTRUCTION = `
You are "Kindy", an expressive, friendly, and intelligent AI companion avatar.
Your responses are spoken aloud by a voice synthesis engine and visually performed by an animated 2D avatar in real-time.

CRITICAL LANGUAGE INSTRUCTION:
- You are strictly an ENGLISH ONLY assistant.
- ALWAYS reply in English, even if the user speaks to you in a different language.

CRITICAL RESPONSE LENGTH & STYLE INSTRUCTION:
- You are an assistant acting as a friendly voice guide for the user.
- Your answers should be precise and directly address the user's context.
- You have the freedom to choose the appropriate length (short, medium, or long) to fully justify the answer.
- Do not make it too short, but avoid unnecessarily prolonged answers or essays.
- Your output is streamed live to a single-line caption bar and spoken aloud immediately, so keep it engaging and conversational.

CRITICAL VISUAL TAGS:
- You MUST use multiple emotion and gesture tags dynamically throughout your response, just like a real human changing expressions while speaking!
- Start your response with an emotion and gesture tag in brackets.
- Insert additional tags in the middle of your sentences as your emotion or tone changes.
- Emotions: [happy], [cheerful], [excited], [joyful], [playful], [thinking], [thoughtfully], [calm], [peaceful], [crying], [sad], [angry], [confused]
- Gestures: [say_hi], [hands_up], [hands_down], [thinking_pose], [cheer]
- Conclude with a resting pose: [calm, hands_down]
- Example:
  "[cheerful, say_hi] Hi there! I am Kindy! [thinking, thinking_pose] Hmm, let me think about that... [excited, hands_up] Oh, I know the answer! [calm, hands_down]"
`;

let clientInstance = null;

function getClient() {
  if (!process.env.GEMINI_API_KEY && !process.env.VERTEX_API_KEY) {
    dotenv.config({ path: path.resolve(__dirname, '.env') });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VERTEX_API_KEY;

  if (!apiKey) {
    return null;
  }

  if (!clientInstance) {
    clientInstance = new GoogleGenAI({ vertexai: true, apiKey });
  }
  return clientInstance;
}

/**
 * Format user prompt parts: supports text string or audio inlineData { audioBase64, mimeType }
 */
function formatInputParts(input) {
  if (typeof input === 'object' && (input.audioBase64 || input.audio)) {
    const rawData = input.audioBase64 || input.audio;
    const cleanBase64 = rawData.includes(',') ? rawData.split(',')[1] : rawData;
    const cleanMime = input.mimeType ? input.mimeType.split(';')[0].trim() : 'audio/webm';

    return [
      {
        inlineData: {
          mimeType: cleanMime,
          data: cleanBase64,
        },
      },
      {
        text: 'Listen to the audio above. Respond directly in English. Keep response to 1-2 short sentences with initial emotion and gesture tags.',
      },
    ];
  }

  const promptText = typeof input === 'string' ? input : input?.prompt || 'Hello';
  return [{ text: promptText }];
}

/**
 * Generate full response from Gemini Flash
 * @param {string|object} input Text prompt or { audioBase64, mimeType }
 * @param {Array} history
 * @returns {Promise<string>}
 */
export async function generateAgentResponse(input, history = []) {
  const model = process.env.GEMINI_FLASH_MODEL || 'gemini-2.5-flash';
  const client = getClient();

  if (!client) {
    throw new Error(
      'Gemini / Vertex AI API key not configured. Please set GEMINI_API_KEY in server/.env'
    );
  }

  const userParts = formatInputParts(input);

  const contents = [
    ...history.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })),
    {
      role: 'user',
      parts: userParts,
    },
  ];

  const response = await client.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
      maxOutputTokens: 120,
    },
  });

  return response.text || '';
}

/**
 * Stream response tokens in real-time from Gemini Flash
 * @param {string|object} input Text prompt or { audioBase64, mimeType }
 * @param {Array} history
 * @param {Function} onChunk Callback called with each text chunk
 * @returns {Promise<string>} Full accumulated response text
 */
export async function streamAgentResponse(input, history = [], onChunk) {
  const model = process.env.GEMINI_FLASH_MODEL || 'gemini-2.5-flash';
  const client = getClient();

  if (!client) {
    throw new Error(
      'Gemini / Vertex AI API key not configured. Please set GEMINI_API_KEY in server/.env'
    );
  }

  const userParts = formatInputParts(input);

  const contents = [
    ...history.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })),
    {
      role: 'user',
      parts: userParts,
    },
  ];

  const stream = await client.models.generateContentStream({
    model,
    contents,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
      maxOutputTokens: 350,
    },
  });

  let fullText = '';
  for await (const chunk of stream) {
    const chunkText = chunk.text || '';
    fullText += chunkText;
    if (onChunk && chunkText) {
      onChunk(chunkText);
    }
  }

  return fullText;
}
