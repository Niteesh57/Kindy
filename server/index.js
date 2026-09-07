import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import dotenv from 'dotenv';
import {
  generateAgentResponse,
  streamAgentResponse,
  createMapSearchInteraction,
  detectToolIntent,
} from './agent.js';
import { synthesizeSpeech, SUPPORTED_VOICES } from './tts.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Static frontend build resolution (supports Docker, Cloud Run, and local builds)
const potentialDistPaths = [
  path.resolve(__dirname, '../dist'),
  path.resolve(__dirname, 'dist'),
  path.resolve(process.cwd(), 'dist'),
];
const distPath = potentialDistPaths.find((p) => fs.existsSync(p));
if (distPath) {
  console.log(`[Kindy Static] Serving frontend from: ${distPath}`);
  app.use(express.static(distPath));
}

// Health & Diagnostic Endpoint
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY || process.env.VERTEX_API_KEY);
  res.json({
    status: 'ok',
    hasApiKey: hasKey,
    flashModel: process.env.GEMINI_FLASH_MODEL || 'gemini-3.8-flash',
    ttsModel: process.env.GEMINI_TTS_MODEL || 'gemini-3.1-flash-tts-preview',
    defaultVoice: process.env.GEMINI_TTS_VOICE || 'Zephyr',
    tools: ['google_search', 'google_maps'],
  });
});

// Supported Voices Endpoint
app.get('/api/voices', (req, res) => {
  res.json({ voices: SUPPORTED_VOICES });
});

// Non-Streaming Full Turn Chat Endpoint (Supports Audio or Text)
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, audio, audioBase64, mimeType, voice = 'Zephyr', history = [], userProfile, profile } = req.body;
    const inputPayload =
      audio || audioBase64
        ? { audioBase64: audio || audioBase64, mimeType: mimeType || 'audio/webm' }
        : prompt;

    if (!inputPayload) {
      return res.status(400).json({ error: 'Prompt or audio is required' });
    }

    // 1. Generate text dialogue with Gemini Flash (ADK) personalized with userProfile
    const dialogue = await generateAgentResponse(inputPayload, history, {
      userProfile: userProfile || profile,
    });

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

