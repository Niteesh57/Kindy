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
- Gestures: [say_hi], [hands_up], [hands_down], [thinking_pose], [cheer], [wave_left], [wave_right]
- Conclude with a resting pose: [calm, hands_down]
- Example:
  "[cheerful, say_hi] Hi there! I am Kindy! [thinking, thinking_pose] Hmm, let me think about that... [excited, hands_up] Oh, I know the answer! [calm, hands_down]"

CRITICAL MOTIVATIONAL CARDS & RECOMMENDATIONS INSTRUCTION:
- BY DEFAULT, DO NOT SHOW ANY CARDS. Speak naturally and conversationally with the user as their warm, helpful companion.
- ONLY when you decide that the user needs concrete choices, places to go, options to pick from, or volunteer opportunities to guide them, present recommendation cards using the [cards: ...] tag!
- Example format:
  [cards: [
    {"title": "Blue Bottle Coffee", "category": "Ferry Building · 0.1 mi", "description": "Fresh espresso with scenic bay views", "isBestPick": true, "badge": "BEST PICK", "url": "https://maps.google.com/?q=Blue+Bottle+Coffee+Ferry+Building"},
    {"title": "Red Bay Coffee", "category": "Embarcadero Plaza · 0.2 mi", "description": "Community-focused artisanal brews", "isBestPick": false, "badge": "ARTISAN"},
    {"title": "Philz Coffee", "category": "101 Spear St · 0.3 mi", "description": "Famous handcrafted Mint Mojito iced coffee", "isBestPick": false, "badge": "FAN FAVORITE"}
  ]]
- Exactly ONE best recommendation should have "isBestPick": true (this highlights the card in vibrant green).
- When mentioning cards, you can use [wave_left] or [wave_right] tags so you point toward them.
- When the user asks to remove, close, or hide cards, output [clear_cards].
- When you are simply answering a question, chit-chatting, or explaining without giving specific choices, do NOT output [cards: ...].
`;

/**
 * Format system instruction with user profile for personalized interaction
 */
export function getSystemInstructionWithProfile(profile) {
  if (!profile || !profile.name) {
    return SYSTEM_INSTRUCTION;
  }

  return `${SYSTEM_INSTRUCTION}

CRITICAL USER PROFILE INFORMATION:
- Name: ${profile.name}
- Age: ${profile.age || 'Not specified'}
- Status / Occupation: ${profile.status || 'Not specified'}
- Location: ${profile.location || 'Not specified'}

