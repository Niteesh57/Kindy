import React, { useState, useEffect } from 'react';

// Google Maps inspection waypoints (Real-world clean locations)
export const GOOGLE_MAP_WAYPOINTS = [
  {
    name: 'Community & Volunteer Center',
    category: 'Community Hub · 4.9 ★',
    query: 'Community and volunteer centers nearby',
    status: 'Open now · Grounded via Google Maps API',
    x: 260,
    y: 85,
    type: 'coffee',
    tag: 'OPEN NOW',
    tagColor: '#137333',
    tagBg: '#e6f4ea',
  },
  {
    name: 'Central Park Woodlands',
    category: 'Public Park · 4.8 ★',
    query: 'Searching nearby parks & open spaces...',
    status: 'Finding best walking trails...',
    x: 120,
    y: 100,
    type: 'park',
    tag: 'SCENIC',
    tagColor: '#137333',
    tagBg: '#e6f4ea',
  },
  {
    name: 'Downtown Tech Campus',
    category: 'Innovation Center · 4.9 ★',
    query: 'Thinking about optimal transit routes...',
    status: 'Calculating fastest route (14 min)...',
    x: 260,
    y: 85,
    type: 'tech',
    tag: 'FASTEST ROUTE',
    tagColor: '#1a73e8',
    tagBg: '#e8f0fe',
  },
  {
    name: 'Riverside Marina & Bay',
    category: 'Waterfront · 4.7 ★',
    query: 'Searching scenic waterfront stops...',
    status: 'Locating riverside cafes...',
    x: 185,
    y: 145,
    type: 'water',
    tag: 'POPULAR',
    tagColor: '#185abc',
    tagBg: '#e8f0fe',
  },
  {
    name: 'Metropolitan Art Gallery',
    category: 'Museum & Culture · 4.9 ★',
    query: 'Finding cultural landmarks...',
    status: 'Checking tickets & hours...',
    x: 285,
    y: 155,
    type: 'culture',
    tag: 'FEATURED',
    tagColor: '#b06000',
    tagBg: '#fef7e0',
  },
  {
    name: 'Greenfield Botanical Garden',
    category: 'Botanical Garden · 4.8 ★',
    query: 'Wait, finding peaceful quiet spots...',
    status: 'Matching your preferences...',
    x: 90,
    y: 160,
    type: 'garden',
    tag: 'HIGHLY RATED',
    tagColor: '#137333',
    tagBg: '#e6f4ea',
  },
];

