import React, { useState, useEffect } from 'react';
import './App.css';
import Editor from './components/Editor';
import Preview from './components/Preview';

const INITIAL_HTML = `<!doctype html>
<html lang="en">
  <body>
    <div class="card">
      <h2>CodeCraft Pro v2 🚀</h2>
      <p>Edit your code via tabs or File Explorer and click Run!</p>
      <button onclick="showSuccessAlert()">Click Me</button>
    </div>
    <script src="js/script.js"></script>
</body>
</html>`;

const INITIAL_CSS = `body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  padding: 30px;
  background: #0f172a;
  color: #f8fafc;
  display: flex;
  justify-content: center;
}
.card {
  background: #1e293b;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
  text-align: center;
  max-width: 400px;
}
h2 { color: #38bdf8; margin-bottom: 8px; }
p { color: #94a3b8; font-size: 0.95rem; }
button {
  margin-top: 16px;
  padding: 10px 20px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}`;

const INITIAL_JS = `function showSuccessAlert() {
  console.log("Button click triggered successfully!");
  alert("Perfect! All features are running smoothly. 🎉");
}`;

function App() {
  // Auto Save: Persistence using LocalStorage
  const [html, setHtml] = useState(() => localStorage.getItem('cc_html') || INITIAL_HTML);
  const [css, setCss] = useState(() => localStorage.getItem('cc_css') || INITIAL_CSS);
  const [js, setJs] = useState(() => localStorage.getItem('cc_js') || INITIAL_JS);

  const [activeTab, setActiveTab] = useState('html');
  const [theme, setTheme] = useState('vs-dark'); // vs-dark, dracula, monokai
  const [consoleLogs, setConsoleLogs] = useState(["Console initialized...", "System Ready. Click 'Run Code' to execute."]);
  
  // Dynamic Text for Copy Button
  const [copyText, setCopyText] = useState("📋 Copy");

  // Preview State triggered by Run Button
  const [previewData, setPreviewData] = useState({ html, css, js });

  // Auto-Save Effect
  useEffect(() => {
    localStorage.setItem('cc_html', html);
    localStorage.setItem('cc_css', css);
    localStorage.setItem('cc_js', js);
  }, [html, css, js]);

  // Run Button Handler (Updates Preview & Simulated Console)
  const handleRun = () => {
    setPreviewData({ html, css, js });
    const timestamp = new Date().toLocaleTimeString();
    setConsoleLogs(prev => [
      ...prev, 
      `[${timestamp}] Code executed successfully.`
    ]);
  };

  // 100% Fixed Full Screen Preview (Using Safe Iframe Isolation)
  const handleFullScreenPreview = () => {
    // Wrapping user HTML + CSS + JS in a safe document string
    const userSrcDoc = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <style>${css}</style>
      </head>
      <body>
        ${html}
        <script>
          const _log = console.log;
          console.log = function(...args) {
            _log(...args);
            if (window.opener) {
              window.opener.postMessage({ type: 'CONSOLE_LOG', data: args.join(' ') }, '*');
            }
          };
          try {
            ${js}
          } catch (err) {
            console.error(err);
          }
        </script>
      </body>
      </html>
    `.replace(/"/g, '&quot;').replace(/'/g, '&#39;'); // Escaping for attribute safety

    // Pure Tab UI control structure (Grid based)
    const combinedCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CodeCraft Pro - Full Screen Preview</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      height: 100%;
      width: 100%;
      background-color: #0f172a;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      overflow: hidden;
    }
    .fullscreen-wrapper {
      display: flex;
      flex-direction: column;
      height: 100vh;
      width: 100vw;
    }
    /* Fixed Action Bar UI */
    .preview-action-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #0b0f19;
      padding: 0 24px;
      height: 56px;
      min-height: 56px;
      border-bottom: 1px solid #1f2937;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
    }
    .preview-title-badge {
      font-weight: 600;
      font-size: 0.95rem;
      color: #38bdf8;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .close-preview-btn {
      background-color: #1e293b;
      color: #cbd5e1;
      border: 1px solid #334155;
      padding: 8px 18px;
      font-size: 0.85rem;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
    }
    .close-preview-btn:hover {
      background-color: #334155;
      color: #ffffff;
      border-color: #475569;
    }
    /* Iframe Container fills the rest of the window perfectly */
    .iframe-render-holder {
      flex: 1;
      width: 100%;
      height: calc(100vh - 56px);
      border: none;
      background-color: #0f172a;
    }
  </style>
</head>
<body>

  <div class="fullscreen-wrapper">
    <div class="preview-action-bar">
      <div class="preview-title-badge">
        <span style="font-size: 1.2rem;">🚀</span> 
        <span>CodeCraft Pro Sandbox Preview</span>
      </div>
      <button class="close-preview-btn" onclick="window.close()">
        <span>⬅</span> Close & Back to Editor
      </button>
    </div>

    <iframe class="iframe-render-holder" srcdoc="${userSrcDoc}" sandbox="allow-scripts"></iframe>
  </div>

</body>
</html>`;

    const blob = new Blob([combinedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  // Clipboard Copier with Dynamic Feedback
  const handleCopy = () => {
    let currentCode = activeTab === 'html' ? html : activeTab === 'css' ? css : js;
    navigator.clipboard.writeText(currentCode);
    
    setCopyText("✅ Copied!");
    setTimeout(() => {
      setCopyText("📋 Copy");
    }, 2000);
  };

  // Character and Line counts tracker
  const getCounts = () => {
    const code = activeTab === 'html' ? html : activeTab === 'css' ? css : js;
    const lines = code.split('\n').length;
    const chars = code.length;
    return { lines, chars };
  };

  const currentCounts = getCounts();

  return (
    <div className={`app-container theme-${theme}`}>
      {/* Modern Navbar with Logo and Branding */}
      <header className="app-header">
        <div className="header-logo-block">
          <div className="logo-title">🚀 CodeCraft Pro</div>
          <div className="logo-subtitle">Online Code Editor</div>
        </div>
        
        <div className="control-center">
          {/* Theme Switcher */}
          <span className="control-label">Theme:</span>
          <select className="theme-dropdown" value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="vs-dark">VS Code Dark</option>
            <option value="dracula">Dracula</option>
            <option value="monokai">Monokai</option>
          </select>

          <button className="nav-btn copy-btn" onClick={handleCopy}>{copyText}</button>
          <button className="nav-btn preview-btn" onClick={handleFullScreenPreview}>🌐 Full Screen</button>
          <button className="nav-btn run-btn" onClick={handleRun}>▶ Run Code</button>
        </div>
      </header>
      
      <main className="main-content">
        {/* File Explorer Sidebar Layout */}
        <aside className="file-explorer">
          <div className="explorer-title">📁 PROJECT ARCHIVE</div>
          <ul className="file-list">
            <li className={`file-item ${activeTab === 'html' ? 'selected' : ''}`} onClick={() => setActiveTab('html')}>
              📄 index.html
            </li>
            <li className={`file-item ${activeTab === 'css' ? 'selected' : ''}`} onClick={() => setActiveTab('css')}>
              📄 styles.css
            </li>
            <li className={`file-item ${activeTab === 'js' ? 'selected' : ''}`} onClick={() => setActiveTab('js')}>
              📄 script.js
            </li>
          </ul>
          <div className="auto-save-tag">● Auto-Saving Enabled</div>
        </aside>

        {/* Workspace Section: Navigation Tabs + Monaco + Output Console */}
        <section className="workspace-section">
          <div className="tab-navigation">
            <button className={`tab-btn ${activeTab === 'html' ? 'active html-tab' : ''}`} onClick={() => setActiveTab('html')}>
              index.html
            </button>
            <button className={`tab-btn ${activeTab === 'css' ? 'active css-tab' : ''}`} onClick={() => setActiveTab('css')}>
              styles.css
            </button>
            <button className={`tab-btn ${activeTab === 'js' ? 'active js-tab' : ''}`} onClick={() => setActiveTab('js')}>
              script.js
            </button>
          </div>

          <div className="editor-workspace">
            {activeTab === 'html' && <Editor title="HTML" value={html} onChange={setHtml} type="html" theme={theme} />}
            {activeTab === 'css' && <Editor title="CSS" value={css} onChange={setCss} type="css" theme={theme} />}
            {activeTab === 'js' && <Editor title="JavaScript" value={js} onChange={setJs} type="js" theme={theme} />}
          </div>

          {/* Output Console Panel System */}
          <div className="output-console-panel">
            <div className="console-title-bar">
              <span>🖥️ OUTPUT CONSOLE</span>
              <button className="clear-console-btn" onClick={() => setConsoleLogs([])}>Clear</button>
            </div>
            <div className="console-body">
              {consoleLogs.map((log, index) => (
                <div key={index} className="console-line">{log}</div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Side: Splitted Standard Live Preview Container */}
        <section className="preview-section">
          <div className="preview-header-bar">⚡ Live Preview Sandbox</div>
          <Preview html={previewData.html} css={previewData.css} js={previewData.js} />
        </section>
      </main>

      {/* Line Count & Character Count Bottom Status Bar */}
      <footer className="status-bar">
        <div className="status-left">
          <span>Lines: <b>{currentCounts.lines}</b></span>
          <span>Chars: <b>{currentCounts.chars}</b></span>
        </div>
        <div className="status-right">
          <span>Workspace: <b>{activeTab.toUpperCase()}</b></span>
          <span>Encoding: <b>UTF-8</b></span>
          <span className="storage-badge">💾 LocalStorage Active</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