// Grounded Google Search & Google Maps Interactions Endpoint (gemini-3.8-flash)
app.post('/api/interactions', async (req, res) => {
  try {
    const {
      input = 'Find community volunteer centers nearby that are open now.',
      latitude = 37.7749,
      longitude = -122.4194,
      voice = 'Zephyr',
    } = req.body;

    const result = await createMapSearchInteraction({
      input,
      latitude,
      longitude,
    });

    let audioData = null;
    if (result.text && result.text.trim()) {
      try {
        audioData = await synthesizeSpeech(result.text, { voice });
      } catch (err) {
        console.warn('TTS note for interactions:', err.message);
      }
    }

    res.json({
      text: result.text,
      audio: audioData ? audioData.audioBase64 : null,
      mimeType: audioData ? audioData.mimeType : null,
      step: result.step,
      groundingMetadata: result.groundingMetadata,
      source: result.source,
      tool: 'google_maps',
      toolData: {
        tool: 'google_maps',
        name: 'Google Maps Grounding Engine',
        query: input,
      },
    });
  } catch (error) {
    console.error('API /api/interactions error:', error);
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

  // ─── Per-connection sequential processing queue ───────────────────────────
  // Ensures only ONE request processes at a time per client.
  // A new request cancels the in-flight one immediately so the user never waits
  // for a stale previous response to finish before the new one starts.
  let currentAbortController = null;
  let processingPromise = Promise.resolve();

  const processRequest = async (data, abortSignal) => {
    const { type, prompt, audio, audioBase64, mimeType, voice = 'Zephyr', history = [], userProfile, profile } = data;

    const isAudioInput = type === 'audio' && (audioBase64 || audio);
    const isPromptInput = type === 'prompt' && prompt;

    if (!isAudioInput && !isPromptInput) return;

    console.log(`[Server] Processing ${isAudioInput ? 'audio' : 'prompt'} request (prompt: "${prompt || ''}", history: ${history?.length || 0} turns)`);

    // Helper: send only if connection still open AND this request wasn't cancelled
    const safeSend = (payload) => {
      if (abortSignal.aborted || ws.readyState !== WebSocket.OPEN) return;
      ws.send(JSON.stringify(payload));
    };

    let accumulatedText = '';
    const inputPayload = isAudioInput
      ? { audioBase64: audioBase64 || audio, mimeType: mimeType || 'audio/webm', prompt }
      : prompt;

    // Instant tool detection from prompt / voice transcript
    const toolQuery = prompt || (typeof inputPayload === 'string' ? inputPayload : '');
    const initialTool = toolQuery ? detectToolIntent(toolQuery) : null;
    if (initialTool) {
      console.log(`[Server] Instant tool call: ${initialTool.tool} for "${toolQuery}"`);
      safeSend({ type: 'tool_call', ...initialTool });
    }

    if (abortSignal.aborted) return;

    // 1. Stream tokens from Gemini Flash
    try {
      await streamAgentResponse(
        inputPayload,
        history,
        (chunk) => {
          if (abortSignal.aborted) return;
          accumulatedText += chunk;
          safeSend({ type: 'chunk', text: chunk, accumulated: accumulatedText });
        },
        {
          userProfile: userProfile || profile,
          onToolCall: (toolData) => {
            if (abortSignal.aborted) return;
            console.log(`[Server] Tool called during stream: ${toolData.tool}`);
            safeSend({ type: 'tool_call', ...toolData });
          },
          onSources: (sources) => {
            if (abortSignal.aborted) return;
            console.log(`[Server] Grounding sources extracted: ${sources.length} links`);
            safeSend({ type: 'grounding_sources', sources });
          },
          onCards: (cards) => {
            if (abortSignal.aborted) return;
            console.log(`[Server] Emitting ${cards.length} LLM-decided recommendation cards`);
            safeSend({ type: 'cards', cards });
          },
          onClearCards: () => {
            if (abortSignal.aborted) return;
            console.log('[Server] Emitting clear_cards to client');
            safeSend({ type: 'clear_cards' });
          },
          onSearchComplete: () => {
            if (abortSignal.aborted) return;
            console.log('[Server] Search/tool execution complete. Emitting search_complete');
            safeSend({ type: 'search_complete' });
          },
        }
      );
    } catch (streamErr) {
      if (abortSignal.aborted) return; // silently drop cancelled request errors
      throw streamErr;
    }

    if (abortSignal.aborted) return;
    console.log(`[Server] LLM finished streaming. Text: "${accumulatedText.trim().slice(0, 80)}..."`);

    // 2. Synthesize voiceover audio with Gemini TTS
    if (accumulatedText && accumulatedText.trim()) {
      try {
        console.log(`[Server] Requesting Gemini TTS synthesis (voice: ${voice})...`);
        const speech = await synthesizeSpeech(accumulatedText, { voice });
        if (abortSignal.aborted) return;
        if (speech && speech.audioBase64) {
          console.log(`[Server] TTS audio synthesized! Sending ${speech.audioBase64.length} chars (mime: ${speech.mimeType})`);
          safeSend({
            type: 'audio',
            audioBase64: speech.audioBase64,
            mimeType: speech.mimeType,
            durationEstimate: speech.durationEstimate,
            voice: speech.voice,
          });
        } else {
          console.warn('[Server] TTS returned null or client disconnected.');
        }
      } catch (ttsErr) {
        if (abortSignal.aborted) return;
        console.warn('[Server] TTS synthesis error:', ttsErr.message);
      }
    }

    if (abortSignal.aborted) return;

    // 3. Mark turn as complete
    safeSend({ type: 'done', fullText: accumulatedText });
  };

  ws.on('message', (message) => {
    let data;
    try {
      data = JSON.parse(message.toString());
    } catch (parseErr) {
      console.error('WebSocket message parse error:', parseErr);
      return;
    }

    const isVoiceOrPrompt =
      (data.type === 'audio' && (data.audioBase64 || data.audio)) ||
      (data.type === 'prompt' && data.prompt);

    if (!isVoiceOrPrompt) return;

    // ── Cancel any in-flight request for this connection ──────────────────────
    if (currentAbortController) {
      console.log('[Server] New request arrived — cancelling previous in-flight request.');
      currentAbortController.abort();
    }

    const abortController = new AbortController();
    currentAbortController = abortController;

    // Chain on the queue so we never run two at once, but start immediately
    // after the previous one has been cancelled/completed.
    processingPromise = processingPromise
      .catch(() => {}) // swallow previous error so queue never stalls
      .then(() => {
        if (abortController.signal.aborted) return;
        return processRequest(data, abortController.signal);
      })
      .catch((err) => {
        if (abortController.signal.aborted) return;
        console.error('WebSocket request processing error:', err);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'error', error: err.message }));
        }
      });
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

// Single Page Application (SPA) fallback: serve index.html for all non-API/non-WS requests
if (distPath) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n=============================================================');
  console.log(`🚀 Kindy Avatar Studio is LIVE and ready!`);
  console.log(`   ➜ Frontend URL:        http://localhost:${PORT}`);
  console.log(`   ➜ WebSocket Endpoint:  ws://localhost:${PORT}/ws/avatar`);
  console.log(`   ➜ Health Check:        http://localhost:${PORT}/api/health`);
  console.log(`   ➜ Bound to:            0.0.0.0:${PORT} (Cloud Run & Docker ready)`);
  console.log('=============================================================\n');
});

// Graceful shutdown handling for Google Cloud Run and Docker containers
const handleGracefulShutdown = (signal) => {
  console.log(`\nReceived ${signal}. Gracefully closing Kindy server...`);
  clearInterval(heartbeatInterval);

  wss.close(() => {
    console.log('WebSocket server closed.');
    server.close(() => {
      console.log('HTTP server closed. Exiting process.');
      process.exit(0);
    });
  });

  // Force close after 10 seconds if lingering connections remain
  setTimeout(() => {
    console.warn('Forcing process exit after shutdown timeout.');
    process.exit(0);
  }, 10000).unref();
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

