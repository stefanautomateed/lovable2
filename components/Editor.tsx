'use client';

import { useEffect, useRef, useState } from 'react';
import MonacoEditor from '@monaco-editor/react';

interface EditorProps {
  path: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export function Editor({ path, value, onChange, readOnly = false }: EditorProps) {
  const [language, setLanguage] = useState('typescript');

  useEffect(() => {
    // Determine language from file extension
    const ext = path.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx':
      case 'ts':
        setLanguage('typescript');
        break;
      case 'jsx':
      case 'js':
        setLanguage('javascript');
        break;
      case 'css':
        setLanguage('css');
        break;
      case 'json':
        setLanguage('json');
        break;
      case 'md':
        setLanguage('markdown');
        break;
      default:
        setLanguage('plaintext');
    }
  }, [path]);

  return (
    <div className="h-full w-full monaco-editor-container">
      <MonacoEditor
        height="100%"
        language={language}
        value={value}
        onChange={value => !readOnly && onChange(value || '')}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          readOnly,
        }}
      />
    </div>
  );
}
