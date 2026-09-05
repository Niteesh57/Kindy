import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import dotenv from 'dotenv';
import { generateAgentResponse, streamAgentResponse } from './agent.js';
import { synthesizeSpeech, SUPPORTED_VOICES } from './tts.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health & Diagnostic Endpoint
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY || process.env.VERTEX_API_KEY);
  res.json({
    status: 'ok',
    hasApiKey: hasKey,
    flashModel: process.env.GEMINI_FLASH_MODEL || 'gemini-2.5-flash',
    ttsModel: process.env.GEMINI_TTS_MODEL || 'gemini-3.1-flash-tts-preview',
    defaultVoice: process.env.GEMINI_TTS_VOICE || 'Zephyr',
  });
});

// Supported Voices Endpoint
app.get('/api/voices', (req, res) => {
  res.json({ voices: SUPPORTED_VOICES });
});

// Non-Streaming Full Turn Chat Endpoint (Supports Audio or Text)
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, audio, audioBase64, mimeType, voice = 'Zephyr', history = [] } = req.body;
    const inputPayload =
      audio || audioBase64
        ? { audioBase64: audio || audioBase64, mimeType: mimeType || 'audio/webm' }
        : prompt;

    if (!inputPayload) {
      return res.status(400).json({ error: 'Prompt or audio is required' });
    }

    // 1. Generate text dialogue with Gemini Flash (ADK)
    const dialogue = await generateAgentResponse(inputPayload, history);

    // 2. Synthesize voiceover audio with Gemini 3.1 Flash TTS Preview
    let audioData = null;
    let ttsError = null;
    if (dialogue && dialogue.trim()) {
      try {
        audioData = await synthesizeSpeech(dialogue, { voice });
      } catch (err) {
        console.warn('TTS Synthesis note:', err.message);
        ttsError = err.message;
      }
    }

    res.json({
      text: dialogue,
      audio: audioData ? audioData.audioBase64 : null,
      mimeType: audioData ? audioData.mimeType : null,
      durationEstimate: audioData ? audioData.durationEstimate : null,
      voice: audioData ? audioData.voice : voice,
      ttsError,
    });
  } catch (error) {
    console.error('API /api/chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create HTTP server for Express and WebSockets
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws/avatar' });

let activeClients = 0;

wss.on('connection', (ws) => {
  activeClients++;
  console.log(`Avatar WebSocket client connected. (Total active: ${activeClients})`);

  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      const { type, prompt, audio, audioBase64, mimeType, voice = 'Zephyr', history = [] } = data;

      const isAudioInput = type === 'audio' && (audioBase64 || audio);
      const isPromptInput = type === 'prompt' && prompt;

      if (isAudioInput || isPromptInput) {
        let accumulatedText = '';
        const inputPayload = isAudioInput
          ? { audioBase64: audioBase64 || audio, mimeType: mimeType || 'audio/webm' }
          : prompt;

        // 1. Stream tokens from Gemini Flash (processes spoken voice or prompt text directly)
        await streamAgentResponse(inputPayload, history, (chunk) => {
          accumulatedText += chunk;
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(
              JSON.stringify({
                type: 'chunk',
                text: chunk,
                accumulated: accumulatedText,
              })
            );
          }
        });

        console.log(`[Server] LLM finished streaming. Text: "${accumulatedText.trim().slice(0, 80)}..."`);

        // 2. Synthesize performative voiceover audio with Gemini 3.1 TTS
        if (accumulatedText && accumulatedText.trim()) {
          try {
            console.log(`[Server] Requesting Gemini TTS synthesis (voice: ${voice})...`);
            const speech = await synthesizeSpeech(accumulatedText, { voice });
            if (speech && speech.audioBase64 && ws.readyState === WebSocket.OPEN) {
              console.log(`[Server] TTS audio synthesized! Sending ${speech.audioBase64.length} chars (mime: ${speech.mimeType})`);
              ws.send(
                JSON.stringify({
                  type: 'audio',
                  audioBase64: speech.audioBase64,
                  mimeType: speech.mimeType,
                  durationEstimate: speech.durationEstimate,
                  voice: speech.voice,
                })
              );
            } else {
              console.warn('[Server] TTS returned null or client disconnected.');
            }
          } catch (ttsErr) {
            console.warn('[Server] TTS synthesis error:', ttsErr.message);
          }
        }

        // 3. Mark turn as complete
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: 'done',
              fullText: accumulatedText,
            })
          );
        }
      }
    } catch (err) {
      console.error('WebSocket message processing error:', err);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'error', error: err.message }));
      }
    }
  });

  ws.on('close', () => {
    activeClients = Math.max(0, activeClients - 1);
    console.log(`Avatar WebSocket client disconnected. (Total active: ${activeClients})`);
  });
});

// Periodic heartbeat to clean up dead connection leaks
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', () => {
  clearInterval(heartbeatInterval);
});

server.listen(PORT, () => {
  console.log(`Kindy Avatar Vertex AI Server running on http://localhost:${PORT}`);
  console.log(`WebSocket streaming available at ws://localhost:${PORT}/ws/avatar`);
});
