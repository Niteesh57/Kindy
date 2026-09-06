import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { stripCardsAndTags } from './agent.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * Gemini 3.1 Flash TTS Preview Client
 * Generates performative, expressive voiceover audio steering style and emotional tone.
 */

export const SUPPORTED_VOICES = [
  { id: 'Kore', label: 'Kore (Warm & Friendly)', gender: 'Female' },
  { id: 'Puck', label: 'Puck (Playful & Energetic)', gender: 'Male' },
  { id: 'Fenrir', label: 'Fenrir (Deep & Resonant)', gender: 'Male' },
  { id: 'Aoede', label: 'Aoede (Melodic & Expressive)', gender: 'Female' },
  { id: 'Leda', label: 'Leda (Gentle & Calm)', gender: 'Female' },
  { id: 'Zephyr', label: 'Zephyr (Airy & Soft)', gender: 'Neutral' },
  { id: 'Orus', label: 'Orus (Confident & Authoritative)', gender: 'Male' },
  { id: 'Charon', label: 'Charon (Thoughtful & Low)', gender: 'Male' },
];

/**
 * Parse bits_per_sample and sample_rate from audio MIME type.
 * Mirrors the Python parse_audio_mime_type() function exactly.
 * e.g. "audio/L16;rate=24000" -> { bitsPerSample: 16, sampleRate: 24000 }
 */
function parseAudioMimeType(mimeType) {
  let bitsPerSample = 16;
  let sampleRate = 24000;

  const parts = mimeType.split(';');
  for (const part of parts) {
    const p = part.trim();
    if (p.toLowerCase().startsWith('rate=')) {
      const val = p.split('=')[1];
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed)) sampleRate = parsed;
    } else if (/audio\/[Ll](\d+)/i.test(p)) {
      const match = p.match(/audio\/[Ll](\d+)/i);
      if (match) bitsPerSample = parseInt(match[1], 10);
    }
  }

  return { bitsPerSample, sampleRate };
}

/**
 * Build a standard RIFF/WAV header and prepend it to raw PCM data.
 * Mirrors the Python convert_to_wav() function EXACTLY - NO byte swapping.
 */
function convertToWav(pcmBuffer, mimeType) {
  const { bitsPerSample, sampleRate } = parseAudioMimeType(mimeType);
  const numChannels = 1;
  const dataSize = pcmBuffer.length;
  const bytesPerSample = bitsPerSample >> 3;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const chunkSize = 36 + dataSize;

  // struct.pack "<" = little-endian, same as Python
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(chunkSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);         // Subchunk1Size = 16 for PCM
  header.writeUInt16LE(1, 20);          // AudioFormat = 1 (PCM)
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

let genAIClient = null;

function getClient() {
  if (!process.env.GEMINI_API_KEY && !process.env.VERTEX_API_KEY) {
    dotenv.config({ path: path.resolve(__dirname, '.env') });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VERTEX_API_KEY;

  if (!apiKey) {
    return null;
  }

  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ vertexai: true, apiKey });
  }
  return genAIClient;
}

/**
 * Synthesize speech from text with expressive steering
 * @param {string} text Spoken text, optionally with bracketed expressive tags
 * @param {object} options
 * @returns {Promise<{ audioBase64: string, mimeType: string, durationEstimate: number }>}
 */
export async function synthesizeSpeech(text, options = {}) {
  const voice = options.voice || process.env.GEMINI_TTS_VOICE || 'Zephyr';
  const model = process.env.GEMINI_TTS_MODEL || 'gemini-3.1-flash-tts-preview';

  const client = getClient();
  if (!client) {
    console.warn('Gemini / Vertex AI API key not configured. Please set GEMINI_API_KEY in server/.env');
    return null;
  }

  // Strip all card JSON payloads, bracketed stage tags, and URL remnants so TTS only speaks pure dialogue
  const cleanSpoken = stripCardsAndTags(text);
  const spokenText = cleanSpoken || (text && !text.startsWith('[') ? text.trim() : 'Hello! I am Kindy.');

  if (!spokenText || spokenText.length < 2) {
    console.log('TTS note: no spoken text provided, skipping TTS synthesis.');
    return null;
  }

  console.log(`[TTS] Synthesizing (${spokenText.length} chars, voice: ${voice}): "${spokenText.slice(0, 60)}..."`);

  try {
    // Use generateContentStream — mirrors the official Python SDK example exactly
    const stream = await client.models.generateContentStream({
      model,
      contents: [
        {
          role: 'user',
          parts: [{ text: spokenText }],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voice,
            },
          },
        },
      },
    });

    // Collect all audio chunks from the stream (mirrors Python 'for chunk in' loop)
    const audioChunks = [];
    let detectedMimeType = null;

    for await (const chunk of stream) {
      // Access parts via candidates (same as Python chunk.parts)
      const parts = chunk.candidates?.[0]?.content?.parts ?? chunk.parts;
      if (!parts) continue;

      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const mt = part.inlineData.mimeType || 'audio/l16;rate=24000';
          if (!detectedMimeType) detectedMimeType = mt;
          audioChunks.push(Buffer.from(part.inlineData.data, 'base64'));
        }
      }
    }

    if (audioChunks.length === 0) {
      console.warn('[TTS] Stream completed but no audio data received.');
      return null;
    }

    // Concatenate all raw PCM chunks into one buffer
    const rawPcm = Buffer.concat(audioChunks);
    const mimeType = detectedMimeType || 'audio/l16;rate=24000';

    let finalBuffer;
    let finalMime;

    if (mimeType.toLowerCase().includes('l16') || mimeType.toLowerCase().includes('pcm')) {
      // Prepend WAV header — NO swap16, matching Python SDK convert_to_wav() exactly
      finalBuffer = convertToWav(rawPcm, mimeType);
      finalMime = 'audio/wav';
    } else {
      // Already a container format (e.g. mp3) — send as-is
      finalBuffer = rawPcm;
      finalMime = mimeType;
    }

    const audioBase64 = finalBuffer.toString('base64');
    const durationEstimate = Math.max(1.5, spokenText.length / 14);

    console.log(`[TTS] SUCCESS: ${finalBuffer.length} bytes (${finalMime}), ~${durationEstimate.toFixed(1)}s`);

    return { audioBase64, mimeType: finalMime, durationEstimate, voice };

  } catch (error) {
    console.error('[TTS] Error synthesizing speech:', error.message);
    return null;
  }
}
