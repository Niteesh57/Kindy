import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import Avatar, { genConfig } from 'react-nice-avatar';
import confetti from 'canvas-confetti';
import {
  Dices,
  Maximize2,
  Minimize2,
  Palette,
  Mic,
  MicOff,
  Sparkles,
  Laptop,
} from 'lucide-react';
import WavingHand from './components/WavingHand';
import ExpressionPlayground from './components/ExpressionPlayground';
import { parseExpressionText, mergeTags } from './utils/expressionParser';
import hark from 'hark';
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
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isTypingMode, setIsTypingMode] = useState(false);

  // Expression & Speech State
  const [isTalking, setIsTalking] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const [activeGesture, setActiveGesture] = useState('hands_down');
  const [leftHand, setLeftHand] = useState('down');
  const [rightHand, setRightHand] = useState('down');
  const [activeHeadClass, setActiveHeadClass] = useState('');
  const [activeTags, setActiveTags] = useState(['calm']);
  const [activeEmotion, setActiveEmotion] = useState('calm');
  const [talkingFrame, setTalkingFrame] = useState(0);
  const [speechBubbleText, setSpeechBubbleText] = useState('');
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);

  // Microphone & Speech Detection State
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [userSpeechText, setUserSpeechText] = useState('');
  const [micNotice, setMicNotice] = useState('');

  const wsRef = useRef(null);
  const talkingIntervalRef = useRef(null);
  const recognitionRef = useRef(null);
  const speechTimeoutRef = useRef(null);
  const restartTimerRef = useRef(null);
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
  // Keep strong reference to playing audio to prevent garbage collection mid-playback!
  const audioElementRef = useRef(null);
  const audioSourceNodeRef = useRef(null);

  // Keep refs in sync for speech callbacks
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

  // Cleanly stop voice recording and hark VAD listeners
  const stopVoiceCapture = useCallback(() => {
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

  // Direct Voice Hearing Capture Manager (Audio-to-Audio pipeline with hark VAD)
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

      // 3. Initialize Hark VAD (Specialized WebRTC Voice Activity Detection)
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
                        console.log('[Hark VAD] Sending verified voice to Gemini...');
                        handleAskGeminiRef.current({
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

        // Buffer time: wait 2.0 seconds of silence before finalizing and sending to LLM
        silenceTimerRef.current = setTimeout(() => {
          console.log('[Hark VAD] 2-second silence buffer elapsed — finalizing and sending to LLM...');
          isRecordingSpeechRef.current = false;
          isUserSpeakingRef.current = false;
          setIsUserSpeaking(false);
          silenceTimerRef.current = null;

          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            try {
              mediaRecorderRef.current.stop();
            } catch (e) {}
          }
        }, 2000); // Exactly 2 seconds as requested by the user
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
      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onstart = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onresult = null;
          recognitionRef.current.stop();
        } catch (e) {}
      }
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
        setTimeout(() => {
          setSpeechBubbleText('');
        }, 2500);
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

      // 2. Prepare visual expression & single-line caption streamer
      const fullSpokenText = (resolved.soundPrefix || '') + cleanText;
      setSpeechBubbleText(fullSpokenText);
      setIsTalking(true);

      // Pure visual talking animation (NO browser robotic voice, only Google TTS speaks!)
      const displayDuration = Math.max(1600, fullSpokenText.length * 60);
      setTimeout(() => {
        setIsTalking(false);
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

      const cleanText = rawText.replace(/\[.*?\]/g, '').trim();
      setSpeechBubbleText(cleanText);

      // 3. Set talking state (suppresses microphone input during speech)
      setIsTalking(true);
      isTalkingRef.current = true;

      const handlePlaybackEnded = () => {
        console.log('🔊 Speech playback ended. Resetting to rest state and re-enabling mic.');
        audioElementRef.current = null;
        audioSourceNodeRef.current = null;
        setIsTalking(false);
        isTalkingRef.current = false;
        setActiveEmotion('calm');
        setActiveTags(['calm']);
        setActiveHeadClass('');
        setActiveGesture('hands_down');
        setLeftHand('down');
        setRightHand('down');
        setIsWaving(false);

        setTimeout(() => {
          setSpeechBubbleText('');
          setUserSpeechText('');
        }, 2500);

        // Auto-resume microphone listening immediately after Kindy finishes speaking
        if (!isMutedRef.current && document.visibilityState !== 'hidden') {
          isListeningRef.current = false;
          startListeningRef.current?.();
        }
      };

      // Stop any existing playback
      if (audioElementRef.current) {
        try { audioElementRef.current.pause(); } catch (e) {}
        audioElementRef.current = null;
      }
      if (audioSourceNodeRef.current) {
        try { audioSourceNodeRef.current.stop(); } catch (e) {}
        audioSourceNodeRef.current = null;
      }

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
          source.connect(audioCtx.destination);
          audioSourceNodeRef.current = source; // Keep strong ref to prevent garbage collection

          source.onended = () => {
            audioSourceNodeRef.current = null;
            handlePlaybackEnded();
          };

          source.start(0);
          playedViaWebAudio = true;
          console.log(`🔊 Playing via Web Audio API (duration: ${audioBuffer.duration.toFixed(2)}s)`);
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

    // Stop recording speech if still in progress
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }
    isRecordingSpeechRef.current = false;
    isUserSpeakingRef.current = false;
    setIsUserSpeaking(false);

    // Set immediate thinking gesture & emotion (pure visual)
    express({
      emotion: 'thinking',
      gesture: 'thinking_pose',
      leftHand: 'down',
      rightHand: 'thinking',
      text: 'Thinking...',
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
          if (msg.type === 'chunk') {
            // Keep timeout alive while tokens are actively streaming
            setSafetyTimeout(40000);
            accumulated = msg.accumulated || (accumulated + msg.text);
            const cleanText = accumulated.replace(/\[.*?\]/g, '').trim();
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
            if (msg.audioBase64) {
              playGeminiAudio(msg.audioBase64, msg.mimeType || 'audio/wav', accumulated);
            }
          } else if (msg.type === 'done') {
            // LLM finished. Keep safety timer active for 30s so TTS synthesis can complete!
            setSafetyTimeout(30000);
            setIsGeminiLoading(false);
            isGeminiLoadingRef.current = false;
            setUserSpeechText('');
          } else if (msg.type === 'error') {
            if (safetyTimer) clearTimeout(safetyTimer);
            if (window.__KINDY_WS_LISTENERS__) {
              window.__KINDY_WS_LISTENERS__.delete(turnListener);
            }
            setIsGeminiLoading(false);
            isGeminiLoadingRef.current = false;
            setUserSpeechText('');
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
        ? { type: 'audio', audioBase64, mimeType: mimeType || 'audio/webm', voice }
        : { type: 'prompt', prompt, voice };

      ws.send(JSON.stringify(payload));
      return;
    }

    // HTTP Fallback
    try {
      const res = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, audioBase64, mimeType, voice }),
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
        text: "I couldn't connect to my AI brain just now. Please try again in a second!",
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

  const handleDownloadSVG = () => {
    const svgEl = document.querySelector('#avatar-center-wrapper svg');
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const link = document.createElement('a');
    link.href = svgUrl;
    link.download = `avatar-${config.sex}-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(svgUrl);
  };

  const handleCopyJSX = () => {
    const code = `<Avatar\n  style={{ width: '12rem', height: '12rem' }}\n  {...${JSON.stringify(config, null, 2)}}\n/>`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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



        {micNotice && (
          <div className="mic-notice-badge" onClick={toggleMute}>
            {micNotice}
          </div>
        )}
      </div>

      {/* Main Full Character Area */}
      <div className="avatar-main-hero">
        <div
          id="avatar-center-wrapper"
          className={`full-character-wrapper ${isBouncing ? 'bounce-active' : ''} ${
            isTalking ? 'talking-active' : ''
          } ${activeHeadClass}`}
        >
          <div className="avatar-fullscreen-container">
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

            {/* Symmetrical Two-Hand Waving & Gestures */}
            <WavingHand
              skinColor={config.faceColor}
              shirtColor={config.shirtColor}
              isWaving={isWaving}
              gesture={isTypingMode ? 'typing' : activeGesture}
              leftHand={isTypingMode ? 'typing' : leftHand}
              rightHand={isTypingMode ? 'typing' : rightHand}
              onWave={(side) => {
                if (side === 'left') toggleLeftHand();
                else if (side === 'right') toggleRightHand();
                else setIsWaving(!isWaving);
              }}
              onToggleLeftHand={toggleLeftHand}
              onToggleRightHand={toggleRightHand}
            />

            {/* Laptop Overlay for Typing Mode */}
            {isTypingMode && (
              <div className="laptop-overlay-container">
                <svg viewBox="0 0 200 140" className="laptop-svg">
                  {/* Screen Back */}
                  <path d="M 30 110 L 40 20 C 42 10, 50 5, 60 5 L 140 5 C 150 5, 158 10, 160 20 L 170 110 Z" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="2" />
                  {/* Glowing Logo */}
                  <circle cx="100" cy="55" r="8" fill="#ffffff" className="laptop-glow" />
                  {/* Base Front Edge */}
                  <path d="M 10 130 C 10 135, 15 140, 20 140 L 180 140 C 185 140, 190 135, 190 130 L 175 110 L 25 110 Z" fill="#d1d5db" />
                  <path d="M 10 130 C 10 135, 15 140, 20 140 L 180 140 C 185 140, 190 135, 190 130" fill="none" stroke="#9ca3af" strokeWidth="1" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Single-Line Caption Streamer Bar (Streamable, No Giant Bubble) */}
      {speechBubbleText && (
        <div className="single-line-caption-bar" role="status" aria-live="polite">
          <span className="caption-speaker-tag">Kindy</span>
          <span className="caption-text-stream">{speechBubbleText}</span>
        </div>
      )}

      {/* Floating Minimalist Control Dock: Memoized to isolate from re-renders */}
      <ControlsDock
        onRandomBg={handleRandomBg}
        bgIconColor={currentBg.iconColor}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        isTypingMode={isTypingMode}
        onToggleTyping={() => setIsTypingMode(prev => !prev)}
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
  isTypingMode,
  onToggleTyping,
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

      {/* 3. Mute / Mic Button */}
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

      {/* Typing Mode Button */}
      <button
        type="button"
        className={`dock-control-btn typing-toggle-btn ${isTypingMode ? 'active' : ''}`}
        onClick={onToggleTyping}
        title="Toggle Typing Mode"
        style={isTypingMode ? { background: '#e0e7ff', color: '#4f46e5' } : {}}
      >
        <Laptop size={19} className="dock-icon" />
        <span>Typing</span>
      </button>

      {/* 4. Fullscreen Button */}
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
