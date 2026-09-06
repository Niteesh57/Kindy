import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import Avatar from 'react-nice-avatar';
import {
  Maximize2,
  Minimize2,
  Palette,
  Mic,
  MicOff,
  Sparkles,
} from 'lucide-react';
import WavingHand from './components/WavingHand';
import ExpressionFaceOverlay from './components/ExpressionFaceOverlay';
import LaptopOverlay from './components/LaptopOverlay';
import MapOverlay from './components/MapOverlay';
import UserProfileModal from './components/UserProfileModal';
import ActionCard from './components/ActionCard';
import {
  buildCardsFromGrounding,
  formatLLMCards,
} from './constants/actionCardsData';
import { parseExpressionText, mergeTags } from './utils/expressionParser';
import hark from 'hark';

/**
 * Strips all card JSON tags [cards: [...]], clear directives, stage tags, and residual JSON/URL fragments
 * to produce clean spoken text for the subtitle ticker and speech bubble.
 */
function stripCardsAndTags(text) {
  if (!text) return '';
  let cleaned = text;
  // 1. Remove complete [cards: [...]] even if multi-line or nested
  cleaned = cleaned.replace(/\[cards:\s*\[[\s\S]*?\]\s*\]/gi, '');
  // 2. Remove in-progress or trailing [cards: ...
  cleaned = cleaned.replace(/\[cards:[\s\S]*$/gi, '');
  // 3. Remove [clear_cards] directive
  cleaned = cleaned.replace(/\[clear_cards\]/gi, '');
  // 4. Remove stage/expression tags [cheerful, say_hi], etc.
  cleaned = cleaned.replace(/\[.*?\]/g, '');
  // 5. Remove unclosed trailing bracket [thinking...
  cleaned = cleaned.replace(/\[[^\]]*$/, '');
  // 6. Strip any residual JSON chunks or raw URLs if somehow present
  cleaned = cleaned.replace(/\{[^{}]*\}/g, '');
  cleaned = cleaned.replace(/https?:\/\/\S+/gi, '');
  return cleaned.trim();
}
import {
  FACE_COLORS,
  HAIR_COLORS,
  SHIRT_COLORS,
  HAT_COLORS,
  STYLE_OPTIONS,
  VIBRANT_BACKGROUNDS,
} from './constants/avatarOptions';

const SUPPORTED_VOICES = ['Kore', 'Puck', 'Fenrir', 'Aoede', 'Leda', 'Zephyr', 'Orus', 'Charon'];

// Strict Rule: ONLY Google Gemini TTS audio is allowed. Completely disable browser SpeechSynthesis.
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  try {
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak = () => {
      // Intentionally silenced: Browser TTS is strictly disabled in favor of Google Gemini TTS
    };
  } catch (e) {}
}

// Persistent Singleton WebSocket connection: EXACTLY ONE connection per window/tab preserved across renders & HMR
function getOrCreatePersistentWs() {
  if (typeof window === 'undefined') return null;

  if (
    window.__KINDY_WS__ &&
    (window.__KINDY_WS__.readyState === WebSocket.OPEN ||
      window.__KINDY_WS__.readyState === WebSocket.CONNECTING)
  ) {
    return window.__KINDY_WS__;
  }

  // Clean up any stale or closed socket
  if (window.__KINDY_WS__) {
    try {
      window.__KINDY_WS__.onopen = null;
      window.__KINDY_WS__.onmessage = null;
      window.__KINDY_WS__.onerror = null;
      window.__KINDY_WS__.onclose = null;
      window.__KINDY_WS__.close();
    } catch (e) {}
    window.__KINDY_WS__ = null;
  }

  if (!window.__KINDY_WS_LISTENERS__) {
    window.__KINDY_WS_LISTENERS__ = new Set();
  }

  try {
    const ws = new WebSocket('ws://localhost:3001/ws/avatar');
    window.__KINDY_WS__ = ws;

    ws.onopen = () => {
      console.log('Single persistent WebSocket connection active.');
      if (window.__KINDY_WS_RECONNECT_TIMER__) {
        clearTimeout(window.__KINDY_WS_RECONNECT_TIMER__);
        window.__KINDY_WS_RECONNECT_TIMER__ = null;
      }
    };

    ws.onmessage = (event) => {
      if (window.__KINDY_WS_LISTENERS__) {
        window.__KINDY_WS_LISTENERS__.forEach((listener) => {
          try {
            listener(event);
          } catch (err) {
            console.error('WS listener error:', err);
          }
        });
      }
    };

    ws.onerror = () => {};

    ws.onclose = () => {
      window.__KINDY_WS__ = null;
      // Reconnect after 3.5s only if tab is visible and active
      if (!window.__KINDY_WS_RECONNECT_TIMER__) {
        window.__KINDY_WS_RECONNECT_TIMER__ = setTimeout(() => {
          window.__KINDY_WS_RECONNECT_TIMER__ = null;
          if (document.visibilityState !== 'hidden') {
            getOrCreatePersistentWs();
          }
        }, 3500);
      }
    };
  } catch (e) {
    console.warn('WebSocket init note:', e);
  }

  return window.__KINDY_WS__;
}

