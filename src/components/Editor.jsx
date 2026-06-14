import React from 'react';
import MonacoEditor from '@monaco-editor/react';

function Editor({ title, value, onChange, type, theme }) {
  // Monaco editor language types must follow strict standard formats
  const getLanguage = (type) => {
    if (type === 'js') return 'javascript';
    return type; // html and css remain the same
  };

  return (
    <div className={`editor-wrapper wrapper-${type}`} style={{ height: '100%', width: '100%' }}>
      <MonacoEditor
        // Adjusting height to accommodate header and navigation tabs
        height="calc(100vh - 120px)" 
        language={getLanguage(type)}
        theme={theme} // Supports dynamic theme toggling
        value={value}
        onChange={(val) => onChange(val || '')}
        options={{
          fontSize: 14,
          minimap: { enabled: false }, // Hides the side code minimap
          wordWrap: 'on',
          automaticLayout: true, // Automatically adjusts when window is resized
          tabSize: 2,
        }}
      />
    </div>
  );
}

export default Editor;