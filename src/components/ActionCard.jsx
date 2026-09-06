import React from 'react';
import { ExternalLink, Star, MapPin, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';

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

  const isNegative = card.impactType === 'negative';

  return (
    <div
      className={`motivation-action-card ${isBestPick ? 'best-pick-card' : ''} ${
        isActive ? 'card-speaking-highlight' : ''
      } ${isNegative ? 'negative-impact-card' : ''}`}
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
          <span
            className={`card-badge ${isNegative ? 'negative-badge' : 'regular-badge'}`}
            style={card.badgeStyle || {}}
          >
            {isNegative && <AlertTriangle size={11} className="badge-icon-alert" />}
            <span>{card.badge || 'IMPACT'}</span>
          </span>
        )}

        {card.stat && (
          <span className={`card-stat-pill ${isNegative ? 'stat-pill-negative' : 'stat-pill-positive'}`}>
            {!isNegative && <TrendingUp size={11} className="stat-icon-trend" />}
            <span>{card.stat}</span>
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
          <span className="card-emoji-icon">{card.icon || (isNegative ? '⚠️' : '💡')}</span>
          <span className="card-title-text">{card.title}</span>
        </h4>
        {card.category && (
          <div className="card-subtitle-row">
            <MapPin size={12} className="subtitle-pin-icon" />
            <span className="card-subtitle-text">{card.category}</span>
          </div>
        )}
      </div>

      {/* Motivational Hook / Story / Consequence Description */}
      {card.description && (
        <p className="card-description-text">{card.description}</p>
      )}

      {/* Bottom Action Row: External Link OR Interactive Discussion Button */}
      <div className="card-footer-row">
        {card.url ? (
          <button
            type="button"
            className="card-link-action-btn"
            onClick={handleExternalClick}
            title="Open verified destination"
          >
            <span>{card.url.includes('maps') ? 'Open in Maps' : 'Visit Link'}</span>
            <ExternalLink size={12} className="external-arrow-icon" />
          </button>
        ) : (
          <button
            type="button"
            className="card-action-prompt-btn"
            onClick={(e) => {
              e.stopPropagation();
              onClick && onClick();
            }}
            title="Click to ask Kindy about this"
          >
            <span>{card.actionPrompt || 'Explore impact ↗'}</span>
            <Sparkles size={11} className="prompt-btn-sparkle" />
          </button>
        )}
      </div>
    </div>
  );
}

