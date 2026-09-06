import React from 'react';
import { ExternalLink, Star, MapPin, Sparkles, HeartHandshake, Coffee, Briefcase, Award } from 'lucide-react';

export default function ActionCard({
  card,
  isBestPick = false,
  isActive = false,
  onClick,
}) {
  if (!card) return null;

  const handleExternalClick = (e) => {
    if (card.url) {
      e.stopPropagation();
      window.open(card.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className={`motivation-action-card ${isBestPick ? 'best-pick-card' : ''} ${
        isActive ? 'card-speaking-highlight' : ''
      }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick && onClick();
        }
      }}
      title={card.description ? `${card.title} - ${card.description}` : card.title}
    >
      {/* Top Tag / Badge Row */}
      <div className="card-top-row">
        {isBestPick ? (
          <span className="card-badge best-pick-badge">
            <Sparkles size={12} className="badge-icon-sparkle" />
            <span>BEST PICK</span>
          </span>
        ) : (
          <span className="card-badge regular-badge" style={card.badgeStyle || {}}>
            {card.badge || 'RECOMMENDED'}
          </span>
        )}

        {card.rating && (
          <span className="card-rating-pill">
            <Star size={11} className="rating-star-icon" />
            <span>{card.rating}</span>
          </span>
        )}
      </div>

      {/* Title & Place/Category */}
      <div className="card-main-content">
        <h4 className="card-title">
          <span className="card-emoji-icon">{card.icon || '📍'}</span>
          <span className="card-title-text">{card.title}</span>
        </h4>
        {card.category && (
          <div className="card-subtitle-row">
            <MapPin size={12} className="subtitle-pin-icon" />
            <span className="card-subtitle-text">{card.category}</span>
          </div>
        )}
      </div>

      {/* Motivational Hook / Story Description */}
      {card.description && (
        <p className="card-description-text">{card.description}</p>
      )}

      {/* Bottom Action Row: External Link / Click hint */}
      <div className="card-footer-row">
        {card.url ? (
          <button
            type="button"
            className="card-link-action-btn"
            onClick={handleExternalClick}
            title="Open in Google Maps / Google Search"
          >
            <span>Open in Maps</span>
            <ExternalLink size={12} className="external-arrow-icon" />
          </button>
        ) : (
          <span className="card-click-prompt">Click to ask Kindy ↗</span>
        )}
      </div>
    </div>
  );
}
