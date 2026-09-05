import React, { useState, useRef } from 'react';
import Avatar from 'react-nice-avatar';
import { ZoomIn, ZoomOut, Sparkles, Copy, Check, Download, Maximize2 } from 'lucide-react';

export default function AvatarStage({
  config,
  onChangeConfig,
  onRandomize,
  onOpenExport,
}) {
  const [zoom, setZoom] = useState(260);
  const [copied, setCopied] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const avatarWrapperRef = useRef(null);

  const handleAvatarClick = () => {
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 500);
  };

  const handleCopyJSX = () => {
    const code = `<Avatar\n  style={{ width: '12rem', height: '12rem' }}\n  {...${JSON.stringify(config, null, 2)}}\n/>`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="stage-container" aria-label="Avatar Canvas">
      {/* Top stage controls */}
      <div className="stage-topbar">
        <div className="shape-switcher">
          <button
            className={`shape-pill ${config.shape === 'circle' ? 'active' : ''}`}
            onClick={() => onChangeConfig({ shape: 'circle' })}
            title="Circle Shape"
          >
            Circle
          </button>
          <button
            className={`shape-pill ${config.shape === 'rounded' ? 'active' : ''}`}
            onClick={() => onChangeConfig({ shape: 'rounded' })}
            title="Rounded Shape"
          >
            Rounded
          </button>
          <button
            className={`shape-pill ${config.shape === 'square' ? 'active' : ''}`}
            onClick={() => onChangeConfig({ shape: 'square' })}
            title="Square Shape"
          >
            Square
          </button>
        </div>

        <div className="zoom-controller">
          <button
            className="zoom-btn"
            onClick={() => setZoom((z) => Math.max(160, z - 30))}
            title="Zoom Out"
            disabled={zoom <= 160}
          >
            <ZoomOut size={15} />
          </button>
          <span className="zoom-label">{zoom}px</span>
          <button
            className="zoom-btn"
            onClick={() => setZoom((z) => Math.min(400, z + 30))}
            title="Zoom In"
            disabled={zoom >= 400}
          >
            <ZoomIn size={15} />
          </button>
        </div>
      </div>

      {/* Main Center Avatar Showcase */}
      <div className="stage-viewport">
        <div
          ref={avatarWrapperRef}
          className={`avatar-halo-wrapper ${isBouncing ? 'bounce-active' : ''}`}
          onClick={handleAvatarClick}
          title="Click me for a playful bounce!"
          id="avatar-render-target"
        >
          <div className="avatar-shadow-pod" />
          <div
            className="avatar-container-inner"
            style={{
              width: `${zoom}px`,
              height: `${zoom}px`,
            }}
          >
            <Avatar
              id="main-react-nice-avatar"
              style={{
                width: '100%',
                height: '100%',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              {...config}
            />
          </div>
        </div>

        <span className="stage-hint">
          Click avatar to bounce • Pure white backdrop
        </span>
      </div>

      {/* Floating Center Actions Dock */}
      <div className="stage-floating-dock">
        <button
          className="dock-btn dock-btn-primary"
          onClick={onRandomize}
          title="Roll random attributes"
        >
          <Sparkles size={16} />
          <span>Randomize</span>
        </button>

        <div className="dock-divider" />

        <button
          className="dock-btn"
          onClick={handleCopyJSX}
          title="Copy React JSX code"
        >
          {copied ? <Check size={16} className="text-emerald" /> : <Copy size={16} />}
          <span>{copied ? 'Copied JSX!' : 'Copy JSX'}</span>
        </button>

        <button
          className="dock-btn"
          onClick={onOpenExport}
          title="Export high-res image or SVG"
        >
          <Download size={16} />
          <span>Download</span>
        </button>
      </div>
    </section>
  );
}
