import React, { useState } from 'react';
import Avatar from 'react-nice-avatar';
import { X, Download, Copy, Check, FileCode, Sliders, Image, Code } from 'lucide-react';

export default function ExportModal({ isOpen, onClose, config, onImportConfig }) {
  const [activeTab, setActiveTab] = useState('image');
  const [copiedJSX, setCopiedJSX] = useState(false);
  const [copiedJSON, setCopiedJSON] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [importError, setImportError] = useState('');

  if (!isOpen) return null;

  const jsxSnippet = `import Avatar from 'react-nice-avatar';

export default function MyUserAvatar() {
  const avatarConfig = ${JSON.stringify(config, null, 2)};

  return (
    <Avatar
      style={{ width: '8rem', height: '8rem' }}
      {...avatarConfig}
    />
  );
}`;

  const jsonSnippet = JSON.stringify(config, null, 2);

  const getSvgElement = () => {
    return document.getElementById('main-react-nice-avatar') ||
      document.querySelector('#avatar-render-target svg');
  };

  const handleDownloadSVG = () => {
    const svgEl = getSvgElement();
    if (!svgEl) {
      alert('Avatar SVG element not found in DOM.');
      return;
    }
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `avatar-${config.sex}-${Date.now()}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  const handleDownloadPNG = (resolution = 800) => {
    const svgEl = getSvgElement();
    if (!svgEl) {
      alert('Avatar SVG element not found in DOM.');
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const image = new window.Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = resolution;
      canvas.height = resolution;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(image, 0, 0, resolution, resolution);
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `avatar-${config.sex}-${resolution}px-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
    };
    image.src = url;
  };

  const handleCopyJSX = () => {
    navigator.clipboard.writeText(jsxSnippet);
    setCopiedJSX(true);
    setTimeout(() => setCopiedJSX(false), 2000);
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(jsonSnippet);
    setCopiedJSON(true);
    setTimeout(() => setCopiedJSON(false), 2000);
  };

  const handleApplyJSON = () => {
    setImportError('');
    try {
      const parsed = JSON.parse(jsonInput);
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Config must be a valid JSON object');
      }
      onImportConfig(parsed);
      onClose();
    } catch (err) {
      setImportError('Invalid JSON format. Please check your syntax.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Download size={20} className="text-accent" />
            <h2 className="modal-title">Export & Share Avatar</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="modal-tabs">
          <button
            className={`modal-tab-btn ${activeTab === 'image' ? 'active' : ''}`}
            onClick={() => setActiveTab('image')}
          >
            <Image size={15} />
            <span>Image Assets</span>
          </button>
          <button
            className={`modal-tab-btn ${activeTab === 'jsx' ? 'active' : ''}`}
            onClick={() => setActiveTab('jsx')}
          >
            <Code size={15} />
            <span>React JSX</span>
          </button>
          <button
            className={`modal-tab-btn ${activeTab === 'json' ? 'active' : ''}`}
            onClick={() => setActiveTab('json')}
          >
            <FileCode size={15} />
            <span>JSON Config</span>
          </button>
        </div>

        <div className="modal-body">
          {/* IMAGE TAB */}
          {activeTab === 'image' && (
            <div className="export-grid-options">
              <div className="export-card">
                <div className="export-card-info">
                  <h3 className="card-headline">Vector SVG</h3>
                  <p className="card-desc">
                    Infinite scale, perfectly crisp, ultra lightweight. Ideal for web apps and illustration.
                  </p>
                </div>
                <button className="primary-btn full-width" onClick={handleDownloadSVG}>
                  <Download size={16} />
                  <span>Download SVG</span>
                </button>
              </div>

              <div className="export-card">
                <div className="export-card-info">
                  <h3 className="card-headline">High-Res PNG (800x800)</h3>
                  <p className="card-desc">
                    High pixel density with crisp details. Great for profile pictures, Discord, GitHub, and social media.
                  </p>
                </div>
                <button className="primary-btn full-width" onClick={() => handleDownloadPNG(800)}>
                  <Download size={16} />
                  <span>Download PNG (800px)</span>
                </button>
              </div>

              <div className="export-card">
                <div className="export-card-info">
                  <h3 className="card-headline">Ultra HD PNG (1600x1600)</h3>
                  <p className="card-desc">
                    Maximum fidelity 2x retina asset suitable for print or large displays.
                  </p>
                </div>
                <button className="secondary-btn full-width" onClick={() => handleDownloadPNG(1600)}>
                  <Download size={16} />
                  <span>Download Ultra HD (1600px)</span>
                </button>
              </div>
            </div>
          )}

          {/* JSX TAB */}
          {activeTab === 'jsx' && (
            <div className="code-export-area">
              <div className="code-header">
                <span>React Component Code</span>
                <button className="copy-code-btn" onClick={handleCopyJSX}>
                  {copiedJSX ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                  <span>{copiedJSX ? 'Copied to Clipboard!' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="code-block">
                <code>{jsxSnippet}</code>
              </pre>
            </div>
          )}

          {/* JSON TAB */}
          {activeTab === 'json' && (
            <div className="json-export-area">
              <div className="code-header">
                <span>Active Avatar Configuration</span>
                <button className="copy-code-btn" onClick={handleCopyJSON}>
                  {copiedJSON ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                  <span>{copiedJSON ? 'Copied JSON!' : 'Copy JSON'}</span>
                </button>
              </div>
              <pre className="code-block" style={{ maxHeight: '180px' }}>
                <code>{jsonSnippet}</code>
              </pre>

              <div className="json-import-box">
                <label className="import-label">Import / Paste JSON Config</label>
                <textarea
                  className="import-textarea"
                  placeholder='Paste JSON here (e.g. { "sex": "woman", "hairStyle": "womanLong" })'
                  rows={3}
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                />
                {importError && <p className="error-text">{importError}</p>}
                <button
                  className="secondary-btn apply-btn"
                  onClick={handleApplyJSON}
                  disabled={!jsonInput.trim()}
                >
                  Apply Config to Avatar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
