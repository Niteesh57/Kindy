import React from 'react';
import Avatar from 'react-nice-avatar';
import { PRESET_AVATARS } from '../constants/avatarOptions';
import { Wand2 } from 'lucide-react';

export default function PresetBar({ onSelectPreset, currentConfig }) {
  return (
    <div className="preset-shelf" aria-label="Preset Archetypes">
      <div className="preset-shelf-header">
        <div className="shelf-title-wrap">
          <Wand2 size={16} className="text-accent" />
          <span className="shelf-title">Character Archetypes</span>
        </div>
        <span className="shelf-subtitle">1-Click Quick Styles</span>
      </div>

      <div className="preset-cards-scroll">
        {PRESET_AVATARS.map((preset, idx) => (
          <button
            key={idx}
            className="preset-mini-card"
            onClick={() => onSelectPreset(preset.config)}
            title={`Apply "${preset.name}" preset`}
          >
            <div className="preset-avatar-thumb">
              <Avatar
                style={{ width: '42px', height: '42px' }}
                {...preset.config}
                shape="circle"
              />
            </div>
            <div className="preset-text-wrap">
              <span className="preset-name">{preset.name}</span>
              <span className="preset-tag">{preset.tag}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