PERSONALIZATION RULES:
- Address the user by their name ("${profile.name}") naturally when greeting them or in conversation.
- Use their age, status (${profile.status}), and location (${profile.location}) to provide customized, highly relevant responses and recommendations.
`;
}

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
        text: 'Listen to the audio above. Respond directly in English. Speak naturally in 2 to 4 engaging, conversational sentences that provide a complete, satisfying answer. Include stage tags for emotion and gestures.',
      },
    ];
  }

  const promptText = typeof input === 'string' ? input : input?.prompt || 'Hello';
  return [{ text: promptText }];
}

/**
/**
 * Grounding tools for Google Search & Google Maps
 */
export const GROUNDING_TOOLS = [
  { googleSearch: {} },
  { googleMaps: {} },
];

/**
 * Standard Interactions Tool definitions
 */
export const INTERACTION_TOOLS = [
  { type: 'google_search' },
  { type: 'google_maps', latitude: 37.7955, longitude: -122.3937 },
];

/**
 * Create a search or Google Maps interaction using models/gemini-3.8-flash
 * Supports both ai.interactions.create and grounded models.generateContent
 */
export async function createMapSearchInteraction({
  input = 'Find coffee shops near the Ferry Building in San Francisco that are open now.',
  latitude = 37.7955,
  longitude = -122.3937,
  model = 'models/gemini-3.8-flash',
  maxOutputTokens = 1024,
  thinkingLevel = 'low',
} = {}) {
  const client = getClient();
  if (!client) {
    throw new Error(
      'Gemini / Vertex AI API key not configured. Please set GEMINI_API_KEY in server/.env'
    );
  }

  const promptText = typeof input === 'string' ? input : input?.prompt || 'Search places nearby';
  const cleanModel = model.startsWith('models/') ? model : `models/${model}`;
  const rawModelName = cleanModel.replace('models/', '');

  const tools = [
    { type: 'google_search' },
    { type: 'google_maps', latitude, longitude },
  ];

  const generationConfig = {
    max_output_tokens: maxOutputTokens,
    thinkingLevel,
  };

  // 1. Try native ai.interactions.create
  if (client.interactions && typeof client.interactions.create === 'function') {
    try {
      console.log(`[Interactions] Calling ai.interactions.create with ${cleanModel}...`);
      const interaction = await client.interactions.create({
        model: cleanModel,
        input: promptText,
        tools,
        generation_config: generationConfig,
      });

      const lastStep = interaction.steps?.at(-1);
      console.log(`[Interactions] Success via interactions.create`);
      return {
        text: lastStep?.text || interaction.text || '',
        interaction,
        step: lastStep,
        source: 'interactions.create',
      };
    } catch (interactionErr) {
      console.warn(
        `[Interactions] ai.interactions.create fallback to models.generateContent: ${interactionErr.message}`
      );
    }
  }

  // 2. High-performance models.generateContent with Google Maps + Search grounding
  console.log(`[Grounding] Calling models.generateContent with ${rawModelName} and [googleSearch, googleMaps]...`);
  const response = await client.models.generateContent({
    model: rawModelName,
    contents: promptText,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
      maxOutputTokens,
      thinkingLevel,
      tools: [
        { googleSearch: {} },
        { googleMaps: {} },
      ],
    },
  });

  return {
    text: response.text || '',
    candidates: response.candidates,
    groundingMetadata: response.candidates?.[0]?.groundingMetadata,
    source: 'models.generateContent',
  };
}

/**
 * Generate full response from Gemini Flash with Google Search & Maps Grounding
 * @param {string|object} input Text prompt or { audioBase64, mimeType }
 * @param {Array} history
 * @param {object} options
 * @returns {Promise<string>}
 */
export async function generateAgentResponse(input, history = [], options = {}) {
  const model = options.model || process.env.GEMINI_FLASH_MODEL || 'gemini-3.8-flash';
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
      systemInstruction: getSystemInstructionWithProfile(options.userProfile || options.profile),
      temperature: 0.7,
      maxOutputTokens: 1024,
      thinkingLevel: 'low',
      tools: [
        { googleSearch: {} },
        { googleMaps: {} },
      ],
    },
  });

  return response.text || '';
}

/**
 * Intent detection for Google Maps and Google Search tools
 */
export function detectToolIntent(input) {
  const text = typeof input === 'string' ? input : input?.prompt || '';
  if (!text || typeof text !== 'string') return null;
  const lower = text.toLowerCase();

  // 1. Google Maps Grounding Intent (locations, places, directions, navigation, cafes, etc.)
  const mapRegex = /\b(map|maps|location|locations|place|places|directions?|route|routes|near|nearby|where is|navigate|address|ferry building|san francisco|city|park|parks|coffee|cafe|restaurant|food|hotel|museum|stores?|campus|marina|distance|gps)\b/i;
  if (mapRegex.test(lower)) {
    return {
      tool: 'google_maps',
      name: 'Google Maps Grounding Engine',
      query: text,
      status: 'Locating places & geospatial data...',
    };
  }

  // 2. Google Search Grounding Intent (facts, web search, weather, news, current events, info)
  const searchRegex = /\b(search|find|google|look up|what is|who is|when is|where did|why does|how many|latest|recent|news|weather|price of|stocks?|definition|research|fact check)\b/i;
  if (searchRegex.test(lower)) {
    return {
      tool: 'google_search',
      name: 'Google Search Engine',
      query: text,
      status: 'Grounding knowledge with Google Search...',
    };
  }

  return null;
}

/**
 * Stream response tokens in real-time from Gemini Flash with Google Search & Maps Grounding
 * @param {string|object} input Text prompt or { audioBase64, mimeType }
 * @param {Array} history
 * @param {Function} onChunk Callback called with each text chunk
 * @param {object} options
 * @returns {Promise<string>} Full accumulated response text
 */
export async function streamAgentResponse(input, history = [], onChunk, options = {}) {
  const model = options.model || process.env.GEMINI_FLASH_MODEL || 'gemini-3.8-flash';
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
      systemInstruction: getSystemInstructionWithProfile(options.userProfile || options.profile),
      temperature: 0.7,
      maxOutputTokens: 1024,
      thinkingLevel: 'low',
      tools: [
        { googleSearch: {} },
        { googleMaps: {} },
      ],
    },
  });

  let fullText = '';
  let reportedTool = false;

  for await (const chunk of stream) {
    const chunkText = chunk.text || '';
    fullText += chunkText;

    // Check for grounding metadata or tool execution
    const candidate = chunk.candidates?.[0];
    if (candidate?.groundingMetadata) {
      const gMeta = candidate.groundingMetadata;

      if (options.onToolCall && !reportedTool) {
        if (gMeta.webSearchQueries && gMeta.webSearchQueries.length > 0) {
          reportedTool = true;
          options.onToolCall({
            tool: 'google_search',
            name: 'Google Search Engine',
            queries: gMeta.webSearchQueries,
            query: gMeta.webSearchQueries[0],
            status: 'Grounding knowledge with Google Search...',
          });
        } else if (
          gMeta.groundingChunks?.some(
            (c) => c.maps || (c.web?.uri && c.web.uri.includes('maps.google'))
          )
        ) {
          reportedTool = true;
          options.onToolCall({
            tool: 'google_maps',
            name: 'Google Maps Grounding Engine',
            status: 'Grounded geospatial data from Google Maps',
          });
        }
      }

      // Extract all citation chunks & Google Maps places
      if (options.onSources && gMeta.groundingChunks && gMeta.groundingChunks.length > 0) {
        const sources = gMeta.groundingChunks
          .map((c) => {
            if (c.web) {
              return {
                title: c.web.title || '',
                url: c.web.uri || '',
                isMaps: Boolean(
                  c.web.uri &&
                    (c.web.uri.includes('maps.google') ||
                      c.web.uri.includes('google.com/maps') ||
                      c.web.uri.includes('/place/'))
                ),
              };
            }
            if (c.maps) {
              return {
                title: c.maps.title || 'Google Maps Destination',
                url: c.maps.uri || '',
                isMaps: true,
              };
            }
            return null;
          })
          .filter(Boolean);

        if (sources.length > 0) {
          options.onSources(sources);
        }
      }
    }

    if (onChunk && chunkText) {
      onChunk(chunkText);
    }
  }

  // 1. Extract explicit LLM custom recommendation cards [cards: [...]]
  const cardsMatch = fullText.match(/\[cards:\s*(\[[\s\S]*?\])\s*\]/);
  if (cardsMatch && options.onCards) {
    try {
      const parsed = JSON.parse(cardsMatch[1]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log(`[Agent] Extracted ${parsed.length} dynamic recommendation cards from LLM output!`);
        options.onCards(parsed);
      }
    } catch (e) {
      console.warn('[Agent] Could not parse [cards: ...] JSON:', e.message);
    }
  }

  // 2. Check for explicit clear cards directive
  if (fullText.includes('[clear_cards]') && options.onClearCards) {
    console.log('[Agent] LLM requested to clear cards from screen.');
    options.onClearCards();
  }

  return fullText;
}
