import React, { useState } from 'react';
import {
  User,
  Scissors,
  Smile,
  Glasses,
  Palette,
  Sparkles,
  Shirt,
  Crown
} from 'lucide-react';
import {
  STYLE_OPTIONS,
  FACE_COLORS,
  HAIR_COLORS,
  SHIRT_COLORS,
  HAT_COLORS,
  BG_COLORS,
} from '../constants/avatarOptions';

const TABS = [
  { id: 'identity', label: 'Identity', icon: User },
  { id: 'hair', label: 'Hair', icon: Scissors },
  { id: 'headwear', label: 'Hat', icon: Crown },
  { id: 'expression', label: 'Face', icon: Smile },
  { id: 'apparel', label: 'Outfit & Glasses', icon: Shirt },
  { id: 'backdrop', label: 'Backdrop', icon: Palette },
];

export default function CustomizerPanel({ config, onChangeConfig }) {
  const [activeTab, setActiveTab] = useState('identity');

  const update = (key, value) => {
    onChangeConfig({ [key]: value });
  };

  return (
    <aside className="customizer-sidebar" aria-label="Avatar Customization Controls">
      {/* Category Navigation Tabs */}
      <div className="tab-navigation-bar" role="tablist">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              className={`nav-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="tab-content-body">
        {/* IDENTITY TAB */}
        {activeTab === 'identity' && (
          <div className="control-group-list">
            <div className="control-section">
              <label className="section-title">Gender / Base Model</label>
              <div className="pill-grid pill-grid-2">
                {STYLE_OPTIONS.sex.map((item) => (
                  <button
                    key={item.value}
                    className={`choice-card ${config.sex === item.value ? 'selected' : ''}`}
                    onClick={() => update('sex', item.value)}
                  >
                    <span className="choice-emoji">{item.icon}</span>
                    <span className="choice-name">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="control-section">
              <label className="section-title">Ear Size</label>
              <div className="pill-grid pill-grid-2">
                {STYLE_OPTIONS.earSize.map((item) => (
                  <button
                    key={item.value}
                    className={`choice-card ${config.earSize === item.value ? 'selected' : ''}`}
                    onClick={() => update('earSize', item.value)}
                  >
                    <span className="choice-name">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="control-section">
              <div className="section-header-flex">
                <label className="section-title">Skin Complexion</label>
                <input
                  type="color"
                  value={config.faceColor || '#F9C9B6'}
                  onChange={(e) => update('faceColor', e.target.value)}
                  className="color-input-picker"
                  title="Pick custom color"
                />
              </div>
              <div className="color-swatch-grid">
                {FACE_COLORS.map((c) => (
                  <button
                    key={c.value}
                    className={`color-swatch ${config.faceColor?.toLowerCase() === c.value.toLowerCase() ? 'active' : ''}`}
                    style={{ backgroundColor: c.value }}
                    onClick={() => update('faceColor', c.value)}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* HAIR TAB */}
        {activeTab === 'hair' && (
          <div className="control-group-list">
            <div className="control-section">
              <label className="section-title">Haircut Style</label>
              <div className="pill-grid pill-grid-2">
                {STYLE_OPTIONS.hairStyle.map((item) => (
                  <button
                    key={item.value}
                    className={`choice-card ${config.hairStyle === item.value ? 'selected' : ''}`}
                    onClick={() => update('hairStyle', item.value)}
                  >
                    <span className="choice-name">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="control-section">
              <div className="section-header-flex">
                <label className="section-title">Hair Color</label>
                <input
                  type="color"
                  value={config.hairColor || '#000000'}
                  onChange={(e) => update('hairColor', e.target.value)}
                  className="color-input-picker"
                  title="Pick custom color"
                />
              </div>
              <div className="color-swatch-grid">
                {HAIR_COLORS.map((c) => (
                  <button
                    key={c.value}
                    className={`color-swatch ${config.hairColor?.toLowerCase() === c.value.toLowerCase() ? 'active' : ''}`}
                    style={{ backgroundColor: c.value }}
                    onClick={() => update('hairColor', c.value)}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            <div className="control-section">
              <label className="switch-container">
                <input
                  type="checkbox"
                  checked={config.hairColorRandom || false}
                  onChange={(e) => update('hairColorRandom', e.target.checked)}
                />
                <span className="switch-slider" />
                <span className="switch-text">Randomize Hair Highlight Tone</span>
              </label>
            </div>
          </div>
        )}

        {/* HEADWEAR TAB */}
        {activeTab === 'headwear' && (
          <div className="control-group-list">
            <div className="control-section">
              <label className="section-title">Headwear Type</label>
              <div className="pill-grid pill-grid-3">
                {STYLE_OPTIONS.hatStyle.map((item) => (
                  <button
                    key={item.value}
                    className={`choice-card ${config.hatStyle === item.value ? 'selected' : ''}`}
                    onClick={() => update('hatStyle', item.value)}
                  >
                    <span className="choice-name">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {config.hatStyle !== 'none' && (
              <div className="control-section">
                <div className="section-header-flex">
                  <label className="section-title">Headwear Color</label>
                  <input
                    type="color"
                    value={config.hatColor || '#38bdf8'}
                    onChange={(e) => update('hatColor', e.target.value)}
                    className="color-input-picker"
                    title="Pick custom color"
                  />
                </div>
                <div className="color-swatch-grid">
                  {HAT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      className={`color-swatch ${config.hatColor?.toLowerCase() === c.value.toLowerCase() ? 'active' : ''}`}
                      style={{ backgroundColor: c.value }}
                      onClick={() => update('hatColor', c.value)}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* FACE / EXPRESSION TAB */}
        {activeTab === 'expression' && (
          <div className="control-group-list">
            <div className="control-section">
              <label className="section-title">Eyes Style</label>
              <div className="pill-grid pill-grid-3">
                {STYLE_OPTIONS.eyeStyle.map((item) => (
                  <button
                    key={item.value}
                    className={`choice-card ${config.eyeStyle === item.value ? 'selected' : ''}`}
                    onClick={() => update('eyeStyle', item.value)}
                  >
                    <span className="choice-name">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="control-section">
              <label className="section-title">Nose Style</label>
              <div className="pill-grid pill-grid-3">
                {STYLE_OPTIONS.noseStyle.map((item) => (
                  <button
                    key={item.value}
                    className={`choice-card ${config.noseStyle === item.value ? 'selected' : ''}`}
                    onClick={() => update('noseStyle', item.value)}
                  >
                    <span className="choice-name">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="control-section">
              <label className="section-title">Mouth Expression</label>
              <div className="pill-grid pill-grid-3">
                {STYLE_OPTIONS.mouthStyle.map((item) => (
                  <button
                    key={item.value}
                    className={`choice-card ${config.mouthStyle === item.value ? 'selected' : ''}`}
                    onClick={() => update('mouthStyle', item.value)}
                  >
                    <span className="choice-name">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* APPAREL & GLASSES TAB */}
        {activeTab === 'apparel' && (
          <div className="control-group-list">
            <div className="control-section">
              <label className="section-title">Glasses</label>
              <div className="pill-grid pill-grid-3">
                {STYLE_OPTIONS.glassesStyle.map((item) => (
                  <button
                    key={item.value}
                    className={`choice-card ${config.glassesStyle === item.value ? 'selected' : ''}`}
                    onClick={() => update('glassesStyle', item.value)}
                  >
                    <span className="choice-name">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="control-section">
              <label className="section-title">Top / Shirt Style</label>
              <div className="pill-grid pill-grid-3">
                {STYLE_OPTIONS.shirtStyle.map((item) => (
                  <button
                    key={item.value}
                    className={`choice-card ${config.shirtStyle === item.value ? 'selected' : ''}`}
                    onClick={() => update('shirtStyle', item.value)}
                  >
                    <span className="choice-name">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="control-section">
              <div className="section-header-flex">
                <label className="section-title">Shirt Color</label>
                <input
                  type="color"
                  value={config.shirtColor || '#6366f1'}
                  onChange={(e) => update('shirtColor', e.target.value)}
                  className="color-input-picker"
                  title="Pick custom color"
                />
              </div>
              <div className="color-swatch-grid">
                {SHIRT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    className={`color-swatch ${config.shirtColor?.toLowerCase() === c.value.toLowerCase() ? 'active' : ''}`}
                    style={{ backgroundColor: c.value }}
                    onClick={() => update('shirtColor', c.value)}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* BACKDROP TAB */}
        {activeTab === 'backdrop' && (
          <div className="control-group-list">
            <div className="control-section">
              <div className="section-header-flex">
                <label className="section-title">Avatar Backdrop Color</label>
                <input
                  type="color"
                  value={config.bgColor || '#f1f5f9'}
                  onChange={(e) => update('bgColor', e.target.value)}
                  className="color-input-picker"
                  title="Pick custom color"
                />
              </div>
              <div className="color-swatch-grid">
                {BG_COLORS.map((c) => (
                  <button
                    key={c.value}
                    className={`color-swatch ${config.bgColor?.toLowerCase() === c.value.toLowerCase() ? 'active' : ''}`}
                    style={{ backgroundColor: c.value }}
                    onClick={() => update('bgColor', c.value)}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            <div className="control-section">
              <label className="switch-container">
                <input
                  type="checkbox"
                  checked={config.isGradient || false}
                  onChange={(e) => update('isGradient', e.target.checked)}
                />
                <span className="switch-slider" />
                <span className="switch-text">Enable Background Gradient Effect</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
