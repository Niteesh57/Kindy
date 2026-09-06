import React from 'react';

/**
 * ExpressionFaceOverlay
 * Renders expressive eyebrows, dramatic cartoon eyes, blush, emotes, and mouths
 * perfectly aligned with react-nice-avatar face features & glasses frames in 3/4 perspective.
 *
 * Coordinates (500x500):
 * - Left Eye:    cx = 224, cy = 252 (LOCKED - perfectly centered in left lens)
 * - Right Eye:   cx = 312, cy = 248 (LOCKED - perfectly centered in right lens)
 * - Left Brow:   cx = 222, cy = 227 (lowered closer to upper glasses rim)
 * - Right Brow:  cx = 312, cy = 223 (lowered closer to upper glasses rim)
 * - Nose tip:    cx = 272, cy = 274 (from react-nice-avatar)
 * - Mouth:       cx = 272, cy = 322 (centered directly under nose)
 * - Cheeks:      cx = 222, cy = 306 and cx = 330, cy = 300 (lowered cleanly below glasses rims)
 */
export default function ExpressionFaceOverlay({
  expression = 'happy',
  tags = null,
  isTalking = false,
  talkingFrame = 0,
  mouthEnergy = 0,
}) {
  const rawList = tags || expression;
  const tagList = (Array.isArray(rawList) ? rawList : String(rawList || 'happy').split(/[,+\s]+/))
    .map((t) => String(t).trim().toLowerCase().replace(/[\s-]+/g, '_'))
    .filter(Boolean);

  const hasTag = (patterns) => patterns.some((p) => tagList.includes(p));

  // Categorize emotion types (multi-layer composable)
  const isExcited = hasTag([
    'excited', 'excitedly', 'celebrating', 'amazed', 'delighted'
  ]);

  const isPlayful = hasTag([
    'playful', 'joyful', 'delighted', 'amused', 'cheerful'
  ]);

  const isCalm = hasTag(['calm', 'peaceful', 'relaxed', 'neutral', 'default', 'straight', 'idle']);

  const isHappy = hasTag([
    'happy', 'cheerful', 'content', 'playful', 'amused', 'grateful',
    'friendly', 'proud', 'proudly', 'hopeful', 'joyful'
  ]) && !isCalm;

  const isThinking = hasTag([
    'thinking', 'thoughtfully', 'pondering', 'considering', 'reflecting',
    'concentrating', 'remembering', 'deep_in_thought', 'processing',
    'trying_to_remember', 'recalling', 'analytically', 'carefully', 'deliberately', 'contemplative'
  ]);

  const isThoughtCloud = hasTag([
    'thoughtfully', 'thinking', 'pondering', 'considering', 'reflecting',
    'concentrating', 'remembering', 'deep_in_thought', 'processing',
    'trying_to_remember', 'recalling', 'contemplative'
  ]);

  const isRealizing = hasTag(['realizing', 'figuring_it_out', 'idea', 'eureka', 'aha']);

  const isCrying = hasTag(['crying', 'sobbing', 'whimpering', 'sniffles']);

  const isSad = hasTag([
    'sad', 'upset', 'disappointed', 'heartbroken', 'guilty', 'reluctantly'
  ]);

  const isAngry = hasTag([
    'angry', 'furious', 'annoyed', 'frustrated', 'irritated',
    'serious', 'seriously', 'stern', 'firm', 'benchmark', 'fierce'
  ]);

  const isAfraid = hasTag([
    'afraid', 'scared', 'fearful', 'nervous', 'anxious', 'panicked', 'worried'
  ]);

  const isSurprised = hasTag(['surprised', 'shocked', 'astonished']);

  const isConfused = hasTag([
    'confused', 'curious', 'intrigued', 'suspicious', 'skeptical',
    'uncertain', 'unsure', 'hesitating'
  ]);

  const isUnsure = hasTag([
    'unsure', 'uncertain', 'confused', 'curious', 'intrigued', 'suspicious',
    'skeptical', 'hesitating'
  ]);

  const isBored = hasTag(['bored', 'tired', 'sleepy', 'yawns']);

  const isSarcastic = hasTag([
    'sarcastic', 'sarcastically', 'mischievous', 'teasingly', 'cheekily',
    'wryly', 'deadpan'
  ]);

  const isLoving = hasTag([
    'loving', 'affectionate', 'shy', 'embarrassed', 'sympathetic', 'empathetic'
  ]);

  const isWhispering = hasTag(['whispers', 'softly', 'quietly']);

  const effectivelyTalking = isTalking || hasTag(['talking', 'talk', 'speaking', 'saying']);

  return (
    <div className="expression-face-container">
      <svg
        viewBox="0 0 500 500"
        className="expression-face-svg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* =========================================================
            1. CHEEK BLUSH (Lowered cleanly below glasses rims)
           ========================================================= */}
        {(isHappy || isExcited || isLoving || isWhispering) && (
          <g className="blush-layer">
            <ellipse
              cx="222"
              cy="306"
              rx="16"
              ry="9"
              fill="#ff6b8b"
              opacity={isLoving ? 0.65 : 0.42}
              transform="rotate(-6 222 306)"
            />
            <ellipse
              cx="330"
              cy="300"
              rx="16"
              ry="9"
              fill="#ff6b8b"
              opacity={isLoving ? 0.65 : 0.42}
              transform="rotate(-6 330 300)"
            />
            {/* Cute blush tick lines */}
            <line x1="216" y1="302" x2="220" y2="310" stroke="#e11d48" strokeWidth="2.4" strokeLinecap="round" opacity="0.6" />
            <line x1="223" y1="301" x2="227" y2="309" stroke="#e11d48" strokeWidth="2.4" strokeLinecap="round" opacity="0.6" />
            <line x1="324" y1="296" x2="328" y2="304" stroke="#e11d48" strokeWidth="2.4" strokeLinecap="round" opacity="0.6" />
            <line x1="331" y1="295" x2="335" y2="303" stroke="#e11d48" strokeWidth="2.4" strokeLinecap="round" opacity="0.6" />
          </g>
        )}

        {/* =========================================================
            2. EYEBROWS LAYER (Brought little downside towards eyes)
           ========================================================= */}
        <g className="eyebrows-layer">
          {/* ANGRY / FURIOUS: Sharp aggressive V-brows sloping inward */}
          {isAngry && (
            <>
              <path d="M 200 219 L 244 237" stroke="#171921" strokeWidth="5.5" strokeLinecap="round" />
              <path d="M 334 215 L 290 233" stroke="#171921" strokeWidth="5.5" strokeLinecap="round" />
            </>
          )}

          {/* SAD / CRYING / GUILTY: Downturned sorrowful brows */}
          {(isSad || isCrying) && !isAngry && (
            <>
              <path d="M 202 237 C 214 227 230 221 242 219" stroke="#171921" strokeWidth="5" strokeLinecap="round" />
              <path d="M 332 233 C 320 223 304 217 292 215" stroke="#171921" strokeWidth="5" strokeLinecap="round" />
            </>
          )}

          {/* THINKING / PONDERING / CONCENTRATING: Asymmetric contemplation */}
          {(isThinking || isConfused || isSarcastic) && !isAngry && !isSad && !isCrying && (
            <>
              {/* Left brow: lowered flat furrow */}
              <path d="M 202 233 L 242 231" stroke="#171921" strokeWidth="5" strokeLinecap="round" />
              {/* Right brow: arched high in deep curiosity */}
              <path d="M 292 225 C 304 207 324 207 336 219" stroke="#171921" strokeWidth="5.5" strokeLinecap="round" />
            </>
          )}

          {/* SURPRISED / SHOCKED / REALIZING / AFRAID: High vaulted raised arches */}
          {(isSurprised || isRealizing || isAfraid) && !isAngry && (
            <>
              <path d="M 202 219 C 214 203 232 203 244 215" stroke="#171921" strokeWidth="5" strokeLinecap="round" />
              <path d="M 290 215 C 302 199 320 199 332 211" stroke="#171921" strokeWidth="5" strokeLinecap="round" />
            </>
          )}

          {/* BORED / SLEEPY: Flat heavy unamused brows */}
          {isBored && !isAngry && !isSad && (
            <>
              <path d="M 202 229 L 242 227" stroke="#171921" strokeWidth="5" strokeLinecap="round" />
              <path d="M 292 225 L 332 223" stroke="#171921" strokeWidth="5" strokeLinecap="round" />
            </>
          )}

          {/* HAPPY / CHEERFUL / EXCITED / DEFAULT: Warm friendly arches */}
          {!isAngry && !isSad && !isCrying && !isThinking && !isConfused && !isSarcastic && !isSurprised && !isRealizing && !isAfraid && !isBored && (
            <>
              <path d="M 202 227 C 214 215 232 215 244 225" stroke="#171921" strokeWidth="5" strokeLinecap="round" />
              <path d="M 290 223 C 302 211 320 211 332 221" stroke="#171921" strokeWidth="5" strokeLinecap="round" />
            </>
          )}
        </g>

        {/* =========================================================
            3. EYES LAYER (LOCKED EXACTLY - Left 224, 252; Right 312, 248)
           ========================================================= */}
        <g className="eyes-layer natural-blinking-eyes">
          {/* 1. HAPPY / LOVING: Closed cute curved anime crescents ^ ^ */}
          {(isHappy || isLoving) && !isExcited && !isSurprised && (
            <>
              <path d="M 208 256 C 216 242 232 242 240 254" stroke="#171921" strokeWidth="5.5" strokeLinecap="round" />
              <path d="M 296 252 C 304 238 320 238 328 250" stroke="#171921" strokeWidth="5.5" strokeLinecap="round" />
              {/* Eyelash ticks */}
              <line x1="239" y1="252" x2="245" y2="248" stroke="#171921" strokeWidth="3" strokeLinecap="round" />
              <line x1="327" y1="248" x2="333" y2="244" stroke="#171921" strokeWidth="3" strokeLinecap="round" />
            </>
          )}

          {/* 2. EXCITED: Sparkling golden star eyes ✨ */}
          {isExcited && (
            <>
              {/* Left Star Eye */}
              <g transform="translate(224, 252)">
                <path d="M 0 -16 L 3 -5 L 14 0 L 3 5 L 0 16 L -3 5 L -14 0 L -3 -5 Z" fill="#fbbf24" stroke="#171921" strokeWidth="2.5" />
                <circle cx="0" cy="0" r="3.5" fill="#ffffff" />
              </g>
              {/* Right Star Eye */}
              <g transform="translate(312, 248)">
                <path d="M 0 -16 L 3 -5 L 14 0 L 3 5 L 0 16 L -3 5 L -14 0 L -3 -5 Z" fill="#fbbf24" stroke="#171921" strokeWidth="2.5" />
                <circle cx="0" cy="0" r="3.5" fill="#ffffff" />
              </g>
              {/* Extra cute sparkle stars */}
              <path d="M 200 236 L 202 231 L 207 233 L 202 235 Z" fill="#fbbf24" />
              <path d="M 334 232 L 336 227 L 341 229 L 336 231 Z" fill="#fbbf24" />
            </>
          )}

          {/* 3. THINKING: Eyes looking up-and-to-the-right! */}
          {isThinking && (
            <>
              {/* Left Eye */}
              <ellipse cx="224" cy="252" rx="12" ry="15" fill="#ffffff" stroke="#171921" strokeWidth="3" transform="rotate(-6.7 224 252)" />
              <ellipse cx="230" cy="246" rx="8" ry="10" fill="#171921" />
              <circle cx="232" cy="243" r="3" fill="#ffffff" />

              {/* Right Eye */}
              <ellipse cx="312" cy="248" rx="12" ry="15" fill="#ffffff" stroke="#171921" strokeWidth="3" transform="rotate(-6.3 312 248)" />
              <ellipse cx="318" cy="242" rx="8" ry="10" fill="#171921" />
              <circle cx="320" cy="239" r="3" fill="#ffffff" />
            </>
          )}

          {/* 4. SURPRISED / SHOCKED / REALIZING / AFRAID: Big wide shocked eyes */}
          {(isSurprised || isRealizing || isAfraid) && (
            <>
              <circle cx="224" cy="252" r="16" fill="#ffffff" stroke="#171921" strokeWidth="4" />
              <circle cx="224" cy="252" r="6" fill="#171921" />
              <circle cx="226" cy="250" r="2" fill="#ffffff" />

              <circle cx="312" cy="248" r="16" fill="#ffffff" stroke="#171921" strokeWidth="4" />
              <circle cx="312" cy="248" r="6" fill="#171921" />
              <circle cx="314" cy="246" r="2" fill="#ffffff" />
            </>
          )}

          {/* 5. CRYING: Squeezed eyes with streaming waterfall tears 💧 */}
          {isCrying && (
            <>
              <path d="M 210 254 C 218 244 232 244 240 256" stroke="#171921" strokeWidth="5.5" strokeLinecap="round" />
              <path d="M 298 250 C 306 240 320 240 328 252" stroke="#171921" strokeWidth="5.5" strokeLinecap="round" />

              {/* Streaming Tears flowing down cheeks */}
              <path
                d="M 214 258 C 208 276 208 306 216 318 C 224 306 228 276 224 258 Z"
                fill="#38bdf8"
                opacity="0.88"
                className="tear-stream"
              />
              <path
                d="M 316 254 C 310 272 310 302 318 314 C 326 302 330 272 326 254 Z"
                fill="#38bdf8"
                opacity="0.88"
                className="tear-stream"
              />
              {/* Falling tear drops */}
              <circle cx="216" cy="330" r="4.5" fill="#38bdf8" opacity="0.8" />
              <circle cx="318" cy="326" r="4.5" fill="#38bdf8" opacity="0.8" />
            </>
          )}

          {/* 6. ANGRY: Fierce slanted glaring eyes */}
          {isAngry && (
            <>
              <ellipse cx="224" cy="252" rx="12" ry="9" fill="#171921" transform="rotate(10 224 252)" />
              <circle cx="227" cy="250" r="2.5" fill="#ffffff" />
              <path d="M 206 247 L 242 254" stroke="#171921" strokeWidth="3.5" strokeLinecap="round" />

              <ellipse cx="312" cy="248" rx="12" ry="9" fill="#171921" transform="rotate(-10 312 248)" />
              <circle cx="315" cy="246" r="2.5" fill="#ffffff" />
              <path d="M 330 243 L 294 250" stroke="#171921" strokeWidth="3.5" strokeLinecap="round" />
            </>
          )}

          {/* 7. BORED / SLEEPY: Half-closed heavy eyelids */}
          {isBored && (
            <>
              <path d="M 208 252 L 240 252" stroke="#171921" strokeWidth="5" strokeLinecap="round" />
              <ellipse cx="224" cy="256" rx="7" ry="5" fill="#171921" />
              <path d="M 296 248 L 328 248" stroke="#171921" strokeWidth="5" strokeLinecap="round" />
              <ellipse cx="312" cy="252" rx="7" ry="5" fill="#171921" />
            </>
          )}

          {/* 8. SARCASTIC / SKEPTICAL: Mischievous side-glance */}
          {isSarcastic && (
            <>
              <ellipse cx="224" cy="252" rx="12" ry="11" fill="#ffffff" stroke="#171921" strokeWidth="2.5" />
              <ellipse cx="218" cy="252" rx="7" ry="9" fill="#171921" />
              <circle cx="216" cy="249" r="2.5" fill="#ffffff" />

              <ellipse cx="312" cy="248" rx="12" ry="11" fill="#ffffff" stroke="#171921" strokeWidth="2.5" />
              <ellipse cx="306" cy="248" rx="7" ry="9" fill="#171921" />
              <circle cx="304" cy="245" r="2.5" fill="#ffffff" />
            </>
          )}

          {/* 9. SAD (Non-crying): Drooping glossy eyes */}
          {isSad && !isCrying && (
            <>
              <ellipse cx="224" cy="253" rx="11" ry="14" fill="#171921" transform="rotate(6 224 253)" />
              <circle cx="227" cy="250" r="4" fill="#ffffff" />
              <circle cx="222" cy="259" r="2.5" fill="#ffffff" opacity="0.8" />

              <ellipse cx="312" cy="249" rx="11" ry="14" fill="#171921" transform="rotate(-6 312 249)" />
              <circle cx="315" cy="246" r="4" fill="#ffffff" />
              <circle cx="310" cy="255" r="2.5" fill="#ffffff" opacity="0.8" />
            </>
          )}

          {/* 10. DEFAULT / CALM / STRAIGHT: Clean expressive open cartoon eyes looking straight at us */}
          {((!isHappy && !isExcited && !isThinking && !isSurprised && !isRealizing && !isCrying && !isAngry && !isBored && !isSarcastic && !isSad && !isLoving) || isCalm) && (
            <>
              <ellipse cx="224" cy="252" rx="11" ry="15" fill="#171921" transform="rotate(-6.7 224 252)" />
              <circle cx="227" cy="248" r="4" fill="#ffffff" />
              <circle cx="222" cy="256" r="2" fill="#ffffff" opacity="0.6" />

              <ellipse cx="312" cy="248" rx="11" ry="15" fill="#171921" transform="rotate(-6.3 312 248)" />
              <circle cx="315" cy="244" r="4" fill="#ffffff" />
              <circle cx="310" cy="252" r="2" fill="#ffffff" opacity="0.6" />
            </>
          )}
        </g>

        {/* =========================================================
            4. EMOTE EFFECTS (Thought Cloud, Idea Lightbulb, Question Mark, Joyful Notes, Vein, Sweat, Zzz)
           ========================================================= */}
        {/* Realizing / Idea: Glowing bright lightbulb 💡 */}
        {isRealizing && (
          <g className="emote-pop" transform="translate(272, 95)">
            <circle cx="0" cy="0" r="18" fill="#fde047" stroke="#171921" strokeWidth="3.5" />
            <rect x="-7" y="15" width="14" height="7" rx="2" fill="#78716c" stroke="#171921" strokeWidth="2.5" />
            <line x1="-4" y1="26" x2="4" y2="26" stroke="#171921" strokeWidth="2.5" strokeLinecap="round" />
            {/* Radiant Sparkle Rays */}
            <line x1="0" y1="-22" x2="0" y2="-30" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="-18" y1="-14" x2="-25" y2="-20" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="18" y1="-14" x2="25" y2="-20" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="-22" y1="6" x2="-30" y2="8" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="22" y1="6" x2="30" y2="8" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        )}

        {/* Thoughtfully / Thinking / Pondering: Animated Floating Thought Cloud 💭 */}
        {isThoughtCloud && (
          <g className="thought-cloud-layer">
            {/* Rising thought bubbles */}
            <circle cx="334" cy="172" r="5" fill="#ffffff" stroke="#171921" strokeWidth="2.8" />
            <circle cx="346" cy="152" r="7.5" fill="#ffffff" stroke="#171921" strokeWidth="2.8" />
            <circle cx="359" cy="130" r="10.5" fill="#ffffff" stroke="#171921" strokeWidth="3" />

            {/* Fluffy thought cloud body */}
            <g className="thought-cloud-body">
              <path
                d="M 372 108 
                   A 16 16 0 0 1 392 92 
                   A 20 20 0 0 1 426 95 
                   A 17 17 0 0 1 442 112 
                   A 16 16 0 0 1 436 134 
                   A 20 20 0 0 1 396 138 
                   A 17 17 0 0 1 368 124 
                   A 14 14 0 0 1 372 108 Z"
                fill="#ffffff"
                stroke="#171921"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
              {/* Three animated thinking dots inside cloud */}
              <circle cx="392" cy="116" r="3.5" fill="#6366f1" className="thought-dot dot-1" />
              <circle cx="405" cy="116" r="3.5" fill="#6366f1" className="thought-dot dot-2" />
              <circle cx="418" cy="116" r="3.5" fill="#6366f1" className="thought-dot dot-3" />
            </g>
          </g>
        )}

        {/* Unsure / Uncertain / Confused: Expressive Cartoon Question Mark ❓ */}
        {isUnsure && (
          <g className="emote-pop emote-question-mark" transform="translate(362, 114) rotate(10)">
            {/* Primary bold question mark */}
            <path
              d="M -13 -26 C -13 -40 15 -40 15 -26 C 15 -14 -1 -12 -1 0"
              fill="none"
              stroke="#171921"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M -13 -26 C -13 -40 15 -40 15 -26 C 15 -14 -1 -12 -1 0"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="4.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="-1" cy="13" r="3.8" fill="#171921" />
            <circle cx="-1" cy="13" r="2.6" fill="#8b5cf6" />

            {/* Secondary smaller question mark */}
            <path
              d="M 20 -14 C 20 -23 35 -23 35 -14 C 35 -6 26 -5 26 2"
              fill="none"
              stroke="#171921"
              strokeWidth="4.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 20 -14 C 20 -23 35 -23 35 -14 C 35 -6 26 -5 26 2"
              fill="none"
              stroke="#ec4899"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="26" cy="11" r="2.2" fill="#ec4899" />
          </g>
        )}

        {/* Playful / Joyful: Floating musical notes & sparkles 🎶 ✨ */}
        {isPlayful && (
          <g className="emote-pop emote-playful-group">
            {/* Pink musical note left */}
            <g transform="translate(182, 154) rotate(-14)">
              <ellipse cx="0" cy="0" rx="6.5" ry="4.5" fill="#f43f5e" stroke="#171921" strokeWidth="2.2" transform="rotate(-22)" />
              <line x1="5" y1="-1" x2="5" y2="-22" stroke="#171921" strokeWidth="3" strokeLinecap="round" />
              <line x1="5" y1="-1" x2="5" y2="-22" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
              <path d="M 5 -22 C 12 -20 16 -14 16 -8" fill="none" stroke="#171921" strokeWidth="3" strokeLinecap="round" />
              <path d="M 5 -22 C 12 -20 16 -14 16 -8" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* Purple double note right */}
            <g transform="translate(362, 130) rotate(12)">
              <ellipse cx="0" cy="0" rx="6" ry="4.5" fill="#8b5cf6" stroke="#171921" strokeWidth="2.2" transform="rotate(-20)" />
              <ellipse cx="16" cy="-3" rx="6" ry="4.5" fill="#8b5cf6" stroke="#171921" strokeWidth="2.2" transform="rotate(-20)" />
              <line x1="5" y1="-1" x2="5" y2="-22" stroke="#171921" strokeWidth="2.8" strokeLinecap="round" />
              <line x1="21" y1="-4" x2="21" y2="-25" stroke="#171921" strokeWidth="2.8" strokeLinecap="round" />
              <polygon points="4,-20 22,-23 22,-18 4,-15" fill="#8b5cf6" stroke="#171921" strokeWidth="1.5" />
            </g>

            {/* Joyful gold sparkle stars */}
            <path d="M 386 160 L 388 154 L 394 156 L 389 159 Z" fill="#fbbf24" stroke="#171921" strokeWidth="1.2" />
            <path d="M 166 176 L 168 170 L 174 172 L 169 175 Z" fill="#fbbf24" stroke="#171921" strokeWidth="1.2" />
          </g>
        )}

        {/* Loving / Affectionate: Floating Heart 💕 */}
        {isLoving && (
          <g className="emote-pop" transform="translate(360, 126) rotate(12)">
            <path
              d="M 0 4 C -7 -6 -16 1 -10 10 C -4 18 0 22 0 22 C 0 22 4 18 10 10 C 16 1 7 -6 0 4 Z"
              fill="#f43f5e"
              stroke="#171921"
              strokeWidth="2.5"
            />
          </g>
        )}

        {/* Angry: Red anger vein 💢 */}
        {isAngry && (
          <g className="emote-pop" transform="translate(328, 176)">
            <path
              d="M -7 -7 L -7 7 M 7 -7 L 7 7 M -7 -7 L 7 -7 M -7 7 L 7 7"
              stroke="#ef4444"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* Afraid / Nervous: Cyan sweat drop 💧 on temple */}
        {isAfraid && (
          <path
            d="M 342 208 C 336 216 332 226 336 234 C 340 240 350 238 353 230 C 356 221 348 211 342 208 Z"
            fill="#38bdf8"
            stroke="#171921"
            strokeWidth="3"
            className="emote-pop"
          />
        )}

        {/* Sleepy / Bored: Floating Zzz 💤 */}
        {isBored && (
          <g className="emote-pop" transform="translate(332, 176)">
            <text x="0" y="0" fill="#6366f1" fontSize="18" fontWeight="800" fontFamily="sans-serif">Z</text>
            <text x="10" y="-11" fill="#818cf8" fontSize="14" fontWeight="800" fontFamily="sans-serif">z</text>
            <text x="20" y="-20" fill="#a5b4fc" fontSize="11" fontWeight="800" fontFamily="sans-serif">z</text>
          </g>
        )}

        {/* =========================================================
            5. DYNAMIC EMOTIONAL MOUTH (Centered at cx = 272, cy = 322, directly under nose in 3/4 perspective)
           ========================================================= */}
        <g className="mouth-layer">
          {effectivelyTalking ? (
            /* Audio-Driven Viseme Mouth: Scales & morphs smoothly with real speech energy */
            mouthEnergy < 0.08 ? (
              /* Silence / natural pause between words: mouth closes naturally in conversational resting position */
              <path
                d="M 256 322 C 264 324 280 324 288 322"
                stroke="#171921"
                strokeWidth="4"
                strokeLinecap="round"
              />
            ) : mouthEnergy < 0.32 ? (
              /* Gentle / Consonant speech (p, b, m, s, t): slight open parting */
              <g transform="translate(272, 322)">
                <path
                  d="M -16 -2 C -10 8 10 8 16 -2 C 10 -4 -10 -4 -16 -2 Z"
                  fill="#171921"
                  stroke="#171921"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />
                <line x1="-10" y1="-1" x2="10" y2="-1" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              </g>
            ) : mouthEnergy < 0.65 ? (
              /* Medium Vowel / Syllable pronunciation (e, i, o): open mouth with visible teeth and tongue */
              <g transform="translate(272, 322)">
                <path
                  d="M -20 -4 C -12 16 12 16 20 -4 C 12 -6 -12 -6 -20 -4 Z"
                  fill="#171921"
                  stroke="#171921"
                  strokeWidth="3.2"
                  strokeLinejoin="round"
                />
                <path d="M -12 -3 C -6 -1 6 -1 12 -3 L 9 0 C 4 1 -4 1 -9 0 Z" fill="#ffffff" />
                <ellipse cx="0" cy="7" rx="8" ry="4.5" fill="#f43f5e" />
              </g>
            ) : (
              /* Strong / Open Vowel accentuation (ah, wow, excited): full expressive open mouth */
              <g transform="translate(272, 322)">
                <path
                  d="M -23 -5 C -15 24 15 24 23 -5 C 15 -8 -15 -8 -23 -5 Z"
                  fill="#171921"
                  stroke="#171921"
                  strokeWidth="3.6"
                  strokeLinejoin="round"
                />
                <path d="M -14 -4 C -8 -2 8 -2 14 -4 L 11 0 C 6 1 -6 1 -11 0 Z" fill="#ffffff" />
                <ellipse cx="0" cy="11" rx="10" ry="6.5" fill="#f43f5e" />
              </g>
            )
          ) : (
            /* NON-TALKING STATIC EMOTIONAL MOUTHS */
            <>
              {/* 1. HAPPY / CHEERFUL / EXCITED: Joyful open laugh with tongue */}
              {(isHappy || isExcited) && (
                <g transform="translate(272, 320)">
                  <path
                    d="M -22 -5 C -14 24 14 24 22 -5 C 13 -8 -13 -8 -22 -5 Z"
                    fill="#171921"
                    stroke="#171921"
                    strokeWidth="3.8"
                    strokeLinejoin="round"
                  />
                  <ellipse cx="0" cy="10" rx="11" ry="7" fill="#f43f5e" />
                </g>
              )}

              {/* 2. SURPRISED / SHOCKED / REALIZING: Big round open gasp :O */}
              {(isSurprised || isRealizing) && (
                <g>
                  <ellipse cx="272" cy="322" rx="11" ry="16" fill="#171921" stroke="#171921" strokeWidth="3.5" />
                  <ellipse cx="272" cy="328" rx="6" ry="6" fill="#f43f5e" />
                </g>
              )}

              {/* 3. THINKING / SKEPTICAL: Pursed sideways smirk ~ */}
              {(isThinking || isConfused || isSarcastic) && (
                <path
                  d="M 255 320 C 265 323 278 315 289 317"
                  stroke="#171921"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
              )}

              {/* 4. SAD / DISAPPOINTED / HEARTBROKEN: Downturned sad frown */}
              {isSad && !isCrying && (
                <path
                  d="M 254 328 C 263 316 281 316 290 328"
                  stroke="#171921"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
              )}

              {/* 5. CRYING: Trembling open wail */}
              {isCrying && (
                <g transform="translate(272, 324)">
                  <path
                    d="M -20 6 C -14 -12 14 -12 20 6 C 12 11 -12 11 -20 6 Z"
                    fill="#171921"
                    stroke="#171921"
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                  />
                  <ellipse cx="0" cy="1" rx="9" ry="5" fill="#f43f5e" />
                </g>
              )}

              {/* 6. ANGRY: Fierce frown grimace */}
              {isAngry && (
                <path
                  d="M 252 328 C 265 317 279 317 292 328"
                  stroke="#171921"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              )}

              {/* 7. AFRAID / NERVOUS: Wavy quivering mouth */}
              {isAfraid && (
                <path
                  d="M 254 322 C 262 317 270 327 278 320 C 284 317 288 322 290 322"
                  stroke="#171921"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              )}

              {/* 8. BORED: Flat straight line */}
              {isBored && (
                <line x1="257" y1="322" x2="287" y2="322" stroke="#171921" strokeWidth="4.5" strokeLinecap="round" />
              )}

              {/* 9. DEFAULT / CALM / STRAIGHT: Sweet clean straight mouth looking at us */}
              {((!isHappy && !isExcited && !isSurprised && !isRealizing && !isThinking && !isConfused && !isSarcastic && !isSad && !isCrying && !isAngry && !isAfraid && !isBored) || isCalm) && (
                <path
                  d="M 256 321 C 264 325 280 325 288 321"
                  stroke="#171921"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              )}
            </>
          )}
        </g>
      </svg>
    </div>
  );
}
