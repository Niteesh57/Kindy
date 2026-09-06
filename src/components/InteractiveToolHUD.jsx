import React from 'react';
import { Compass, Search, X, MapPin, Sparkles, Navigation, Globe, ExternalLink } from 'lucide-react';

export const MAP_PRESET_WAYPOINTS = [
  {
    name: 'Community Hub & Volunteer Center',
    city: 'Local Area',
    category: 'Community Hub · 4.9 ★',
    query: 'Find community and volunteer centers nearby that are open now',
    x: 260,
    y: 85,
    tag: 'OPEN NOW',
    tagBg: '#e6f4ea',
    tagColor: '#137333',
    icon: '🤝',
  },
  {
    name: 'Central Park Woodlands',
    city: 'Open Spaces',
    category: 'Public Park · 4.8 ★',
    query: 'Find scenic walking trails and viewpoints nearby',
    x: 120,
    y: 100,
    tag: 'SCENIC',
    tagBg: '#e6f4ea',
    tagColor: '#137333',
    icon: '🌳',
  },
  {
    name: 'Downtown Tech District',
    city: 'Innovation Hub',
    category: 'Transit · 14 min',
    query: 'Directions to Downtown Tech Campus',
    x: 260,
    y: 85,
    tag: 'FASTEST ROUTE',
    tagBg: '#e8f0fe',
    tagColor: '#1a73e8',
    icon: '🚀',
  },
  {
    name: 'Riverside Marina & Bay',
    city: 'Waterfront',
    category: 'Scenic · 4.7 ★',
    query: 'Explore waterfront cafe stops near the marina',
    x: 185,
    y: 145,
    tag: 'POPULAR',
    tagBg: '#e8f0fe',
    tagColor: '#185abc',
    icon: '⛵',
  },
  {
    name: 'Metropolitan Art Gallery',
    city: 'Cultural Quarter',
    category: 'Museum · 4.9 ★',
    query: 'Cultural landmarks and art museums open today',
    x: 285,
    y: 155,
    tag: 'FEATURED',
    tagBg: '#fef7e0',
    tagColor: '#b06000',
    icon: '🎨',
  },
];

export default function InteractiveToolHUD({
  activeTool,
  onClose,
  selectedWaypointIdx = 0,
  onSelectWaypoint,
  onRunQuery,
}) {
  if (!activeTool) return null;

  const isMaps = activeTool.tool === 'google_maps';
  const isSearch = activeTool.tool === 'google_search';

  return (
    <div
      className={`interactive-tool-hud ${isMaps ? 'hud-maps-theme' : 'hud-search-theme'}`}
      role="region"
      aria-label="Active Tool Screen"
    >
      {/* 1. Header Bar: Tool Badge, Live Status & Close Action */}
      <div className="tool-hud-top-bar">
        <div className="tool-hud-badge-container">
          <span className="tool-live-pulse-dot" />
          {isMaps ? (
            <div className="tool-badge-pill maps-pill">
              <Compass size={16} className="tool-pill-icon spin-slow" />
              <span className="tool-pill-name">Google Maps Tool</span>
              <span className="tool-pill-status">GROUNDING LIVE</span>
            </div>
          ) : (
            <div className="tool-badge-pill search-pill">
              <Search size={16} className="tool-pill-icon pulse-glow" />
              <span className="tool-pill-name">Google Search Tool</span>
              <span className="tool-pill-status">WEB GROUNDING</span>
            </div>
          )}
        </div>

        {/* Query summary */}
        <div className="tool-hud-query-preview" title={activeTool.query}>
          <span className="query-lead">Query:</span>
          <span className="query-snippet">"{activeTool.query || 'Locating places & grounding information'}"</span>
        </div>

        {/* Close Button to return to normal avatar */}
        <button
          type="button"
          className="tool-hud-dismiss-btn"
          onClick={onClose}
          title="Close Tool Screen (Esc)"
        >
          <X size={16} />
          <span>Close</span>
        </button>
      </div>

      {/* 2. Interactive Navigation Waypoints (Google Maps) or Grounding Tags (Search) */}
      {isMaps ? (
        <div className="tool-hud-interactive-section">
          <div className="interactive-label-row">
            <span className="interactive-title">
              <MapPin size={14} className="title-icon" />
              Interactive Waypoints (Click to Focus Lens):
            </span>
            <span className="interactive-hint">Click any spot to move optical magnifying scope</span>
          </div>

          <div className="interactive-waypoint-chips">
            {MAP_PRESET_WAYPOINTS.map((wp, idx) => {
              const isSelected = selectedWaypointIdx === idx;
              return (
                <button
                  key={wp.name}
                  type="button"
                  className={`waypoint-nav-chip ${isSelected ? 'active-waypoint' : ''}`}
                  onClick={() => onSelectWaypoint && onSelectWaypoint(idx)}
                >
                  <span className="waypoint-emoji">{wp.icon}</span>
                  <span className="waypoint-name">{wp.name}</span>
                  <span
                    className="waypoint-tag"
                    style={{ background: wp.tagBg, color: wp.tagColor }}
                  >
                    {wp.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="tool-hud-interactive-section">
          <div className="interactive-label-row">
            <span className="interactive-title">
              <Globe size={14} className="title-icon" />
              Realtime Search Operations & Reasoning:
            </span>
            <span className="interactive-hint">Grounding facts with Gemini 3.8 Flash</span>
          </div>

          <div className="search-operations-chips">
            <span className="search-tag-chip active-blue">
              <Sparkles size={13} />
              <span>Multi-Source Verification</span>
            </span>
            <span className="search-tag-chip active-green">
              <Globe size={13} />
              <span>Google Web Indexing</span>
            </span>
            <span className="search-tag-chip active-amber">
              <ExternalLink size={13} />
              <span>Live Citation Matching</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