export default function App() {
  const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const [config, setConfig] = useState(() => {
    const sex = pickRandom(['man', 'woman']);
    const hairStyle =
      sex === 'man'
        ? pickRandom(STYLE_OPTIONS.hairStyleMan).value
        : pickRandom(STYLE_OPTIONS.hairStyleWoman).value;

    return {
      sex,
      faceColor: pickRandom(FACE_COLORS).value,
      earSize: pickRandom(['small', 'big']),
      hairStyle,
      hairColor: pickRandom(HAIR_COLORS).value,
      hairColorRandom: false,
      hatStyle: pickRandom(STYLE_OPTIONS.hatStyle).value,
      hatColor: pickRandom(HAT_COLORS).value,
      eyeStyle: 'oval',
      glassesStyle: pickRandom(STYLE_OPTIONS.glassesStyle).value,
      noseStyle: pickRandom(STYLE_OPTIONS.noseStyle).value,
      mouthStyle: 'smile',
      shirtStyle: pickRandom(STYLE_OPTIONS.shirtStyle).value,
      shirtColor: pickRandom(SHIRT_COLORS).value,
      bgColor: 'transparent',
      isGradient: false,
      shape: 'square',
    };
  });

  const [personalVoice] = useState(() => {
    const isMale = config.sex === 'man';
    const maleVoices = ['Puck', 'Fenrir', 'Orus', 'Charon'];
    const femaleVoices = ['Kore', 'Aoede', 'Leda'];
    return pickRandom(isMale ? maleVoices : femaleVoices);
  });
  const [currentBg, setCurrentBg] = useState(() => VIBRANT_BACKGROUNDS[0]);
  const [isBouncing, setIsBouncing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTypingMode, setIsTypingMode] = useState(false);
  const [isMapMode, setIsMapMode] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const [selectedWaypointIdx, setSelectedWaypointIdx] = useState(0);
  const toolDismissTimerRef = useRef(null);

  // User Profile (Stored in localStorage permanently, asked only on first open)
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('kindy_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('kindy_user_profile');
      return !saved;
    } catch {
      return true;
    }
  });

  const userProfileRef = useRef(userProfile);
  useEffect(() => {
    userProfileRef.current = userProfile;
  }, [userProfile]);

  // Persistent Session Conversation Memory (Stored in sessionStorage across turns)
  const [conversationHistory, setConversationHistory] = useState(() => {
    try {
      const saved = sessionStorage.getItem('kindy_session_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const conversationHistoryRef = useRef(conversationHistory);
  useEffect(() => {
    conversationHistoryRef.current = conversationHistory;
    try {
      sessionStorage.setItem('kindy_session_history', JSON.stringify(conversationHistory));
    } catch (e) {}
  }, [conversationHistory]);

  // Expression & Speech State
  const [isTalking, setIsTalking] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const [activeGesture, setActiveGesture] = useState('hands_down');
  const [leftHand, setLeftHand] = useState('down');
  const [rightHand, setRightHand] = useState('down');
  const [activeHeadClass, setActiveHeadClass] = useState('');
  const [activeTags, setActiveTags] = useState(['calm']);
  const [activeEmotion, setActiveEmotion] = useState('calm');
  const [mouthEnergy, setMouthEnergy] = useState(0);
  const [talkingFrame, setTalkingFrame] = useState(0);
  const [speechBubbleText, setSpeechBubbleText] = useState('');
  const [currentSpokenText, setCurrentSpokenText] = useState('');
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);

  // Interactive Action, Recommendation & Motivation Cards State (Decided dynamically by LLM / Grounding)
  const [actionCards, setActionCards] = useState([]);
  const [activeCardId, setActiveCardId] = useState(null);

  // Microphone & Speech Detection State
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [userSpeechText, setUserSpeechText] = useState('');
  const [micNotice, setMicNotice] = useState('');

  const talkingIntervalRef = useRef(null);
  const startListeningRef = useRef(null);
  const handleAskGeminiRef = useRef(null);
  const isMutedRef = useRef(false);
  const isTalkingRef = useRef(false);
  const isGeminiLoadingRef = useRef(false);
  const isListeningRef = useRef(false);
  const isUserSpeakingRef = useRef(false);

  // Direct Voice Hearing Capture refs (AudioContext + Analyser + MediaRecorder)
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const isRecordingSpeechRef = useRef(false);
  const vadAnimationRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const harkInstanceRef = useRef(null);
  // Real-time audio playback lip-sync analyser & animation frame
  const playbackAnalyserRef = useRef(null);
  const lipSyncRafRef = useRef(null);
  // Keep strong reference to playing audio to prevent garbage collection mid-playback!
  const audioElementRef = useRef(null);
  const audioSourceNodeRef = useRef(null);
  const expressionTimersRef = useRef([]);
  const speechRecRef = useRef(null);
  const userSpeechTextRef = useRef('');

  // Keep refs in sync for speech callbacks
  useEffect(() => {
    userSpeechTextRef.current = userSpeechText;
  }, [userSpeechText]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    isTalkingRef.current = isTalking;
  }, [isTalking]);

  useEffect(() => {
    isGeminiLoadingRef.current = isGeminiLoading;
  }, [isGeminiLoading]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    isUserSpeakingRef.current = isUserSpeaking;
  }, [isUserSpeaking]);

  // Randomize Avatar functionality has been removed as per constraints.

  const handleRandomBg = useCallback((e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setCurrentBg((prevBg) => pickRandom(VIBRANT_BACKGROUNDS.filter((b) => b.id !== prevBg.id)));
  }, []);

  // Cleanly stop voice recording, speech recognition, and hark VAD listeners
  const stopVoiceCapture = useCallback(() => {
    if (speechRecRef.current) {
      try {
        speechRecRef.current.stop();
      } catch (e) {}
      speechRecRef.current = null;
    }
    if (harkInstanceRef.current) {
      try {
        harkInstanceRef.current.stop();
      } catch (e) {}
      harkInstanceRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    isRecordingSpeechRef.current = false;
    isUserSpeakingRef.current = false;
    isListeningRef.current = false;
    setIsUserSpeaking(false);
    setIsListening(false);
  }, []);

  // Direct Voice Hearing Capture Manager (Audio-to-Audio pipeline with hark VAD and Speech Recognition)
  const startListening = useCallback(async () => {
    // Don't restart if already listening or if muted
    if (isListeningRef.current) return;
    if (isMutedRef.current) return;
    setMicNotice('');

    try {
      // 1. Acquire microphone stream (reuse existing if still active)
      let stream = mediaStreamRef.current;
      if (!stream || !stream.active) {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            noiseCancellation: true,
            autoGainControl: true,
            channelCount: 1,
            sampleRate: 16000,
          },
        });
        mediaStreamRef.current = stream;
      }

      // Pre-warm and unlock AudioContext during mic activation so audio output can play seamlessly
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
          audioContextRef.current = new AudioContextClass();
        }
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
      } catch (audioCtxErr) {
        console.warn('AudioContext pre-warm note:', audioCtxErr);
      }

      setIsListening(true);
      isListeningRef.current = true;
      setMicNotice('');

      // 2. Stop any existing hark VAD instance
      if (harkInstanceRef.current) {
        try {
          harkInstanceRef.current.stop();
        } catch (e) {}
        harkInstanceRef.current = null;
      }

      // 3. Initialize real-time SpeechRecognition for live captions and query transcription
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition && !speechRecRef.current) {
        try {
          const rec = new SpeechRecognition();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = 'en-US';
          rec.onresult = (e) => {
            let fullText = '';
            for (let i = 0; i < e.results.length; i++) {
              fullText += e.results[i][0].transcript;
            }
            if (fullText.trim()) {
              setUserSpeechText(fullText.trim());
              userSpeechTextRef.current = fullText.trim();
            }
          };
          rec.onerror = (err) => {
            console.log('SpeechRecognition note:', err.error);
          };
          rec.start();
          speechRecRef.current = rec;
        } catch (e) {
          console.log('SpeechRecognition init note:', e);
        }
      }

      // 4. Initialize Hark VAD (Specialized WebRTC Voice Activity Detection)
      // Threshold: -38 dB. Normal human speech is -30dB to -15dB.
      // Ambient fan/AC noise and room rumble are -65dB to -50dB and will be completely filtered out!
      const speechEvents = hark(stream, {
        threshold: -38,
        interval: 80,
        play: false,
      });
      harkInstanceRef.current = speechEvents;

      // When actual human voice is heard:
      speechEvents.on('speaking', () => {
        // Discard if Kindy is talking, Gemini is loading, or user is muted
        if (
          !isListeningRef.current ||
          isMutedRef.current ||
          isTalkingRef.current ||
          isGeminiLoadingRef.current
        ) {
          return;
        }

        // Cancel the 2-second silence timer if user resumed speaking
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }

        // Start recording speech if not already recording
        if (!isRecordingSpeechRef.current) {
          console.log('[Hark VAD] Human speech detected (exceeds -38dB speech threshold). Starting capture...');
          isRecordingSpeechRef.current = true;
          isUserSpeakingRef.current = true;
          setIsUserSpeaking(true);
          audioChunksRef.current = [];

          let mimeType = 'audio/webm;codecs=opus';
          if (typeof MediaRecorder !== 'undefined') {
            if (!MediaRecorder.isTypeSupported(mimeType)) {
              mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
            }

            try {
              const recorder = new MediaRecorder(stream, { mimeType });
              mediaRecorderRef.current = recorder;

              recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                  audioChunksRef.current.push(e.data);
                }
              };

              recorder.onstop = () => {
                const chunks = audioChunksRef.current;
                if (chunks.length > 0) {
                  const audioBlob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
                  console.log('[Hark VAD] Speech audio captured, size:', audioBlob.size, 'bytes');

                  // Ensure meaningful voice audio length (>5.6KB ~ 800ms)
                  if (audioBlob.size > 5600) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const base64Data = reader.result;
                      if (base64Data && handleAskGeminiRef.current) {
                        const recognizedText = userSpeechTextRef.current || '';
                        console.log('[Hark VAD] Sending verified voice to Gemini (text:', recognizedText, ')...');
                        handleAskGeminiRef.current({
                          prompt: recognizedText || undefined,
                          audioBase64: base64Data,
                          mimeType: audioBlob.type,
                        });
                      }
                    };
                    reader.readAsDataURL(audioBlob);
                  } else {
                    console.log('[Hark VAD] Audio snippet too short/quiet, ignored.');
                  }
                }
                audioChunksRef.current = [];
              };

              recorder.start(100);
            } catch (recErr) {
              console.warn('[Hark VAD] MediaRecorder error:', recErr);
              isRecordingSpeechRef.current = false;
              isUserSpeakingRef.current = false;
              setIsUserSpeaking(false);
            }
          }
        }
      });

      // When voice energy drops below threshold:
      speechEvents.on('stopped_speaking', () => {
        if (!isRecordingSpeechRef.current) return;

        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        // Buffer time: wait 900ms of silence before finalizing and sending to LLM (fast, responsive turn-taking)
        silenceTimerRef.current = setTimeout(() => {
          console.log('[Hark VAD] Silence threshold reached — finalizing and sending to LLM...');
          isRecordingSpeechRef.current = false;
          isUserSpeakingRef.current = false;
          setIsUserSpeaking(false);
          silenceTimerRef.current = null;

          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            try {
              mediaRecorderRef.current.stop();
            } catch (e) {}
          }
        }, 900); // 900ms natural conversational pause
      });
    } catch (err) {
      console.warn('Voice capture initialization error:', err);
      setIsListening(false);
      isListeningRef.current = false;
      setMicNotice('Click mic icon to allow microphone permission');
    }
  }, []);

  useEffect(() => {
    startListeningRef.current = startListening;
  }, [startListening]);

  // Toggle Mute / Mic Listening
  const toggleMute = useCallback(() => {
    setIsMuted((prevMuted) => {
      const nextMuted = !prevMuted;
      isMutedRef.current = nextMuted;
      if (nextMuted) {
        stopVoiceCapture();
        setIsListening(false);
        isListeningRef.current = false;
        setMicNotice('Microphone muted');
      } else {
        setMicNotice('');
        // Reset listening flag so startListening() can start fresh
        isListeningRef.current = false;
        startListening();
      }
      return nextMuted;
    });
  }, [stopVoiceCapture, startListening]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  // Keyboard shortcuts: 'B' for Background, 'M' for Mute, 'F' for Fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'b' || e.key === 'B') && e.target === document.body) {
        e.preventDefault();
        handleRandomBg();
      } else if ((e.key === 'm' || e.key === 'M') && e.target === document.body) {
        e.preventDefault();
        toggleMute();
      } else if ((e.key === 'f' || e.key === 'F') && e.target === document.body) {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRandomBg, toggleMute, toggleFullscreen]);

  // Fullscreen tracker
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Pause voice capture when browser tab is hidden in background to prevent multi-tab conflicts
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        stopVoiceCapture();
      } else if (!isMutedRef.current && !isTalkingRef.current && !isGeminiLoadingRef.current) {
        startListeningRef.current?.();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [stopVoiceCapture]);

  // Auto-start microphone immediately on load and on language switch
  useEffect(() => {
    startListening();

    // Fallback: if browser blocked autoplay mic without user gesture, first click activates it
    const handleFirstUserInteraction = () => {
      if (
        !isListeningRef.current &&
        !isMutedRef.current &&
        !isTalkingRef.current &&
        !isGeminiLoadingRef.current
      ) {
        console.log('Activating microphone upon user interaction...');
        startListeningRef.current?.();
      }
    };
    window.addEventListener('click', handleFirstUserInteraction, { once: true });
    window.addEventListener('keydown', handleFirstUserInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstUserInteraction);
      window.removeEventListener('keydown', handleFirstUserInteraction);
    };
  }, [startListening]);

  // Connect exactly ONE persistent WebSocket for Kindy (initializes on mount)
  useEffect(() => {
    // Ensure singleton is created but never duplicated
    getOrCreatePersistentWs();
    // No cleanup: the singleton persists for the lifetime of the window
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mouth Talking Animation Loop
  useEffect(() => {
    if (isTalking) {
      talkingIntervalRef.current = setInterval(() => {
        setTalkingFrame((f) => f + 1);
      }, 130);
    } else {
      if (talkingIntervalRef.current) {
        clearInterval(talkingIntervalRef.current);
      }
      setTalkingFrame(0);
    }

    return () => {
      if (talkingIntervalRef.current) {
        clearInterval(talkingIntervalRef.current);
      }
    };
  }, [isTalking]);

  // Direct Emotion Selection
  const applyEmotion = (rawTag) => {
    const segments = parseExpressionText(`[${rawTag}]`);
    if (segments && segments.length > 0) {
      const { tags, resolved } = segments[0];
      setActiveTags(tags);
      const primaryEmotion = tags[0] || 'happy';
      setActiveEmotion(primaryEmotion);
      if (resolved.headClass) setActiveHeadClass(resolved.headClass);
      if (resolved.gesture) {
        setActiveGesture(resolved.gesture);
        setIsWaving(
          resolved.gesture.includes('wave') ||
          resolved.gesture.includes('cheer') ||
          resolved.gesture === 'say_hi'
        );
        setLeftHand(null);
        setRightHand(null);
      }
    }
  };

  // Hand Toggle Helpers
  const toggleLeftHand = () => {
    setLeftHand((prev) => (prev === 'up' || prev === 'wave' ? 'down' : 'up'));
  };

  const toggleRightHand = () => {
    setRightHand((prev) => (prev === 'up' || prev === 'wave' ? 'down' : 'up'));
  };

  // SEQUENTIAL EXPRESSION & SPEECH PLAYBACK ENGINE
  const playExpressionSequence = (rawText) => {
    const segments = parseExpressionText(rawText);
    if (!segments || segments.length === 0) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    let segmentIndex = 0;

    const playNextSegment = () => {
      if (segmentIndex >= segments.length) {
        // Finished all segments: stop talking mouth, but KEEP the facial expression & pose!
        setIsTalking(false);
        setIsWaving(false);
        setCurrentSpokenText('');
        setSpeechBubbleText('');
        return;
      }

      const segment = segments[segmentIndex];
      const { tags, cleanText, resolved } = segment;

      // 1. Update visual emotional face & posture state
      setActiveTags(tags);
      const primaryEmotion = tags[0] || 'happy';
      setActiveEmotion(primaryEmotion);

      if (resolved.headClass) setActiveHeadClass(resolved.headClass);
      if (resolved.gesture) {
        setActiveGesture(resolved.gesture);
        setIsWaving(
          resolved.gesture.includes('wave') ||
          resolved.gesture.includes('cheer') ||
          resolved.gesture === 'say_hi'
        );
        setLeftHand(null);
        setRightHand(null);
      }

      // 2. Prepare visual expression & speech text
      const fullSpokenText = (resolved.soundPrefix || '') + cleanText;
      setSpeechBubbleText(fullSpokenText);
      setCurrentSpokenText(fullSpokenText);
      setIsTalking(true);

      // Pure visual talking animation (NO browser robotic voice, only Google TTS speaks!)
      const displayDuration = Math.max(1600, fullSpokenText.length * 60);
      setTimeout(() => {
        setIsTalking(false);
        setCurrentSpokenText('');
        segmentIndex++;
        setTimeout(playNextSegment, 200);
      }, displayDuration);
    };

    playNextSegment();
  };

  // UNIVERSAL EXPRESSION & LLM EVENT ENGINE
  // Can be called directly, or via window.avatar.express({ ... }) / window.dispatchEvent(new CustomEvent('avatar:express', { detail: ... }))
  const express = (input) => {
    if (!input) return;

    // 1. Text String Input (e.g. "[thinking, say_hi] Hmm, let me think... [excited, hands_up] Ah got it!")
    if (typeof input === 'string') {
      playExpressionSequence(input);
      return;
    }

    // 2. Structured Event/LLM Payload
    const {
      emotion,
      tags,
      gesture,
      leftHand: lHand,
      rightHand: rHand,
      isTalking: talking,
      text,
      speak = true,
      headClass,
      background,
    } = input;

    // Multi-layer Emotion Tags
    const incomingTags = tags || (Array.isArray(emotion) ? emotion : [emotion || 'happy']);
    setActiveTags(incomingTags);
    setActiveEmotion(incomingTags[0] || 'happy');

    // Gesture & Independent Hand Poses
    if (gesture) {
      setActiveGesture(gesture);
      setIsWaving(
        gesture.includes('wave') ||
        gesture.includes('cheer') ||
        gesture === 'say_hi' ||
        gesture === 'hands_up'
      );
    }
    if (lHand !== undefined) setLeftHand(lHand);
    if (rHand !== undefined) setRightHand(rHand);

    // Head Motion
    if (headClass) {
      setActiveHeadClass(headClass);
    } else {
      const merged = mergeTags(incomingTags);
      if (merged.headClass) setActiveHeadClass(merged.headClass);
      if (!gesture && merged.gesture) {
        setActiveGesture(merged.gesture);
        setIsWaving(
          merged.gesture.includes('wave') ||
          merged.gesture.includes('cheer') ||
          merged.gesture === 'say_hi'
        );
      }
    }

    // Dynamic Vibrant Background
    if (background) {
      const foundBg = VIBRANT_BACKGROUNDS.find(
        (b) => b.id === background || b.name.toLowerCase() === background.toLowerCase()
      );
      if (foundBg) {
        setCurrentBg(foundBg);
      } else if (background.startsWith('linear-gradient') || background.startsWith('#')) {
        setCurrentBg({ id: 'custom', name: 'Custom Vibrant', value: background, iconColor: '#6366f1' });
      }
    }

    // Multi-layer Speech & Talking animation
    if (text) {
      if (speak) {
        const textWithTags = text.includes('[') ? text : `[${incomingTags.join(',')}] ${text}`;
        playExpressionSequence(textWithTags);
      } else {
        setSpeechBubbleText(text);
        if (talking !== undefined) setIsTalking(Boolean(talking));
      }
    } else if (talking !== undefined) {
      setIsTalking(Boolean(talking));
    }
  };

  // GLOBAL WINDOW EVENT LISTENER & DEVELOPER/LLM API
  useEffect(() => {
    const handleAvatarExpressEvent = (e) => {
      if (e.detail) express(e.detail);
    };

    const handleAvatarStreamEvent = (e) => {
      const detail = e.detail;
      if (typeof detail === 'string') express(detail);
      else if (detail && detail.chunk) express(detail.chunk);
    };

    window.addEventListener('avatar:express', handleAvatarExpressEvent);
    window.addEventListener('avatar:stream', handleAvatarStreamEvent);

    // Expose window.avatar and window.expressAvatar for LLM agent integration
    window.avatar = {
      express,
      say: (text, options = {}) => express({ text, speak: true, ...options }),
      setEmotion: (emotion) => express({ emotion }),
      setGesture: (gesture) => express({ gesture, leftHand: null, rightHand: null }),
      setHands: ({ left, right }) => {
        if (left !== undefined) setLeftHand(left);
        if (right !== undefined) setRightHand(right);
      },
      handsUp: () => {
        setActiveGesture('hands_up');
        setLeftHand('up');
        setRightHand('up');
        setIsWaving(true);
      },
      handsDown: () => {
        setActiveGesture('hands_down');
        setLeftHand('down');
        setRightHand('down');
        setIsWaving(false);
      },
      sayHi: () => handleSayHi(),
      thinkingPose: () => {
        setActiveGesture('thinking');
        setLeftHand('down');
        setRightHand('thinking');
        setActiveEmotion('thinking');
        setActiveTags(['thinking']);
      },
      setTalking: (talking) => setIsTalking(Boolean(talking)),
      setBackground: (bg) => {
        const found = VIBRANT_BACKGROUNDS.find(
          (b) => b.id === bg || b.name.toLowerCase() === bg.toLowerCase()
        );
        if (found) setCurrentBg(found);
      },
    };
    window.expressAvatar = express;

    return () => {
      window.removeEventListener('avatar:express', handleAvatarExpressEvent);
      window.removeEventListener('avatar:stream', handleAvatarStreamEvent);
      delete window.avatar;
      delete window.expressAvatar;
    };
  }, [config, currentBg]);

  // Play Gemini 3.1 Flash TTS Audio synchronized with start gesture -> talking -> end rest pose
  const playGeminiAudio = async (audioBase64, mimeType = 'audio/wav', rawText = '') => {
    console.log('🔊 playGeminiAudio called! Payload size:', audioBase64?.length, 'mime:', mimeType);
    try {
      // 1. Decode base64 -> Uint8Array
      const cleanBase64 = (audioBase64 || '').replace(/^data:audio\/[a-z0-9]+;base64,/i, '').trim();
      const binaryString = atob(cleanBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // 2. Parse initial emotion and gesture
      const segments = parseExpressionText(rawText);
      const firstSegment = segments?.[0];
      const initialTags = firstSegment?.tags || ['cheerful'];
      const initialGesture = firstSegment?.resolved?.gesture || 'say_hi';

      setActiveTags(initialTags);
      setActiveEmotion(initialTags[0] || 'cheerful');
      setActiveGesture(initialGesture);
      setIsWaving(
        initialGesture.includes('wave') ||
        initialGesture.includes('cheer') ||
        initialGesture === 'say_hi' ||
        initialGesture === 'hands_up'
      );
      setLeftHand(null);
      setRightHand(null);

      // Dismiss laptop and map overlays immediately so Kindy's full face and gestures are visible
      setIsMapMode(false);
      setIsTypingMode(false);
      setActiveTool(null);
      if (toolDismissTimerRef.current) {
        clearTimeout(toolDismissTimerRef.current);
        toolDismissTimerRef.current = null;
      }

      const cleanText = stripCardsAndTags(rawText);
      setSpeechBubbleText(cleanText);
      setCurrentSpokenText(cleanText);

      // 3. Set talking state (suppresses microphone input during speech)
      setIsTalking(true);
      isTalkingRef.current = true;

      const handlePlaybackEnded = () => {
        console.log('🔊 Speech playback ended. Resetting to rest state and re-enabling mic.');
        if (lipSyncRafRef.current) {
          cancelAnimationFrame(lipSyncRafRef.current);
          lipSyncRafRef.current = null;
        }
        setMouthEnergy(0);
        audioElementRef.current = null;
        audioSourceNodeRef.current = null;
        setIsTalking(false);
        isTalkingRef.current = false;
        setCurrentSpokenText('');
        setSpeechBubbleText('');
        setActiveEmotion('calm');
        setActiveTags(['calm']);
        setActiveHeadClass('');
        setActiveGesture('hands_down');
        setLeftHand('down');
        setRightHand('down');
        setIsWaving(false);
        setIsMapMode(false);
        setIsTypingMode(false);
        setActiveTool(null);
        if (toolDismissTimerRef.current) {
          clearTimeout(toolDismissTimerRef.current);
          toolDismissTimerRef.current = null;
        }

        setTimeout(() => {
          setSpeechBubbleText('');
          setUserSpeechText('');
        }, 6000);

        // Auto-resume microphone listening immediately after Kindy finishes speaking
        if (!isMutedRef.current && document.visibilityState !== 'hidden') {
          isListeningRef.current = false;
          startListeningRef.current?.();
        }
      };

      // Stop any existing playback and clear pending expression timers
      if (lipSyncRafRef.current) {
        cancelAnimationFrame(lipSyncRafRef.current);
        lipSyncRafRef.current = null;
      }
      setMouthEnergy(0);
      if (expressionTimersRef.current && expressionTimersRef.current.length > 0) {
        expressionTimersRef.current.forEach((t) => clearTimeout(t));
        expressionTimersRef.current = [];
      }
      if (audioElementRef.current) {
        try { audioElementRef.current.pause(); } catch (e) {}
        audioElementRef.current = null;
      }
      if (audioSourceNodeRef.current) {
        try { audioSourceNodeRef.current.stop(); } catch (e) {}
        audioSourceNodeRef.current = null;
      }

      // Helper function to dynamically advance the scrolling spoken text sentence-by-sentence in sync with speech
      const scheduleSpokenSentences = (text, totalDurationSec) => {
        if (!text || !totalDurationSec || totalDurationSec <= 0) return;

        // Split by sentence boundaries (. ! ?) while preserving punctuation
        const rawSentences = text.match(/[^.!?]+(?:[.!?]+|$)/g) || [text];
        const sentences = rawSentences.map((s) => s.trim()).filter(Boolean);
        if (sentences.length === 0) return;

        const totalChars = sentences.reduce((acc, s) => acc + s.length, 0);
        let accumulatedFraction = 0;

        // Immediately show the first sentence
        setCurrentSpokenText(sentences[0]);

        for (let i = 1; i < sentences.length; i++) {
          const prevSentence = sentences[i - 1];
          accumulatedFraction += prevSentence.length / totalChars;
          const delayMs = Math.round(accumulatedFraction * totalDurationSec * 1000);

          const nextSentence = sentences[i];
          const timer = setTimeout(() => {
            if (isTalkingRef.current) {
              setCurrentSpokenText(nextSentence);
            }
          }, delayMs);

          expressionTimersRef.current.push(timer);
        }
      };

      // Helper function to schedule timed emotion transitions over the total audio duration
      const scheduleSegmentTransitions = (totalDurationSec) => {
        if (!segments || segments.length <= 1 || !totalDurationSec || totalDurationSec <= 0) return;

        const totalCharCount = segments.reduce((sum, s) => sum + (s.cleanText?.length || 10), 0);
        let elapsedFraction = 0;

        // Skip index 0 because it starts immediately at time 0
        for (let i = 1; i < segments.length; i++) {
          const prevSeg = segments[i - 1];
          const segFraction = (prevSeg.cleanText?.length || 10) / totalCharCount;
          elapsedFraction += segFraction;
          const triggerDelayMs = Math.round(elapsedFraction * totalDurationSec * 1000);

          const targetSeg = segments[i];
          const timer = setTimeout(() => {
            const segTags = targetSeg.tags || ['happy'];
            const segEmotion = segTags[0] || 'happy';
            const segGesture = targetSeg.resolved?.gesture || 'hands_down';

            setActiveTags(segTags);
            setActiveEmotion(segEmotion);
            setActiveGesture(segGesture);
            if (targetSeg.resolved?.headClass) {
              setActiveHeadClass(targetSeg.resolved.headClass);
            }
            setIsWaving(
              segGesture.includes('wave') ||
              segGesture.includes('cheer') ||
              segGesture === 'say_hi' ||
              segGesture === 'hands_up'
            );
          }, triggerDelayMs);

          expressionTimersRef.current.push(timer);
        }
      };

      // 4. PRIMARY: Web Audio API (AudioContext)
      // Web Audio API is immune to autoplay policies once the AudioContext is resumed,
      // and accurately decodes standard 16-bit PCM WAV at any sample rate.
      let playedViaWebAudio = false;
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        let audioCtx = audioContextRef.current;
        if (!audioCtx || audioCtx.state === 'closed') {
          audioCtx = new AudioContextClass();
          audioContextRef.current = audioCtx;
        }
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }

        if (audioCtx && audioCtx.state === 'running') {
          // slice(0) copies the ArrayBuffer because decodeAudioData detaches the buffer
          const audioBuffer = await audioCtx.decodeAudioData(bytes.buffer.slice(0));
          const source = audioCtx.createBufferSource();
          source.buffer = audioBuffer;

          // Create high-resolution AnalyserNode specifically for lip-sync viseme tracking
          const playbackAnalyser = audioCtx.createAnalyser();
          playbackAnalyser.fftSize = 256;
          playbackAnalyser.smoothingTimeConstant = 0.4;
          playbackAnalyserRef.current = playbackAnalyser;

          source.connect(playbackAnalyser);
          playbackAnalyser.connect(audioCtx.destination);
          audioSourceNodeRef.current = source; // Keep strong ref to prevent garbage collection

          // Real-time audio energy lip-sync loop
          const timeData = new Uint8Array(playbackAnalyser.frequencyBinCount);
          const startLipSyncLoop = () => {
            if (!isTalkingRef.current) return;
            playbackAnalyser.getByteFrequencyData(timeData);

            // Compute RMS vocal volume across speech frequencies (vowels & consonants)
            let sum = 0;
            const binCount = Math.min(timeData.length, 32); // Focus on fundamental vocal frequencies (80Hz - 3kHz)
            for (let i = 0; i < binCount; i++) {
              sum += timeData[i] * timeData[i];
            }
            const rms = Math.sqrt(sum / binCount);
            // Normalize volume into 0.0 to 1.0 speech energy
            const energy = Math.min(1, Math.max(0, (rms - 15) / 95));
            setMouthEnergy(energy);

            lipSyncRafRef.current = requestAnimationFrame(startLipSyncLoop);
          };
          lipSyncRafRef.current = requestAnimationFrame(startLipSyncLoop);

          source.onended = () => {
            if (lipSyncRafRef.current) {
              cancelAnimationFrame(lipSyncRafRef.current);
              lipSyncRafRef.current = null;
            }
            setMouthEnergy(0);
            audioSourceNodeRef.current = null;
            handlePlaybackEnded();
          };

          source.start(0);
          playedViaWebAudio = true;
          console.log(`🔊 Playing via Web Audio API with audio-driven lip sync (duration: ${audioBuffer.duration.toFixed(2)}s)`);

          // Schedule multi-stage emotional shifts & spoken sentence streamer over speech duration
          scheduleSegmentTransitions(audioBuffer.duration);
          scheduleSpokenSentences(cleanText, audioBuffer.duration);
        }
      } catch (ctxErr) {
        console.warn('Web Audio API decode failed, falling back to HTML5 Audio:', ctxErr);
      }

      // 5. FALLBACK: HTML5 Audio element
      if (!playedViaWebAudio) {
        const blob = new Blob([bytes], { type: 'audio/wav' });
        const blobUrl = URL.createObjectURL(blob);
        const audioEl = new Audio(blobUrl);
        audioElementRef.current = audioEl;

        audioEl.onended = () => {
          URL.revokeObjectURL(blobUrl);
          handlePlaybackEnded();
        };

        audioEl.onerror = (e) => {
          console.error('HTML5 Audio playback error:', e);
          URL.revokeObjectURL(blobUrl);
          handlePlaybackEnded();
        };

        audioEl.onloadedmetadata = () => {
          if (audioEl.duration && !isNaN(audioEl.duration)) {
            scheduleSegmentTransitions(audioEl.duration);
            scheduleSpokenSentences(cleanText, audioEl.duration);
          }
        };

        try {
          await audioEl.play();
          console.log('🔊 Playing via HTML5 Audio element (fallback)');
        } catch (playErr) {
          console.error('HTML5 Audio play() rejected:', playErr);
          URL.revokeObjectURL(blobUrl);
          handlePlaybackEnded();
        }
      }
    } catch (e) {
      console.error('Error in playGeminiAudio:', e);
      audioElementRef.current = null;
      audioSourceNodeRef.current = null;
      setIsTalking(false);
      isTalkingRef.current = false;
      setSpeechBubbleText(rawText.replace(/\[.*?\]/g, '').trim());
      if (!isMutedRef.current && document.visibilityState !== 'hidden') {
        isListeningRef.current = false;
        startListeningRef.current?.();
      }
    }
  };

  // Call Node.js Vertex AI / ADK backend (WebSocket Stream with HTTP Fallback)
  const handleAskGemini = useCallback(async ({ prompt, audioBase64, mimeType, voice = personalVoice }) => {
    setIsGeminiLoading(true);
    isGeminiLoadingRef.current = true;
    setSpeechBubbleText('');
    setCurrentSpokenText('');

    // Stop recording speech if still in progress
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }
    isRecordingSpeechRef.current = false;
    isUserSpeakingRef.current = false;
    setIsUserSpeaking(false);

    if (toolDismissTimerRef.current) {
      clearTimeout(toolDismissTimerRef.current);
      toolDismissTimerRef.current = null;
    }

    // Track user turn in persistent conversation history
    const userText = (typeof prompt === 'string' && prompt.trim())
      ? prompt
      : (userSpeechTextRef.current || userSpeechText || 'Voice message');
    const updatedHistory = [...conversationHistoryRef.current, { role: 'user', content: userText }];
    setConversationHistory(updatedHistory);
    conversationHistoryRef.current = updatedHistory;

    // Instant tool pre-activation from prompt/speech
    const initialQuery = typeof prompt === 'string' ? prompt : (userSpeechTextRef.current || userSpeechText || '');
    if (initialQuery) {
      const lower = initialQuery.toLowerCase();
      const isMaps = /\b(map|maps|location|locations|place|places|directions?|route|routes|near|nearby|where is|navigate|address|city|town|park|parks|coffee|cafe|restaurant|hotel|museum|ngo|volunteer|center|foundation|community|library|shelter|venue|where to go|go there|visit|head over|there)\b/i.test(lower);
      const isSearch = /\b(search|find|google|look up|what is|who is|when is|where did|why does|how many|latest|recent|news|weather|price of|opportunities|volunteer|ngo|connect|initiative|impact|participate|teach|mentor)\b/i.test(lower);
      if (isMaps) {
        setIsMapMode(true);
        setIsTypingMode(false);
        setActiveTool({
          tool: 'google_maps',
          name: 'Google Maps Tool',
          query: initialQuery,
          status: 'Locating nearby spots & analyzing routes',
        });
      } else if (isSearch) {
        setIsTypingMode(true);
        setIsMapMode(false);
        setActiveTool({
          tool: 'google_search',
          name: 'Google Search Tool',
          query: initialQuery,
          status: 'Querying web sources & verifying facts',
        });
      }
    }

    // Set immediate thinking gesture & emotion (pure visual)
    express({
      emotion: 'thinking',
      gesture: 'thinking_pose',
      leftHand: 'down',
      rightHand: 'thinking',
      speak: false,
      isTalking: false,
    });

    const ws = getOrCreatePersistentWs();
    if (ws && ws.readyState === WebSocket.OPEN) {
      let accumulated = '';
      let hasTriggeredEmotion = false;

      // Dynamic safety timeout: ample time for LLM streaming + Gemini TTS synthesis
      let safetyTimer = null;
      const setSafetyTimeout = (durationMs = 50000) => {
        if (safetyTimer) clearTimeout(safetyTimer);
        safetyTimer = setTimeout(() => {
          if (isGeminiLoadingRef.current) {
            console.warn('[SafetyTimeout] Server response timed out after', durationMs, 'ms');
            if (window.__KINDY_WS_LISTENERS__) {
              window.__KINDY_WS_LISTENERS__.delete(turnListener);
            }
            setIsGeminiLoading(false);
            isGeminiLoadingRef.current = false;
            setUserSpeechText('');
            express({
              emotion: 'confused',
              gesture: 'hands_down',
              text: "Let's try that again! What would you like to talk about?",
              speak: false,
            });
          }
        }, durationMs);
      };

      // Start initial 50s timeout for the entire turn
      setSafetyTimeout(50000);

      const turnListener = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'tool_call') {
            console.log('🛠️ [Client] Tool call event received:', msg.tool, msg.query);
            if (toolDismissTimerRef.current) {
              clearTimeout(toolDismissTimerRef.current);
              toolDismissTimerRef.current = null;
            }
            if (msg.tool === 'google_maps') {
              setIsMapMode(true);
              setIsTypingMode(false);
              setActiveTool({
                tool: 'google_maps',
                name: 'Google Maps Tool',
                query: msg.query || initialQuery || 'Places to connect and volunteer',
                status: msg.status || 'Grounding geospatial data with Google Maps',
              });
            } else if (msg.tool === 'google_search') {
              setIsTypingMode(true);
              setIsMapMode(false);
              setActiveTool({
                tool: 'google_search',
                name: 'Google Search Tool',
                query: msg.query || initialQuery || 'Grounding web information',
                status: msg.status || 'Live Google Web Search Grounding',
              });
            }
          } else if (msg.type === 'search_complete') {
            console.log('⚡ [Client] Search completed — removing tool overlay immediately');
            setIsMapMode(false);
            setIsTypingMode(false);
            setActiveTool(null);
            if (toolDismissTimerRef.current) clearTimeout(toolDismissTimerRef.current);
          } else if (msg.type === 'cards') {
            console.log('🎴 [Client] Received LLM-decided recommendation cards:', msg.cards?.length);
            setIsMapMode(false);
            setIsTypingMode(false);
            setActiveTool(null);
            if (toolDismissTimerRef.current) clearTimeout(toolDismissTimerRef.current);
            if (msg.cards && msg.cards.length > 0) {
              const formattedCards = formatLLMCards(msg.cards);
              if (formattedCards && formattedCards.length > 0) {
                setActionCards(formattedCards);
                const best = formattedCards.find((c) => c.isBestPick) || formattedCards[0];
                setActiveCardId(best?.id || null);
              }
            }
          } else if (msg.type === 'clear_cards') {
            console.log('🧹 [Client] LLM instructed to clear cards from screen');
            setActionCards([]);
            setActiveCardId(null);
          } else if (msg.type === 'grounding_sources') {
            console.log('📍 [Client] Received grounding sources from Gemini:', msg.sources?.length);
            setIsMapMode(false);
            setIsTypingMode(false);
            setActiveTool(null);
            if (toolDismissTimerRef.current) clearTimeout(toolDismissTimerRef.current);
            if (msg.sources && msg.sources.length > 0) {
              const dynamicCards = buildCardsFromGrounding(msg.sources);
              if (dynamicCards && dynamicCards.length > 0) {
                setActionCards(dynamicCards);
                setActiveCardId(dynamicCards[0].id);
              }
            }
          } else if (msg.type === 'chunk') {
            // As soon as spoken tokens begin streaming, dismiss any remaining search overlay
            setIsMapMode(false);
            setIsTypingMode(false);
            setActiveTool(null);
            if (toolDismissTimerRef.current) clearTimeout(toolDismissTimerRef.current);

            // Keep timeout alive while tokens are actively streaming
            setSafetyTimeout(40000);
            accumulated = msg.accumulated || (accumulated + msg.text);
            const cleanText = stripCardsAndTags(accumulated);
            setSpeechBubbleText(cleanText);

            if (!hasTriggeredEmotion && accumulated.includes('[')) {
              const segments = parseExpressionText(accumulated);
              if (segments && segments[0] && segments[0].tags) {
                const tag = segments[0].tags[0];
                setActiveEmotion(tag);
                setActiveTags(segments[0].tags);
                if (segments[0].resolved?.gesture) {
                  setActiveGesture(segments[0].resolved.gesture);
                  setIsWaving(
                    segments[0].resolved.gesture.includes('wave') ||
                    segments[0].resolved.gesture.includes('cheer') ||
                    segments[0].resolved.gesture === 'say_hi'
                  );
                }
                hasTriggeredEmotion = true;
              }
            }
          } else if (msg.type === 'audio') {
            console.log('🔊 Received audio packet from server! Length:', msg.audioBase64?.length);
            if (safetyTimer) clearTimeout(safetyTimer);
            if (window.__KINDY_WS_LISTENERS__) {
              window.__KINDY_WS_LISTENERS__.delete(turnListener);
            }
            setIsGeminiLoading(false);
            isGeminiLoadingRef.current = false;
            setUserSpeechText('');
            userSpeechTextRef.current = '';

            // Record assistant turn in persistent conversation history
            const assistantSpeech = stripCardsAndTags(accumulated) || 'I am happy to guide you!';
            const finalHistory = [...conversationHistoryRef.current, { role: 'assistant', content: assistantSpeech }];
            setConversationHistory(finalHistory);
            conversationHistoryRef.current = finalHistory;

            if (msg.audioBase64) {
              playGeminiAudio(msg.audioBase64, msg.mimeType || 'audio/wav', accumulated);
            }
          } else if (msg.type === 'done') {
            // LLM finished. Keep safety timer active for 30s so TTS synthesis can complete!
            setSafetyTimeout(30000);
            setIsGeminiLoading(false);
            isGeminiLoadingRef.current = false;
            setUserSpeechText('');
            userSpeechTextRef.current = '';
          } else if (msg.type === 'error') {
            if (safetyTimer) clearTimeout(safetyTimer);
            if (window.__KINDY_WS_LISTENERS__) {
              window.__KINDY_WS_LISTENERS__.delete(turnListener);
            }
            setIsGeminiLoading(false);
            isGeminiLoadingRef.current = false;
            setUserSpeechText('');
            userSpeechTextRef.current = '';
            express({
              emotion: 'confused',
              text: "Sorry, I couldn't hear that properly. Could you say that again?",
              speak: false,
            });
          }
        } catch (e) {
          console.error('WebSocket message parse error:', e);
        }
      };

      if (!window.__KINDY_WS_LISTENERS__) {
        window.__KINDY_WS_LISTENERS__ = new Set();
      }
      window.__KINDY_WS_LISTENERS__.add(turnListener);

      const payload = audioBase64
        ? {
            type: 'audio',
            audioBase64,
            mimeType: mimeType || 'audio/webm',
            voice,
            userProfile: userProfileRef.current,
            history: updatedHistory.slice(-14),
          }
        : {
            type: 'prompt',
            prompt,
            voice,
            userProfile: userProfileRef.current,
            history: updatedHistory.slice(-14),
          };

      ws.send(JSON.stringify(payload));
      return;
    }

    // HTTP Fallback
    try {
      const res = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          audioBase64,
          mimeType,
          voice,
          userProfile: userProfileRef.current,
          history: updatedHistory.slice(-14),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned ${res.status}`);
      }

      const data = await res.json();
      const { text, audio, mimeType: responseMime } = data;
      setIsGeminiLoading(false);
      isGeminiLoadingRef.current = false;
      setUserSpeechText('');

      const assistantSpeech = stripCardsAndTags(text) || 'I am happy to guide you!';
      const finalHistory = [...conversationHistoryRef.current, { role: 'assistant', content: assistantSpeech }];
      setConversationHistory(finalHistory);
      conversationHistoryRef.current = finalHistory;

      if (audio) {
        playGeminiAudio(audio, responseMime, text);
      } else {
        express({ text, speak: false });
      }
    } catch (err) {
      console.warn('Gemini backend note:', err.message);
      setIsGeminiLoading(false);
      isGeminiLoadingRef.current = false;
      setUserSpeechText('');
      express({
        emotion: 'confused',
        gesture: 'hands_down',
        text: "I'm having trouble connecting right now. Let's try again in a moment!",
        speak: false,
      });
      if (!isMutedRef.current && document.visibilityState !== 'hidden') {
        isListeningRef.current = false;
        startListeningRef.current?.();
      }
    }
  }, [personalVoice]);

  useEffect(() => {
    handleAskGeminiRef.current = handleAskGemini;
  }, [handleAskGemini]);

  // Group action cards into 3 on left and 3 on right (Decided dynamically by LLM / Grounding)
  const hasCards = Boolean(actionCards && actionCards.length > 0);
  const leftCards = hasCards ? actionCards.filter((c) => c.side === 'left').slice(0, 3) : [];
  const rightCards = hasCards ? actionCards.filter((c) => c.side === 'right').slice(0, 3) : [];
  const displayLeftCards = leftCards.length > 0 ? leftCards : (hasCards ? actionCards.slice(0, 3) : []);
  const displayRightCards = rightCards.length > 0 ? rightCards : (hasCards ? actionCards.slice(3, 6) : []);

  const handleClearCards = useCallback(() => {
    setActionCards([]);
    setActiveCardId(null);
  }, []);

  // Handle interaction with Left & Right Action Cards
  const handleCardClick = useCallback((card) => {
    if (!card) return;
    setActiveCardId(card.id);

    // Kindy points / waves towards the side of the clicked card
    if (card.side === 'left') {
      setActiveGesture('wave_left');
      setLeftHand('wave');
      setRightHand('down');
      setIsWaving(true);
    } else {
      setActiveGesture('wave_right');
      setRightHand('wave');
      setLeftHand('down');
      setIsWaving(true);
    }

    const promptText =
      card.motivationPrompt ||
      `Tell me all about ${card.title} and motivate me on why visiting or volunteering here is amazing!`;

    handleAskGeminiRef.current?.({ prompt: promptText });
  }, []);

  // Save User Profile to localStorage and greet user warmly by name
  const handleSaveProfile = useCallback((profile) => {
    setUserProfile(profile);
    userProfileRef.current = profile;
    try {
      localStorage.setItem('kindy_user_profile', JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to save profile to localStorage:', e);
    }
    setIsProfileModalOpen(false);

    // Kindy welcomes user personally by their name!
    express({
      emotion: 'cheerful',
      gesture: 'say_hi',
      text: `[cheerful, say_hi] Wonderful to meet you, ${profile.name}! I am Kindy! [excited, hands_up] I am so excited to explore, talk, and learn together with you! [calm, hands_down]`,
      speak: false,
    });
  }, []);

  // Wave hand and say Hi (visual only)
  const handleSayHi = () => {
    express({
      emotion: 'cheerful',
      gesture: 'say_hi',
      leftHand: 'down',
      rightHand: 'wave',
      text: '[cheerful, say_hi] Hi there! 👋 Wonderful to see you!',
      speak: false,
    });
  };

  return (
    <div
      className="full-screen-stage"
      style={{ background: currentBg.value }}
    >
      {/* Top Floating Voice Status & Live Feedback Banner */}
      <div className="top-voice-status-bar">
        {isGeminiLoading ? (
          <div className="voice-status-pill thinking">
            <Sparkles size={15} className="sparkle-spin" />
            <span className="pill-text">Thinking & Processing...</span>
          </div>
        ) : isTalking ? (
          <div className="voice-status-pill talking">
            <span className="speaking-wave-dot" />
            <span className="pill-text">Kindy Speaking</span>
          </div>
        ) : isUserSpeaking ? (
          <div className="voice-status-pill user-speaking">
            <span className="live-sound-bars">
              <span className="bar b1" />
              <span className="bar b2" />
              <span className="bar b3" />
            </span>
            <span className="pill-text">Listening...</span>
          </div>
        ) : isMuted ? (
          <button
            type="button"
            className="voice-status-pill muted clickable"
            onClick={toggleMute}
            title="Click to unmute microphone (M)"
          >
            <MicOff size={15} />
            <span className="pill-text">Microphone Muted • Click to Speak</span>
          </button>
        ) : isListening ? (
          <div className="voice-status-pill listening">
            <span className="listening-pulse-dot" />
            <span className="pill-text">Listening... Speak anytime</span>
          </div>
        ) : (
          <button
            type="button"
            className="voice-status-pill idle clickable"
            onClick={startListening}
            title="Click to activate microphone"
          >
            <Mic size={15} className="mic-live-icon" />
            <span className="pill-text">Microphone Paused • Click to Speak</span>
          </button>
        )}

        {/* User Profile Badge (Click to View/Edit Profile) */}
        {userProfile?.name && (
          <button
            type="button"
            className="user-profile-badge-btn"
            onClick={() => setIsProfileModalOpen(true)}
            title="Click to view or edit your profile"
          >
            <span className="user-profile-avatar-dot">
              {userProfile.name.charAt(0).toUpperCase()}
            </span>
            <span>Hi, {userProfile.name}</span>
          </button>
        )}

        {micNotice && (
          <div className="mic-notice-badge" onClick={toggleMute}>
            {micNotice}
          </div>
        )}
      </div>

      {/* Main Full Character Area with Dynamic Actionable Cards (Rendered ONLY when LLM gives cards) */}
      <div className={`avatar-main-hero ${hasCards ? 'has-side-cards' : 'no-side-cards'}`}>
        {/* Left Column: 3 Action/Motivation Cards (Only if LLM decides to show cards) */}
        {hasCards && (
          <div className="side-cards-column side-cards-left" role="region" aria-label="Left recommendations">
            {displayLeftCards.map((card) => (
              <ActionCard
                key={card.id}
                card={card}
                isBestPick={card.isBestPick}
                isActive={activeCardId === card.id}
                onClick={() => handleCardClick(card)}
              />
            ))}
          </div>
        )}

        {/* Center Avatar Character */}
        <div
          id="avatar-center-wrapper"
          className={`full-character-wrapper ${isBouncing ? 'bounce-active' : ''} ${
            isTalking ? 'talking-active' : ''
          } ${activeHeadClass} ${isTypingMode || isMapMode ? 'head-typing-tilt' : ''}`}
        >
          <div className="avatar-fullscreen-container has-expression-active">
            {/* Base Avatar (clothes, body, hair, accessories) */}
            <Avatar
              id="main-react-nice-avatar"
              shape="square"
              style={{
                width: '100%',
                height: '100%',
                background: 'transparent',
              }}
              {...config}
            />

            {/* Dynamic Expressive Face (animated brows, eyes, blush, and audio-reactive talking mouth) */}
            <ExpressionFaceOverlay
              expression={activeEmotion}
              tags={activeTags}
              isTalking={isTalking}
              talkingFrame={talkingFrame}
              mouthEnergy={mouthEnergy}
            />

            {/* Symmetrical Two-Hand Waving & Gestures (hidden when holding map or laptop) */}
            {!isTypingMode && !isMapMode && (
              <WavingHand
                skinColor={config.faceColor}
                shirtColor={config.shirtColor}
                isWaving={isWaving}
                gesture={activeGesture}
                leftHand={leftHand}
                rightHand={rightHand}
                onWave={(side) => {
                  if (side === 'left') toggleLeftHand();
                  else if (side === 'right') toggleRightHand();
                  else setIsWaving(!isWaving);
                }}
                onToggleLeftHand={toggleLeftHand}
                onToggleRightHand={toggleRightHand}
              />
            )}

            {/* Detective Map Overlay with Real Optical Magnifying Glass Scope */}
            {isMapMode && (
              <MapOverlay
                skinColor={config.faceColor}
                shirtColor={config.shirtColor}
                isTalking={isTalking}
                activeQuery={activeTool?.query}
                selectedWaypointIdx={selectedWaypointIdx}
                onSelectWaypoint={setSelectedWaypointIdx}
              />
            )}

            {/* Laptop Overlay for Typing Mode (Straight, High-Tech Glyph Matrix Screen) */}
            {isTypingMode && (
              <LaptopOverlay
                isTalking={isTalking}
                activeQuery={activeTool?.query}
              />
            )}
          </div>
        </div>

        {/* Right Column: 3 Action/Motivation Cards (Only if LLM decides to show cards) */}
        {hasCards && (
          <div className="side-cards-column side-cards-right" role="region" aria-label="Right recommendations">
            {displayRightCards.map((card) => (
              <ActionCard
                key={card.id}
                card={card}
                isBestPick={card.isBestPick}
                isActive={activeCardId === card.id}
                onClick={() => handleCardClick(card)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Control Dock with Integrated Animated Popup Speech Bar */}
      <div className="bottom-dock-wrapper">
        {/* White Speech Popup Box (Pops up overlapping the dock bar while speaking, slides inside when done) */}
        <div
          className={`dock-speech-popup ${isTalking && (currentSpokenText || speechBubbleText) ? 'popup-active' : ''}`}
          role="status"
          aria-live="polite"
        >
          <div className="dock-speech-inner">
            <span className="dock-speech-avatar-tag">
              <span className="equalizer-bars">
                <span className="eq-bar bar-1" />
                <span className="eq-bar bar-2" />
                <span className="eq-bar bar-3" />
              </span>
              <span>Kindy</span>
            </span>
            <div className="dock-speech-ticker-container">
              <span
                key={currentSpokenText || speechBubbleText}
                className={`dock-speech-ticker-text ${(currentSpokenText || speechBubbleText).length > 42 ? 'ticker-scroll' : ''}`}
              >
                {currentSpokenText || speechBubbleText}
              </span>
            </div>
          </div>
        </div>

        {/* Floating Minimalist Control Dock: Memoized to isolate from re-renders */}
        <ControlsDock
          onRandomBg={handleRandomBg}
          bgIconColor={currentBg.iconColor}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
        />
      </div>

      {/* User Onboarding & Profile Modal (Saved to localStorage permanently) */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleSaveProfile}
        initialProfile={userProfile}
      />
    </div>
  );
}

// Rock-solid memoized dock: only re-renders when isMuted, isFullscreen, or background changes
const ControlsDock = memo(function ControlsDock({
  onRandomBg,
  bgIconColor,
  isMuted,
  onToggleMute,
  isFullscreen,
  onToggleFullscreen,
}) {
  return (
    <div className="floating-controls-dock" role="toolbar" aria-label="Controls">
      {/* 1. Background Change Button */}
      <button
        type="button"
        className="dock-control-btn bg-change-btn"
        onClick={onRandomBg}
        title="Change Background to next vibrant style (B)"
      >
        <Palette size={19} style={{ color: bgIconColor || '#f43f5e' }} className="dock-icon" />
        <span>Change BG</span>
        <span className="dock-shortcut">B</span>
      </button>

      {/* 2. Mute / Mic Button */}
      <button
        type="button"
        className={`dock-control-btn mic-toggle-btn ${isMuted ? 'muted' : 'active'}`}
        onClick={onToggleMute}
        title={isMuted ? 'Unmute Microphone (M)' : 'Mute Microphone (M)'}
      >
        {isMuted ? (
          <>
            <MicOff size={19} className="dock-icon" />
            <span>Muted</span>
          </>
        ) : (
          <>
            <span className="mic-dock-dot" />
            <Mic size={19} className="dock-icon" />
            <span>Mic Active</span>
          </>
        )}
        <span className="dock-shortcut">M</span>
      </button>

      {/* 3. Fullscreen Button */}
      <button
        type="button"
        className="dock-control-btn fullscreen-btn"
        onClick={onToggleFullscreen}
        title={isFullscreen ? 'Exit Full Screen (F)' : 'Full Screen (F)'}
      >
        {isFullscreen ? <Minimize2 size={19} className="dock-icon" /> : <Maximize2 size={19} className="dock-icon" />}
        <span>{isFullscreen ? 'Exit Full' : 'Full Screen'}</span>
        <span className="dock-shortcut">F</span>
      </button>
    </div>
  );
});