export default function MapOverlay({
  skinColor = '#F9C9B6',
  shirtColor = '#6366f1',
  isTalking = false,
  activeQuery = '',
  selectedWaypointIdx,
  onSelectWaypoint,
}) {
  const [internalIdx, setInternalIdx] = useState(0);

  const waypointIdx =
    selectedWaypointIdx !== undefined ? selectedWaypointIdx : internalIdx;

  // Smoothly move the magnifying glass between clue areas every 3.4 seconds if not explicitly controlled
  useEffect(() => {
    if (selectedWaypointIdx !== undefined) return;
    const timer = setInterval(() => {
      setInternalIdx((prev) => (prev + 1) % GOOGLE_MAP_WAYPOINTS.length);
    }, 3400);
    return () => clearInterval(timer);
  }, [selectedWaypointIdx]);

  const current =
    GOOGLE_MAP_WAYPOINTS[waypointIdx % GOOGLE_MAP_WAYPOINTS.length] ||
    GOOGLE_MAP_WAYPOINTS[0];
  const lensX = current.x;
  const lensY = current.y;

  return (
    <div className="map-overlay-container">
      <svg
        viewBox="0 0 380 260"
        className="map-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Subtle Google Map Card Shadows */}
          <filter id="googleCardShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#3c4043" floodOpacity="0.18" />
          </filter>

          <filter id="lensModernShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="8" stdDeviation="7" floodColor="#202124" floodOpacity="0.32" />
          </filter>

          {/* Clean Glass Specular Highlight for Modern Lens */}
          <linearGradient id="modernGlassGlint" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="70%" stopColor="#c2e7ff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
          </linearGradient>

          {/* Modern Titanium / Brushed Silver Bezel */}
          <linearGradient id="modernBezel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#dadce0" />
            <stop offset="70%" stopColor="#bdc1c6" />
            <stop offset="100%" stopColor="#9aa0a6" />
          </linearGradient>

          {/* Clean Modern Slate Handle */}
          <linearGradient id="modernHandle" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5f6368" />
            <stop offset="50%" stopColor="#3c4043" />
            <stop offset="100%" stopColor="#202124" />
          </linearGradient>

          {/* Circular Clip for the Real Optical Magnification Effect */}
          <clipPath id="googleLensClip">
            <circle cx={lensX} cy={lensY} r="34" />
          </clipPath>
        </defs>

        {/* ============================================================ */}
        {/* 1. CHARACTER'S SLEEVES & ARMS (Holding the map & glass)      */}
        {/* ============================================================ */}
        {/* Left Arm / Sleeve reaching to grip map */}
        <g className="map-left-arm">
          <path
            d="M 18 250 C 22 210 35 180 52 165 L 68 180 C 50 195 40 220 38 250 Z"
            fill={shirtColor}
            stroke="#171921"
            strokeWidth="3.5"
          />
        </g>

        {/* Right Arm / Sleeve reaching up holding the magnifying glass handle */}
        <g className="map-right-arm">
          <path
            d="M 362 250 C 358 205 342 175 322 160 L 306 175 C 324 190 338 218 342 250 Z"
            fill={shirtColor}
            stroke="#171921"
            strokeWidth="3.5"
          />
        </g>

        {/* ============================================================ */}
        {/* 2. GOOGLE MAPS TABLET / SHEET (Clean Google Color Palette)   */}
        {/* ============================================================ */}
        <g filter="url(#googleCardShadow)" className="map-body-group">
          {/* Base Urban Ground (Google Light Neutral Grey #f1f3f4) */}
          <rect
            x="45"
            y="36"
            width="290"
            height="188"
            rx="12"
            fill="#f1f3f4"
            stroke="#dadce0"
            strokeWidth="1.5"
          />

          {/* ========================================================== */}
          {/* BASE GOOGLE MAP ARTWORK (Vector Cartography)              */}
          {/* ========================================================== */}
          <g id="googleMapArt">
            {/* 1. Water Body: Bay / River (Soft Google Water Blue #c2e7ff) */}
            <path
              d="M 140 36 
                 C 155 70 170 100 160 135 
                 C 150 170 180 200 195 224 
                 L 225 224 
                 C 210 190 185 160 195 125 
                 C 205 90 190 60 175 36 
                 Z"
              fill="#c2e7ff"
              stroke="#a0c5e8"
              strokeWidth="0.8"
            />
            {/* Water label */}
            <text
              x="182"
              y="115"
              fill="#185abc"
              fontSize="5.5"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight="500"
              letterSpacing="0.8"
              transform="rotate(68 182 115)"
              opacity="0.8"
            >
              BLUE RIVER
            </text>

            {/* 2. Park 1: Central Park Woodlands (Mild Google Green #ceead6) */}
            <path
              d="M 85 70 
                 C 90 55 140 55 145 72 
                 C 150 90 142 120 125 125 
                 C 105 130 80 110 85 70 Z"
              fill="#ceead6"
              stroke="#a8dab5"
              strokeWidth="1"
            />
            {/* Park Trees Icons */}
            <circle cx="102" cy="78" r="4.5" fill="#34a853" opacity="0.65" />
            <circle cx="112" cy="74" r="5.5" fill="#1e8e3e" opacity="0.7" />
            <circle cx="124" cy="80" r="4" fill="#34a853" opacity="0.65" />
            <circle cx="116" cy="90" r="4.8" fill="#137333" opacity="0.7" />
            <circle cx="132" cy="92" r="3.8" fill="#34a853" opacity="0.65" />
            {/* Park Label */}
            <text x="118" y="104" fill="#137333" fontSize="6.5" fontWeight="700" fontFamily="system-ui, sans-serif" textAnchor="middle">
              Central Park
            </text>
            <text x="118" y="112" fill="#1e8e3e" fontSize="5" fontFamily="system-ui, sans-serif" textAnchor="middle">
              Natural Reserve
            </text>

            {/* 3. Park 2: Greenfield Botanical Garden (Bottom Left #d4edda) */}
            <path
              d="M 55 145 C 65 130 115 135 120 155 C 125 175 110 195 90 195 C 70 195 50 170 55 145 Z"
              fill="#e6f4ea"
              stroke="#ceead6"
              strokeWidth="1"
            />
            <circle cx="82" cy="154" r="4" fill="#34a853" opacity="0.7" />
            <circle cx="94" cy="158" r="4.5" fill="#137333" opacity="0.75" />
            <text x="88" y="172" fill="#137333" fontSize="6" fontWeight="700" fontFamily="system-ui, sans-serif" textAnchor="middle">
              Botanical Garden
            </text>

            {/* 4. Commercial District: Downtown Tech Campus (Top Right) */}
            <rect x="235" y="60" width="75" height="48" rx="6" fill="#e8eaed" stroke="#dadce0" strokeWidth="1" />
            <rect x="242" y="66" width="16" height="14" rx="2" fill="#ffffff" stroke="#bdc1c6" strokeWidth="0.8" />
            <rect x="264" y="66" width="22" height="18" rx="2" fill="#ffffff" stroke="#bdc1c6" strokeWidth="0.8" />
            <rect x="242" y="84" width="26" height="16" rx="2" fill="#ffffff" stroke="#bdc1c6" strokeWidth="0.8" />
            <rect x="274" y="88" width="28" height="14" rx="2" fill="#ffffff" stroke="#bdc1c6" strokeWidth="0.8" />
            <text x="272" y="80" fill="#202124" fontSize="6.5" fontWeight="700" fontFamily="system-ui, sans-serif" textAnchor="middle">
              Tech Campus
            </text>
            <text x="272" y="88" fill="#5f6368" fontSize="4.8" fontFamily="system-ui, sans-serif" textAnchor="middle">
              Innovation District
            </text>

            {/* 5. Cultural Quarter: Metropolitan Art Gallery (Bottom Right) */}
            <rect x="250" y="132" width="68" height="46" rx="6" fill="#fef7e0" stroke="#feefc3" strokeWidth="1" />
            <text x="284" y="148" fill="#b06000" fontSize="6.5" fontWeight="700" fontFamily="system-ui, sans-serif" textAnchor="middle">
              Metropolitan Gallery
            </text>
            <text x="284" y="156" fill="#e37400" fontSize="4.8" fontFamily="system-ui, sans-serif" textAnchor="middle">
              Museum & Arts
            </text>

            {/* ======================================================== */}
            {/* Clean Google Road Network (White streets with grey edges)*/}
            {/* ======================================================== */}
            <g stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round">
              {/* Secondary Streets */}
              <line x1="45" y1="90" x2="335" y2="90" strokeWidth="4" />
              <line x1="45" y1="135" x2="335" y2="135" strokeWidth="4" />
              <line x1="45" y1="180" x2="335" y2="180" strokeWidth="4" />
              <line x1="95" y1="36" x2="95" y2="224" strokeWidth="4" />
              <line x1="165" y1="36" x2="165" y2="224" strokeWidth="4" />
              <line x1="235" y1="36" x2="235" y2="224" strokeWidth="4" />
              <line x1="300" y1="36" x2="300" y2="224" strokeWidth="4" />

              {/* Major Arterial Highway (Warm Google Yellow/Amber #fbbc04) */}
              <path
                d="M 45 62 Q 130 62 170 88 T 335 110"
                stroke="#feefc3"
                strokeWidth="5"
                fill="none"
              />
            </g>

            {/* Active Google Navigation Route (Blue Line #1a73e8) */}
            <path
              d="M 95 160 
                 L 95 135 
                 L 165 135 
                 C 190 135 200 110 235 110 
                 L 260 110 
                 L 260 85"
              fill="none"
              stroke="#1a73e8"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Route Direction Arrows (White chevrons) */}
            <circle cx="95" cy="148" r="1.5" fill="#ffffff" />
            <circle cx="130" cy="135" r="1.5" fill="#ffffff" />
            <circle cx="215" cy="116" r="1.5" fill="#ffffff" />

            {/* Google "My Location" GPS Blue Dot with Pulse Ring */}
            <g transform="translate(95, 160)">
              <circle cx="0" cy="0" r="10" fill="#d2e3fc" opacity="0.6" className="glyph-live-blinker" />
              <circle cx="0" cy="0" r="5" fill="#1a73e8" stroke="#ffffff" strokeWidth="1.5" />
            </g>

            {/* Destination Red Teardrop Pin at Downtown Campus */}
            <g transform="translate(260, 85)">
              <path
                d="M 0 -14 
                   C -5 -14 -8 -10 -8 -6 
                   C -8 0 0 8 0 8 
                   C 0 8 8 0 8 -6 
                   C 8 -10 5 -14 0 -14 Z"
                fill="#ea4335"
                stroke="#b31412"
                strokeWidth="0.8"
              />
              <circle cx="0" cy="-6" r="2.8" fill="#ffffff" />
            </g>

            {/* Green Nature Pin at Central Park */}
            <g transform="translate(120, 75)">
              <path
                d="M 0 -12 
                   C -4 -12 -6 -9 -6 -5 
                   C -6 0 0 6 0 6 
                   C 0 6 6 0 6 -5 
                   C 6 -9 4 -12 0 -12 Z"
                fill="#34a853"
              />
              <circle cx="0" cy="-5" r="2.2" fill="#ffffff" />
            </g>

            {/* Orange Culture Pin at Art Gallery */}
            <g transform="translate(285, 142)">
              <path
                d="M 0 -12 
                   C -4 -12 -6 -9 -6 -5 
                   C -6 0 0 6 0 6 
                   C 0 6 6 0 6 -5 
                   C 6 -9 4 -12 0 -12 Z"
                fill="#f9ab00"
              />
              <circle cx="0" cy="-5" r="2.2" fill="#ffffff" />
            </g>
          </g>

          {/* ======================================================== */}
          {/* Top Floating Google Search Bar (Clean Material Design)   */}
          {/* ======================================================== */}
          <g transform="translate(62, 42)">
            {/* White search bar pill */}
            <rect
              x="0"
              y="0"
              width="256"
              height="20"
              rx="10"
              fill="#ffffff"
              stroke="#dadce0"
              strokeWidth="0.8"
              filter="url(#googleCardShadow)"
            />
            {/* Google Search Icon (Magnifying Glass) */}
            <g transform="translate(10, 5)">
              <circle cx="4" cy="4" r="3.5" fill="none" stroke="#4285f4" strokeWidth="1.2" />
              <line x1="6.5" y1="6.5" x2="9" y2="9" stroke="#4285f4" strokeWidth="1.2" strokeLinecap="round" />
            </g>
            {/* Search Query Text */}
            <text x="26" y="13" fill="#3c4043" fontSize="7" fontWeight="500" fontFamily="system-ui, -apple-system, sans-serif">
              {activeQuery ? (activeQuery.length > 38 ? activeQuery.slice(0, 38) + '...' : activeQuery) : current.query}
            </text>
            {/* Mic Icon indicator */}
            <circle cx="236" cy="10" r="3" fill="#ea4335" opacity="0.8" />
            <circle cx="244" cy="10" r="3" fill="#34a853" opacity="0.8" />
          </g>

          {/* ======================================================== */}
          {/* Bottom Floating Google Place Card                        */}
          {/* ======================================================== */}
          <g transform="translate(62, 194)">
            <rect
              x="0"
              y="0"
              width="256"
              height="24"
              rx="8"
              fill="#ffffff"
              stroke="#e8eaed"
              strokeWidth="1"
              filter="url(#googleCardShadow)"
            />
            {/* Category Tag Pill */}
            <rect
              x="6"
              y="5"
              width="46"
              height="14"
              rx="4"
              fill={current.tagBg}
            />
            <text
              x="29"
              y="14.5"
              fill={current.tagColor}
              fontSize="5.2"
              fontWeight="700"
              fontFamily="system-ui, sans-serif"
              textAnchor="middle"
            >
              {current.tag}
            </text>

            {/* Place Title & Live Status */}
            <text x="58" y="11.5" fill="#202124" fontSize="7" fontWeight="700" fontFamily="system-ui, sans-serif">
              {current.name}
            </text>
            <text x="58" y="19" fill="#5f6368" fontSize="5.5" fontWeight="400" fontFamily="system-ui, sans-serif">
              {current.status}
            </text>

            {/* Navigation Arrow Pill */}
            <g transform="translate(236, 5)">
              <rect x="0" y="0" width="14" height="14" rx="7" fill="#1a73e8" />
              <path d="M 5 7 L 8 4 L 8 10 Z" fill="#ffffff" transform="rotate(45 7 7)" />
            </g>
          </g>
        </g>

        {/* ============================================================ */}
        {/* 3. OPTICAL MAGNIFICATION LENS (REAL 2.2X GOOGLE MAPS ZOOM!)  */}
        {/* ============================================================ */}
        <g
          className="detective-magnifier-unit"
          style={{
            transition: 'transform 1.2s cubic-bezier(0.34, 1.25, 0.64, 1)',
          }}
        >
          {/* Under the lens: Magnified Google Map Content (2.2x zoom) */}
          <g clipPath="url(#googleLensClip)">
            {/* Lens Base background */}
            <circle cx={lensX} cy={lensY} r="34" fill="#f8f9fa" />

            {/* Scaled-up Google map graphics centered at lens focus */}
            <g
              transform={`translate(${lensX}, ${lensY}) scale(2.2) translate(${-lensX}, ${-lensY})`}
            >
              <use href="#googleMapArt" />
            </g>

            {/* Optical Glass Specular Highlight Glint */}
            <circle cx={lensX} cy={lensY} r="34" fill="url(#modernGlassGlint)" />
            {/* Top Curved Glint Arc */}
            <path
              d={`M ${lensX - 22} ${lensY - 15} Q ${lensX} ${lensY - 28} ${lensX + 22} ${lensY - 15}`}
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.85"
            />
          </g>

          {/* ========================================================== */}
          {/* 4. SLEEK MODERN SEARCH LOUPE FRAME & HANDLE                */}
          {/* ========================================================== */}
          <g filter="url(#lensModernShadow)">
            {/* Titanium Outer Bezel */}
            <circle
              cx={lensX}
              cy={lensY}
              r="35"
              fill="none"
              stroke="url(#modernBezel)"
              strokeWidth="4.5"
            />

            {/* Google Blue Accent Ring */}
            <circle
              cx={lensX}
              cy={lensY}
              r="32.5"
              fill="none"
              stroke="#1a73e8"
              strokeWidth="1.2"
              opacity="0.9"
            />

            {/* Handle Connector Mount */}
            <rect
              x={lensX + 23}
              y={lensY + 23}
              width="9"
              height="7"
              rx="2"
              transform={`rotate(45 ${lensX + 23} ${lensY + 23})`}
              fill="url(#modernBezel)"
              stroke="#5f6368"
              strokeWidth="0.8"
            />

            {/* Modern Slate Handle Extending to Character's Right Hand */}
            <path
              d={`M ${lensX + 27} ${lensY + 27} L ${lensX + 62} ${lensY + 62}`}
              stroke="url(#modernHandle)"
              strokeWidth="6.5"
              strokeLinecap="round"
            />
            {/* Brushed Chrome Accent Bands on Handle */}
            <line
              x1={lensX + 38}
              y1={lensY + 38}
              x2={lensX + 43}
              y2={lensY + 43}
              stroke="#dadce0"
              strokeWidth="7"
            />
            <line
              x1={lensX + 54}
              y1={lensY + 54}
              x2={lensX + 59}
              y2={lensY + 59}
              stroke="#1a73e8"
              strokeWidth="7"
            />

            {/* Right Hand Gripping the Magnifying Glass Handle */}
            <g transform={`translate(${lensX + 56}, ${lensY + 56})`}>
              <ellipse cx="0" cy="0" rx="9" ry="7" fill={skinColor} stroke="#171921" strokeWidth="2.5" />
              <ellipse cx="-2" cy="-4" rx="4" ry="3" fill={skinColor} stroke="#171921" strokeWidth="1.5" />
              <ellipse cx="2" cy="4" rx="4" ry="3" fill={skinColor} stroke="#171921" strokeWidth="1.5" />
            </g>
          </g>
        </g>

        {/* ============================================================ */}
        {/* 5. LEFT HAND GRIPPING THE LEFT EDGE OF THE MAP               */}
        {/* ============================================================ */}
        <g transform="translate(45, 135)" className="map-left-hand-grip">
          {/* Thumb pressing on front */}
          <ellipse
            cx="6"
            cy="0"
            rx="7"
            ry="11"
            fill={skinColor}
            stroke="#171921"
            strokeWidth="2.5"
            transform="rotate(-15 6 0)"
          />
          {/* Fingers wrapping under edge */}
          <ellipse cx="-3" cy="-8" rx="5" ry="4" fill={skinColor} stroke="#171921" strokeWidth="2" />
          <ellipse cx="-4" cy="2" rx="5" ry="4" fill={skinColor} stroke="#171921" strokeWidth="2" />
          <ellipse cx="-3" cy="12" rx="5" ry="4" fill={skinColor} stroke="#171921" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}
