"use client";

import React, { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { Editor as MonacoEditor } from "@monaco-editor/react";
import { 
  Download, 
  Check, 
  X, 
  Copy 
} from "lucide-react";

interface ColorPalette {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  mutedForeground: string;
  card: string;
  cardForeground: string;
  border: string;
  input: string;
  fontHeading?: string;
  fontBody?: string;
}

interface CodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  htmlContent: string;
  colorPalette?: ColorPalette;
}

const constructFullHtml = (html: string, title: string, palette?: ColorPalette) => {
  const headingFont = palette?.fontHeading || 'Space Grotesk';
  const bodyFont = palette?.fontBody || 'Plus Jakarta Sans';
  
  const googleFontsUrl = `https://fonts.googleapis.com/css2?family=${headingFont.replace(/ /g, '+')}:wght@300;400;500;600;700&family=${bodyFont.replace(/ /g, '+')}:wght@300;400;500;600;700&display=swap`;

  return `<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="${googleFontsUrl}" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <style>
        :root {
            --background: ${palette?.background || '#ffffff'};
            --foreground: ${palette?.foreground || '#020617'};
            --primary: ${palette?.primary || '#3b82f6'};
            --primary-foreground: ${palette?.primaryForeground || '#ffffff'};
            --secondary: ${palette?.secondary || '#f1f5f9'};
            --secondary-foreground: ${palette?.secondaryForeground || '#0f172a'};
            --muted-foreground: ${palette?.mutedForeground || '#64748b'};
            --card: ${palette?.card || '#ffffff'};
            --card-foreground: ${palette?.cardForeground || '#020617'};
            --border: ${palette?.border || '#e2e8f0'};
            --input: ${palette?.input || '#e2e8f0'};
            --font-heading: '${headingFont}', sans-serif;
            --font-sans: '${bodyFont}', sans-serif;
        }

        @theme {
            --color-background: var(--background);
            --color-foreground: var(--foreground);
            --color-primary: var(--primary);
            --color-primary-foreground: var(--primary-foreground);
            --color-secondary: var(--secondary);
            --color-secondary-foreground: var(--secondary-foreground);
            --color-muted-foreground: var(--muted-foreground);
            --color-card: var(--card);
            --color-card-foreground: var(--card-foreground);
            --color-border: var(--border);
            --color-input: var(--input);
        }

        * {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        *::-webkit-scrollbar {
            display: none;
        }

        body {
            margin: 0;
            padding: 0;
            min-height: 100%;
            background: var(--background);
            font-family: var(--font-sans);
        }

        .font-heading { font-family: var(--font-heading); }
        .font-sans { font-family: var(--font-sans); }
    </style>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              background: 'var(--background)',
              foreground: 'var(--foreground)',
              primary: {
                DEFAULT: 'var(--primary)',
                foreground: 'var(--primary-foreground)',
              },
              secondary: {
                DEFAULT: 'var(--secondary)',
                foreground: 'var(--secondary-foreground)',
              },
              muted: {
                foreground: 'var(--muted-foreground)',
              },
              card: {
                DEFAULT: 'var(--card)',
                foreground: 'var(--card-foreground)',
              },
              border: 'var(--border)',
              input: 'var(--input)',
            },
            fontFamily: {
              sans: ['var(--font-sans)', 'sans-serif'],
              heading: ['var(--font-heading)', 'serif'],
            },
          },
        },
      }
    </script>
</head>
<body class="antialiased">
    ${html}
</body>
</html>`;
};

export function CodeViewerModal({
  isOpen,
  onClose,
  title,
  htmlContent,
  colorPalette,
}: CodeViewerModalProps) {
  const [isCopied, setIsCopied] = useState(false);
  
  const finalHtml = React.useMemo(() => constructFullHtml(htmlContent, title, colorPalette), [htmlContent, title, colorPalette]);

  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(finalHtml);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [finalHtml]);

  const handleDownloadCode = useCallback(() => {
    const blob = new Blob([finalHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [finalHtml, title]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-5xl h-full max-h-[85vh] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
           <div className="flex items-center gap-3">
             <h2 className="text-xl font-semibold text-foreground tracking-tight">
               {title || 'Design'} Code
             </h2>
           </div>
           
           <div className="flex items-center gap-3">
              <button 
                 onClick={handleDownloadCode}
                 className="flex items-center gap-2 px-4 py-1.5 bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground rounded-lg text-sm font-semibold transition-all active:scale-95 shadow-lg shadow-primary/20"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
             </button>

             <button 
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors ml-2"
             >
              <X className="w-5 h-5" />
             </button>
           </div>
        </div>

        <div className="flex-1 overflow-hidden relative group">
          <div className="absolute top-4 right-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={handleCopyCode}
                className="p-2.5 bg-background border border-border hover:bg-muted rounded-xl text-foreground transition-all active:scale-90 shadow-xl"
                title="Copy Code"
              >
                {isCopied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
              </button>
          </div>
          
          <div className="w-full h-full">
            <MonacoEditor
              height="100%"
              defaultLanguage="html"
              value={finalHtml}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', monospace",
                lineNumbers: "on",
                roundedSelection: true,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 20, bottom: 20 },
                cursorStyle: "line",
                wordWrap: "on",
                folding: true,
                lineDecorationsWidth: 10,
                contextmenu: false,
              }}
              beforeMount={(monaco) => {
                monaco.editor.defineTheme('custom-dark', {
                  base: 'vs-dark',
                  inherit: true,
                  rules: [],
                  colors: {
                    'editor.background': '#02040a',
                    'editor.lineHighlightBackground': '#0a0f1e',
                    'editorLineNumber.foreground': '#64748b',
                  }
                });
              }}
              theme="custom-dark"
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
