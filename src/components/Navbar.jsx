import React from 'react';
import { Sparkles, Undo2, Redo2, Download, RefreshCw } from 'lucide-react';

export default function Navbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onRandomize,
  onReset,
  onOpenExport,
}) {
  return (
    <header className="navbar">
      <div className="nav-brand">
        <div className="logo-badge">
          <Sparkles className="icon-sparkle" size={18} />
        </div>
        <div>
          <h1 className="brand-title">Avatar Studio</h1>
          <span className="brand-subtitle">Powered by react-nice-avatar</span>
        </div>
      </div>

      <div className="nav-center-actions">
        <button
          className="icon-btn"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={16} />
        </button>
        <button
          className="icon-btn"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={16} />
        </button>
        <button
          className="action-pill-btn randomize-btn"
          onClick={onRandomize}
          title="Randomize style"
        >
          <Sparkles size={15} />
          <span>Randomize</span>
        </button>
        <button
          className="icon-btn"
          onClick={onReset}
          title="Reset to default"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      <div className="nav-right">
        <button className="primary-btn export-nav-btn" onClick={onOpenExport}>
          <Download size={16} />
          <span>Export Avatar</span>
        </button>
      </div>
    </header>
  );
}
