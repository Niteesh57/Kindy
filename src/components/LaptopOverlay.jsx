import React, { useState, useEffect } from 'react';

// Production-grade search operation states with mild Google colors
const SEARCH_OPERATIONS = [
  {
    action: 'Searching...',
    detail: 'Searching knowledge base & web...',
    statusDot: '#4285f4', // Google Blue
    badge: 'SEARCH',
    badgeBg: '#e8f0fe',
    badgeColor: '#1a73e8',
  },
  {
    action: 'Finding...',
    detail: 'Finding accurate results & answers...',
    statusDot: '#34a853', // Google Green
    badge: 'FINDING',
    badgeBg: '#e6f4ea',
    badgeColor: '#137333',
  },
  {
    action: 'Thinking about this...',
    detail: 'Synthesizing context & reasoning...',
    statusDot: '#fbbc04', // Google Yellow
    badge: 'THINKING',
    badgeBg: '#fef7e0',
    badgeColor: '#b06000',
  },
  {
    action: 'Wait, almost there...',
    detail: 'Verifying details & finalizing response...',
    statusDot: '#ea4335', // Google Red
    badge: 'WAIT',
    badgeBg: '#fce8e6',
    badgeColor: '#c5221f',
  },
  {
    action: 'Searching deeper...',
    detail: 'Exploring connections & insights...',
    statusDot: '#4285f4',
    badge: 'SEARCH',
    badgeBg: '#e8f0fe',
    badgeColor: '#1a73e8',
  },
  {
    action: 'Finding best solution...',
    detail: 'Filtering highest quality information...',
    statusDot: '#34a853',
    badge: 'FINDING',
    badgeBg: '#e6f4ea',
    badgeColor: '#137333',
  },
];

export default function LaptopOverlay({ isTalking = false, activeQuery = '' }) {
  const [opIndex, setOpIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  // Cycle smoothly through search operation steps every 2.6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setOpIndex((prev) => (prev + 1) % SEARCH_OPERATIONS.length);
      setAnimKey((prev) => prev + 1);
    }, 2600);

    return () => clearInterval(interval);
  }, []);

  const current = SEARCH_OPERATIONS[opIndex];

  return (
    <div className="laptop-overlay-container">
      <svg viewBox="0 0 240 160" className="laptop-svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          {/* Aluminum Laptop Body Gradient */}
          <linearGradient id="laptopChassisGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="35%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          {/* Clean Production Screen Gradient (Soft Modern Dark Matte) */}
          <linearGradient id="screenMatteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* Soft Google Glow Filter */}
          <filter id="mildGoogleGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Laptop Lid (Silver Aluminum, completely upright/straight) */}
        <rect
          x="15"
          y="10"
          width="210"
          height="132"
          rx="10"
          fill="url(#laptopChassisGrad)"
          stroke="#94a3b8"
          strokeWidth="1.5"
        />

        {/* Outer Edge Highlight */}
        <rect
          x="17"
          y="12"
          width="206"
          height="128"
          rx="8"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1"
          opacity="0.85"
        />

        {/* Top Notch / Opening Grip */}
        <path
          d="M 104 10 L 136 10 L 133 14 L 107 14 Z"
          fill="#94a3b8"
          opacity="0.75"
        />

        {/* ============================================================ */}
        {/* PRODUCTION-GRADE SEARCH DISPLAY SCREEN                        */}
        {/* ============================================================ */}
        <g className="laptop-search-screen">
          {/* Clean OLED / Matte Display Screen Frame */}
          <rect
            x="36"
            y="28"
            width="168"
            height="90"
            rx="10"
            fill="url(#screenMatteGrad)"
            stroke="#334155"
            strokeWidth="1.5"
          />

          {/* Screen Top Status Bar */}
          <rect x="36" y="28" width="168" height="18" rx="10" fill="#0f172a" />
          <line x1="36" y1="46" x2="204" y2="46" stroke="#334155" strokeWidth="0.8" />

          {/* 4 Iconic Google Bouncing Dots (Mild Colors: Blue, Red, Yellow, Green) */}
          <g transform="translate(48, 38)">
            <circle cx="0" cy="0" r="2.8" fill="#4285f4" className="google-dot dot-blue" />
            <circle cx="8" cy="0" r="2.8" fill="#ea4335" className="google-dot dot-red" />
            <circle cx="16" cy="0" r="2.8" fill="#fbbc04" className="google-dot dot-yellow" />
            <circle cx="24" cy="0" r="2.8" fill="#34a853" className="google-dot dot-green" />
          </g>

          {/* Production Mode Badge */}
          <g transform="translate(162, 32)">
            <rect x="0" y="0" width="34" height="12" rx="3" fill={current.badgeBg} />
            <text
              x="17"
              y="8.5"
              fill={current.badgeColor}
              fontSize="5.5"
              fontFamily="system-ui, sans-serif"
              fontWeight="700"
              textAnchor="middle"
              letterSpacing="0.4"
            >
              {current.badge}
            </text>
          </g>

          {/* Center Search Interaction Area */}
          {/* Main Action Word: "Searching...", "Finding...", "Thinking about this...", "Wait..." */}
          <g transform="translate(120, 70)">
            <text
              key={animKey}
              x="0"
              y="0"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="13.5"
              fontFamily="system-ui, -apple-system, Roboto, sans-serif"
              fontWeight="700"
              letterSpacing="0.02em"
              className="search-action-text"
            >
              {current.action}
            </text>
          </g>

          {/* Subtext Detail line */}
          <g transform="translate(120, 84)">
            <text
              key={`sub-${animKey}`}
              x="0"
              y="0"
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="6.2"
              fontFamily="system-ui, sans-serif"
              fontWeight="400"
              className="search-detail-text"
            >
              {activeQuery ? (activeQuery.length > 34 ? `"${activeQuery.slice(0, 34)}..."` : `"${activeQuery}"`) : current.detail}
            </text>
          </g>

          {/* Production Search Progress Line with Google Colors */}
          <g transform="translate(56, 96)">
            {/* Background Track */}
            <rect x="0" y="0" width="128" height="3" rx="1.5" fill="#334155" />
            {/* Animated Mild Color Progress Bar */}
            <rect
              className="search-progress-fill"
              x="0"
              y="0"
              width="50"
              height="3"
              rx="1.5"
              fill={current.statusDot}
            />
          </g>

          {/* Bottom Micro Status */}
          <g transform="translate(120, 110)">
            <circle cx="-38" cy="-2" r="2" fill={current.statusDot} className="glyph-live-blinker" />
            <text
              x="0"
              y="0"
              textAnchor="middle"
              fill="#64748b"
              fontSize="5.5"
              fontFamily="monospace"
              letterSpacing="0.5"
            >
              SYSTEM ACTIVE · PROCESSING QUERY
            </text>
          </g>
        </g>

        {/* Laptop Hinge & Base Bar (at bottom, perfectly straight) */}
        <rect
          x="28"
          y="142"
          width="184"
          height="8"
          rx="2"
          fill="#cbd5e1"
          stroke="#94a3b8"
          strokeWidth="1"
        />
        <rect
          x="44"
          y="150"
          width="152"
          height="5"
          rx="2"
          fill="#64748b"
          opacity="0.4"
        />
      </svg>
    </div>
  );
}
