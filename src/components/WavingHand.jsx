import React from 'react';

export default function WavingHand({
  skinColor = '#F9C9B6',
  shirtColor = '#6366f1',
  isWaving = false,
  gesture = 'wave',
  leftHand,
  rightHand,
  onWave,
  onToggleLeftHand,
  onToggleRightHand,
}) {
  // Resolve gesture shortcuts if explicit leftHand / rightHand are not provided
  let resolvedRight = rightHand;
  let resolvedLeft = leftHand;

  if (!resolvedRight || !resolvedLeft) {
    switch (gesture) {
      case 'say_hi':
      case 'wave_right':
      case 'one_up_one_down':
      case 'right_up_left_down':
        resolvedRight = resolvedRight || (isWaving ? 'wave' : 'up');
        resolvedLeft = resolvedLeft || 'down';
        break;
      case 'wave_left':
      case 'left_up_right_down':
        resolvedRight = resolvedRight || 'down';
        resolvedLeft = resolvedLeft || (isWaving ? 'wave' : 'up');
        break;
      case 'hands_up':
      case 'both_up':
        resolvedRight = resolvedRight || (isWaving ? 'cheer' : 'up');
        resolvedLeft = resolvedLeft || (isWaving ? 'cheer' : 'up');
        break;
      case 'hands_down':
      case 'both_down':
      case 'rest':
        resolvedRight = resolvedRight || 'down';
        resolvedLeft = resolvedLeft || 'down';
        break;
      case 'thinking':
        resolvedRight = resolvedRight || 'thinking';
        resolvedLeft = resolvedLeft || 'down';
        break;
      case 'typing':
        resolvedRight = resolvedRight || 'typing';
        resolvedLeft = resolvedLeft || 'typing';
        break;
      case 'cheer':
        resolvedRight = resolvedRight || 'cheer';
        resolvedLeft = resolvedLeft || 'cheer';
        break;
      case 'wave':
      default:
        resolvedRight = resolvedRight || (isWaving ? 'wave' : 'up');
        resolvedLeft = resolvedLeft || (isWaving ? 'wave' : 'up');
        break;
    }
  }

  const isRightActive = resolvedRight && resolvedRight !== 'down' && resolvedRight !== 'rest' && resolvedRight !== 'none';
  const isLeftActive = resolvedLeft && resolvedLeft !== 'down' && resolvedLeft !== 'rest' && resolvedLeft !== 'none';

  if (!isRightActive && !isLeftActive) {
    return null;
  }

  const getArmClass = (side, pose) => {
    let cls = `forearm-hand-group ${side}-hand`;
    switch (pose) {
      case 'thinking':
        cls += ' pose-thinking';
        break;
      case 'down':
      case 'rest':
        cls += ' pose-down';
        break;
      case 'up':
        cls += ' pose-up';
        break;
      case 'typing':
        cls += ' pose-typing';
        break;
      case 'cheer':
        cls += ` pose-cheer is-waving-cheer-${side}`;
        break;
      case 'wave':
      default:
        cls += ` pose-wave is-waving-${side}`;
        break;
    }
    return cls;
  };

  const rightArmClass = getArmClass('right', resolvedRight);
  const leftArmClass = getArmClass('left', resolvedLeft);

  return (
    <div
      className="connected-arm-overlay"
      title="Click either hand to pose or wave! 👋"
      role="button"
      tabIndex={0}
    >
      <svg
        viewBox="0 0 281 312"
        className="connected-arm-full-svg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* =========================================================
            1. RIGHT SHOULDER SLEEVE & FOREARM
           ========================================================= */}
        {isRightActive && (
          <>
            <path
              d="M 210 275
                 C 220 250 230 238 240 228
                 L 264 228
                 C 274 250 282 280 288 310
                 L 200 310
                 Z"
              fill={shirtColor}
            />
            <path
              d="M 210 275 C 220 250 230 238 240 228"
              stroke="#171921"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M 264 228 C 274 250 282 280 288 310"
              stroke="#171921"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <ellipse
              cx="252"
              cy="228"
              rx="14"
              ry="6"
              transform="rotate(-8 252 228)"
              fill={shirtColor}
              stroke="#171921"
              strokeWidth="3.8"
            />
            <ellipse
              cx="252"
              cy="228"
              rx="10"
              ry="4"
              transform="rotate(-8 252 228)"
              fill="#171921"
              opacity="0.25"
            />

            <g
              className={rightArmClass}
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleRightHand) onToggleRightHand();
                else if (onWave) onWave('right');
              }}
              title="Click right hand to pose or wave! ✋"
            >
              <path
                d="
                  M 242 228
                  L 242 186
                  C 237 182 230 176 227 168
                  C 223 160 228 154 235 155
                  C 240 156 245 164 247 172
                  L 246 148
                  C 246 138 255 138 256 148
                  L 256 158
                  C 257 148 258 132 264 126
                  C 270 120 277 124 276 135
                  L 275 156
                  C 277 148 279 138 285 134
                  C 290 130 296 134 295 144
                  L 292 162
                  C 295 155 298 150 303 153
                  C 307 156 306 166 300 174
                  C 292 186 282 204 262 228
                  Z
                "
                fill={skinColor}
                stroke="#171921"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 245 173 C 242 167 238 163 234 163"
                stroke="#171921"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              <g className="wave-motion-lines">
                <path
                  d="M 218 145 C 214 150 214 158 220 164"
                  stroke="#6366f1"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M 308 128 C 314 134 316 142 312 150"
                  stroke="#6366f1"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </g>
            </g>
          </>
        )}

        {/* =========================================================
            2. LEFT SHOULDER SLEEVE & FOREARM
           ========================================================= */}
        {isLeftActive && (
          <>
            <path
              d="M 71 275
                 C 61 250 51 238 41 228
                 L 17 228
                 C 7 250 -1 280 -7 310
                 L 81 310
                 Z"
              fill={shirtColor}
            />
            <path
              d="M 71 275 C 61 250 51 238 41 228"
              stroke="#171921"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M 17 228 C 7 250 -1 280 -7 310"
              stroke="#171921"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <ellipse
              cx="29"
              cy="228"
              rx="14"
              ry="6"
              transform="rotate(8 29 228)"
              fill={shirtColor}
              stroke="#171921"
              strokeWidth="3.8"
            />
            <ellipse
              cx="29"
              cy="228"
              rx="10"
              ry="4"
              transform="rotate(8 29 228)"
              fill="#171921"
              opacity="0.25"
            />

            <g
              className={leftArmClass}
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleLeftHand) onToggleLeftHand();
                else if (onWave) onWave('left');
              }}
              title="Click left hand to pose or wave! ✋"
            >
              <path
                d="
                  M 39 228
                  L 39 186
                  C 44 182 51 176 54 168
                  C 58 160 53 154 46 155
                  C 41 156 36 164 34 172
                  L 35 148
                  C 35 138 26 138 25 148
                  L 25 158
                  C 24 148 23 132 17 126
                  C 11 120 4 124 5 135
                  L 6 156
                  C 4 148 2 138 -4 134
                  C -9 130 -15 134 -14 144
                  L -11 162
                  C -14 155 -17 150 -22 153
                  C -26 156 -25 166 -19 174
                  C -11 186 -1 204 19 228
                  Z
                "
                fill={skinColor}
                stroke="#171921"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 36 173 C 39 167 43 163 47 163"
                stroke="#171921"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              <g className="wave-motion-lines">
                <path
                  d="M 63 145 C 67 150 67 158 61 164"
                  stroke="#6366f1"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M -27 128 C -33 134 -35 142 -31 150"
                  stroke="#6366f1"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </g>
            </g>
          </>
        )}
      </svg>
    </div>
  );
}
