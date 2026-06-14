import React, { useMemo } from 'react';

function Preview({ html, css, js }) {
  const srcDoc = useMemo(() => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${css}</style>
      </head>
      <body>
        ${html}
        <script>
          try {
            ${js}
          } catch (e) {
            const pre = document.createElement('pre');
            pre.style.whiteSpace = 'pre-wrap';
            pre.style.background = '#111';
            pre.style.color = '#ff6b6b';
            pre.style.padding = '12px';
            pre.style.borderRadius = '8px';
            pre.textContent = 'JS Error: ' + (e && e.message ? e.message : e);
            document.body.appendChild(pre);
          }
        </script>
      </body>
      </html>
    `;
  }, [html, css, js]);

  return (
    <div className="preview-box" style={{ height: '100%', width: '100%' }}>
      <iframe
        srcDoc={srcDoc}
        title="output-window"
        sandbox="allow-scripts"
        frameBorder="0"
        width="100%"
        height="100%"
        className="preview-iframe"
        style={{ backgroundColor: '#fff', height: '100%', width: '100%' }}
      />
    </div>
  );
}

export default Preview;