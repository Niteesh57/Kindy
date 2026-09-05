import { EXPRESSION_SCHEMA } from '../constants/expressionSchema';

// Normalize a tag string (e.g. "very fast" -> "very_fast")
export function normalizeTag(tag) {
  return tag
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
}

// Find definition of a tag across all schema categories
export function findTagDefinition(rawTag) {
  const normalized = normalizeTag(rawTag);

  // Common aliases
  const aliasMap = {
    happy: 'happy',
    happily: 'happy',
    excited: 'excited',
    excitedly: 'excitedly',
    whisper: 'whispers',
    whispering: 'whispers',
    laugh: 'laughs',
    laughing: 'laughs',
    giggle: 'giggles',
    giggling: 'giggles',
    cry: 'crying',
    sobbing: 'crying',
    think: 'thinking',
    hesitates: 'uncertain',
    hesitating: 'uncertain',
    pauses: 'uncertain',
    robot: 'robot',
    cartoon: 'cartoon',
    slow: 'slowly',
    fast: 'fast',
    very_slow: 'very_slow',
    very_fast: 'very_fast',
    hands_up: 'hands_up',
    both_up: 'hands_up',
    hand_up: 'say_hi',
    hands_down: 'hands_down',
    both_down: 'hands_down',
    hand_down: 'hands_down',
    say_hi: 'say_hi',
    hi: 'say_hi',
    hello: 'say_hi',
    wave_right: 'wave_right',
    wave_left: 'wave_left',
    one_up_one_down: 'say_hi',
    thinking_pose: 'thinking_pose',
  };

  const lookupKey = aliasMap[normalized] || normalized;

  for (const category of Object.values(EXPRESSION_SCHEMA)) {
    if (category[lookupKey]) {
      return category[lookupKey];
    }
  }
  return null;
}

// Merge multiple tags into a unified state
export function mergeTags(tags) {
  const merged = {
    face: { eyeStyle: 'oval', mouthStyle: 'smile' },
    headClass: 'head-gentle-nod',
    gesture: 'wave',
    voice: { pitch: 1.0, rate: 1.0, volume: 1.0 },
    soundPrefix: '',
    tags: tags || [],
    emojiList: [],
  };

  if (!tags || tags.length === 0) {
    return merged;
  }

  tags.forEach((rawTag) => {
    const def = findTagDefinition(rawTag);
    if (!def) return;

    if (def.emoji) merged.emojiList.push(def.emoji);
    if (def.face) merged.face = { ...merged.face, ...def.face };
    if (def.headClass) merged.headClass = def.headClass;
    if (def.gesture) merged.gesture = def.gesture;
    if (def.soundPrefix) merged.soundPrefix = def.soundPrefix;

    if (def.voice) {
      if (def.voice.pitch !== undefined) merged.voice.pitch = def.voice.pitch;
      if (def.voice.rate !== undefined) merged.voice.rate = def.voice.rate;
      if (def.voice.volume !== undefined) merged.voice.volume = def.voice.volume;
    }
  });

  return merged;
}

// Parse text containing bracket tags into executable expression segments
// e.g. "[thinking] Hmm... [realizing, excited] Ah got it!"
export function parseExpressionText(rawText) {
  if (!rawText || !rawText.trim()) {
    return [
      {
        tags: ['friendly'],
        cleanText: 'Hello there! 👋',
        resolved: mergeTags(['friendly']),
      },
    ];
  }

  const tagRegex = /\[(.*?)\]/g;
  const segments = [];
  let lastIndex = 0;
  let currentTags = ['happy'];
  let match;

  while ((match = tagRegex.exec(rawText)) !== null) {
    const textBefore = rawText.slice(lastIndex, match.index).trim();
    if (textBefore) {
      segments.push({
        tags: currentTags,
        cleanText: textBefore,
        resolved: mergeTags(currentTags),
      });
    }

    // Extract tags from bracket "[excitedly, very_fast]"
    const tagContent = match[1];
    currentTags = tagContent
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    lastIndex = tagRegex.lastIndex;
  }

  // Trailing text after last bracket
  const trailingText = rawText.slice(lastIndex).trim();
  if (trailingText) {
    segments.push({
      tags: currentTags,
      cleanText: trailingText,
      resolved: mergeTags(currentTags),
    });
  } else if (segments.length === 0) {
    // If text only contains tags with no words, or just brackets
    segments.push({
      tags: currentTags,
      cleanText: rawText.replace(/\[.*?\]/g, '').trim() || '...',
      resolved: mergeTags(currentTags),
    });
  }

  return segments;
}
