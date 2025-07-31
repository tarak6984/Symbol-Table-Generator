import React from 'react';
import type { SupportedLanguage } from '../types/symbol';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: SupportedLanguage;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange }) => {
  const lineNumbers = value.split('\n').map((_, index) => index + 1);
  const editorRef = React.useRef<HTMLDivElement>(null);
  const lineNumbersRef = React.useRef<HTMLDivElement>(null);

  // Sync scroll between line numbers and code
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (lineNumbersRef.current && e.target !== lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = (e.target as HTMLDivElement).scrollTop;
    }
  };

  // Simple escape function to prevent XSS
  const escapeHtml = (unsafe: string): string => {
    if (!unsafe) return '';
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/ /g, '&nbsp;')
      .replace(/\t/g, '&nbsp;&nbsp;');
  };

  // Process each line of code
  const processCode = (code: string) => {
    if (!code) return [];
    return code.split('\n').map(line => ({
      html: line ? escapeHtml(line) : '&nbsp;',
      original: line
    }));
  };

  const processedLines = processCode(value);

  return (
    <div className="code-editor relative rounded-xl overflow-hidden">
      {/* Editor Header */}
      <div className="flex items-center justify-end px-4 py-2 border-b border-[var(--editor-border)]" style={{ backgroundColor: 'var(--editor-header-bg)' }}>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex h-[500px] overflow-hidden bg-[var(--editor-bg)]">
        {/* Line Numbers */}
        <div 
          ref={lineNumbersRef}
          className="px-3 py-4 text-sm font-mono select-none border-r border-[var(--editor-border)] min-w-[3rem] text-right overflow-y-auto"
          style={{ 
            color: 'var(--editor-line-numbers)', 
            backgroundColor: 'var(--editor-header-bg)',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <div className="h-full flex flex-col">
            {lineNumbers.map((lineNum) => (
              <div key={lineNum} className="leading-7 h-7 flex items-center justify-end">
                {lineNum}
              </div>
            ))}
          </div>
        </div>

        {/* Code Area */}
        <div 
          ref={editorRef}
          className="flex-1 relative overflow-auto"
          onScroll={handleScroll}
        >
          <div className="relative min-h-full">
            {/* Textarea for input - hidden but interactive */}
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="absolute inset-0 w-full p-4 bg-transparent text-transparent caret-white resize-none outline-none tracking-wide font-mono"
              style={{
                fontFamily: 'Fira Code, Menlo, Monaco, Consolas, monospace',
                lineHeight: '1.75',
                fontSize: '15px',
                zIndex: 2,
                overflow: 'hidden',
                minHeight: '100%',
                boxSizing: 'border-box',
                whiteSpace: 'pre',
                tabSize: 2,
                textAlign: 'left',
                letterSpacing: 'normal',
                wordSpacing: 'normal',
                textTransform: 'none',
                textIndent: 0,
                textShadow: 'none',
                wordWrap: 'normal',
                wordBreak: 'normal',
                overflowWrap: 'normal'
              }}
              spellCheck={false}
              placeholder="Enter your code here..."
            />
            
            {/* Visible code */}
            <pre 
              className="absolute inset-0 p-4 m-0 font-mono"
              style={{
                fontFamily: 'Fira Code, Menlo, Monaco, Consolas, monospace',
                fontSize: '15px',
                lineHeight: '1.75',
                margin: 0,
                padding: '1rem',
                pointerEvents: 'none',
                zIndex: 1,
                minHeight: '100%',
                boxSizing: 'border-box',
                backgroundColor: 'var(--editor-bg)',
                whiteSpace: 'pre',
                wordBreak: 'break-word',
                tabSize: 2,
                overflow: 'visible',
                textAlign: 'left'
              }}
            >
              {processedLines.map((line, index) => (
                <div 
                  key={index} 
                  className="block min-h-[1.75rem] leading-7"
                  dangerouslySetInnerHTML={{ __html: line.html }}
                />
              ))}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};



export default CodeEditor;