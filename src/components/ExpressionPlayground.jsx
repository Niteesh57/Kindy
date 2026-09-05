import React, { useState } from 'react';
import {
  Play,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Volume2,
  Sliders,
  Brain,
  Smile,
  Zap,
  HelpCircle,
  Bot,
  Radio,
  Send,
} from 'lucide-react';
import { EXPRESSION_SCHEMA, PRESET_SCENARIOS } from '../constants/expressionSchema';

export default function ExpressionPlayground({
  activeTags = [],
  onPlayExpression,
  onSelectEmotion,
  onToggleDrawer,
  onAskGemini,
  isSpeaking,
  isGeminiLoading = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Emotion');
  const [geminiPrompt, setGeminiPrompt] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [inputText, setInputText] = useState(
    '[thinking, thinking_pose] Hmm, let me work through that... [realizing, excitedly, say_hi] Ah! I see what happened!'
  );

  const categories = Object.keys(EXPRESSION_SCHEMA);

  const toggleOpen = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (onToggleDrawer) onToggleDrawer(next);
  };

  const handleChipClick = (tagName, def) => {
    if (onSelectEmotion) {
      onSelectEmotion(tagName);
    }
    const sampleText = def.soundPrefix
      ? `[${tagName}] ${def.soundPrefix}Look at my ${def.label} expression!`
      : `[${tagName}] This is how I express being ${def.label}!`;
    setInputText(sampleText);
    onPlayExpression(sampleText);
  };

  const handleScenarioClick = (scenario) => {
    setInputText(scenario.text);
    onPlayExpression(scenario.text);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onPlayExpression(inputText);
  };

  return (
    <div className={`expression-drawer ${isOpen ? 'open' : 'collapsed'}`}>
      {/* Drawer Header & Quick Bar */}
      <div className="drawer-header" onClick={toggleOpen}>
        <div className="drawer-title-group">
          <Brain size={18} className="text-accent" />
          <span className="drawer-title">Expression & Delivery Engine</span>
          {activeTags && activeTags.length > 0 && (
            <div className="active-tag-pills">
              {activeTags.map((tag, idx) => (
                <span key={idx} className="active-tag-badge">
                  [{tag}]
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="drawer-header-actions">
          <button
            type="button"
            className="toggle-drawer-btn"
            aria-label={isOpen ? 'Collapse panel' : 'Expand panel'}
          >
            {isOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>
      </div>

      {/* Expanded Expression Studio */}
      {isOpen && (
        <div className="drawer-body">
          {/* Gemini AI Vertex & TTS Preview Live Chat Section */}
          <div className="gemini-chat-panel">
            <div className="gemini-panel-header">
              <div className="gemini-badge-group">
                <span className="gemini-model-badge">
                  <Bot size={13} /> Gemini Flash (ADK)
                </span>
                <span className="gemini-tts-badge">
                  <Radio size={13} /> Gemini 3.1 TTS Preview
                </span>
              </div>

              {/* Voice Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Voice:</span>
                <select
                  className="gemini-voice-select"
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                >
                  <option value="Kore">Kore (Warm & Friendly)</option>
                  <option value="Puck">Puck (Playful & Energetic)</option>
                  <option value="Fenrir">Fenrir (Deep & Resonant)</option>
                  <option value="Aoede">Aoede (Melodic & Expressive)</option>
                  <option value="Leda">Leda (Gentle & Calm)</option>
                  <option value="Zephyr">Zephyr (Airy & Soft)</option>
                  <option value="Orus">Orus (Confident & Authoritative)</option>
                  <option value="Charon">Charon (Thoughtful & Low)</option>
                </select>
              </div>
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="gemini-quick-prompts">
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, alignSelf: 'center' }}>
                Try:
              </span>
              {[
                'Wave hello and introduce yourself!',
                'Tell me an exciting joke with big energy!',
                'Ponder a deep cosmic mystery.',
                'Celebrate achieving our goal!',
              ].map((suggestion, i) => (
                <button
                  key={i}
                  type="button"
                  className="gemini-prompt-chip"
                  onClick={() => {
                    setGeminiPrompt(suggestion);
                    if (onAskGemini) {
                      onAskGemini({ prompt: suggestion, voice: selectedVoice });
                    }
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Input & Send Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!geminiPrompt.trim() || isGeminiLoading) return;
                if (onAskGemini) {
                  onAskGemini({ prompt: geminiPrompt, voice: selectedVoice });
                }
              }}
              style={{ display: 'flex', gap: '8px' }}
            >
              <input
                type="text"
                className="expression-input"
                value={geminiPrompt}
                onChange={(e) => setGeminiPrompt(e.target.value)}
                placeholder="Ask Gemini AI anything (Avatar will speak & act it out)..."
                disabled={isGeminiLoading}
              />
              <button
                type="submit"
                className="gemini-send-btn"
                disabled={isGeminiLoading || !geminiPrompt.trim()}
              >
                {isGeminiLoading ? (
                  <>
                    <Sparkles size={14} />
                    <span>Thinking...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Ask Gemini</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Preset LLM Scenarios */}
          <div className="scenario-shelf">
            <span className="shelf-label">Interactive LLM Scenarios:</span>
            <div className="scenario-chips-row">
              {PRESET_SCENARIOS.map((sc, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="scenario-chip"
                  onClick={() => handleScenarioClick(sc)}
                  title={sc.text}
                >
                  <span className="scenario-title">{sc.title}</span>
                  <span className="scenario-tag">{sc.tag}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="expression-category-tabs">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-tab-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Category Emotion Chips */}
          <div className="expression-chips-grid">
            {Object.entries(EXPRESSION_SCHEMA[activeCategory] || {}).map(([key, def]) => (
              <button
                key={key}
                type="button"
                className={`expression-chip ${activeTags.includes(key) ? 'active' : ''}`}
                onClick={() => handleChipClick(key, def)}
                title={`Play [${key}] expression`}
              >
                <span className="chip-emoji">{def.emoji || '💬'}</span>
                <span className="chip-label">[{key}]</span>
              </button>
            ))}
          </div>

          {/* Custom Tag Input Form */}
          <form className="expression-input-form" onSubmit={handleSubmit}>
            <div className="input-wrap">
              <input
                type="text"
                className="expression-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type text with tags, e.g. [excitedly, very_fast] We did it!"
              />
              <button
                type="submit"
                className="play-expression-btn"
                disabled={isSpeaking}
                title="Play expression with speech and facial animation"
              >
                <Play size={16} fill="currentColor" />
                <span>{isSpeaking ? 'Playing...' : 'Play & Speak'}</span>
              </button>
            </div>
            <span className="input-hint">
              Tip: Combine tags like <code>[thinking, slowly]</code> or <code>[whispers, mischievous]</code>
            </span>
          </form>
        </div>
      )}
    </div>
  );
}
