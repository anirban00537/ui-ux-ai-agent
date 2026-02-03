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
import { cn } from "@/lib/utils";

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
}

interface CodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlContent: string;
  title?: string;
  colorPalette?: ColorPalette;
}

export function CodeViewerModal({
  isOpen,
  onClose,
  htmlContent,
  title,
  colorPalette,
}: CodeViewerModalProps) {
  const [isCopied, setIsCopied] = useState(false);

  const generateFullHtml = useCallback(() => {
    const palette = colorPalette || {
      background: "#02040a",
      foreground: "#f8fafc",
      primary: "oklch(74.6% 0.16 232.661)",
      primaryForeground: "#faf7f5",
      secondary: "oklch(60% 0.15 235)",
      secondaryForeground: "#ffffff",
      mutedForeground: "#64748b",
      card: "#0a0f1e",
      cardForeground: "#f8fafc",
      border: "#161e2e",
      input: "#161e2e",
    };

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title || 'Butterfast Design'}</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100..800&family=Manrope:wght@200..800&family=Playfair+Display:wght@400..900&family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet">
    
    <!-- Icons -->
    <link href="https://cdn.jsdelivr.net/npm/remixicon@4.8.0/fonts/remixicon.css" rel="stylesheet">
    <script src="https://code.iconify.design/iconify-icon/3.0.0/iconify-icon.min.js"></script>
    
    <!-- Tailwind CSS v4 -->
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    
    <style type="text/tailwindcss">
      @theme inline {
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
        
        --font-sans: "Space Grotesk", sans-serif;
        --font-serif: "Playfair Display", serif;
        --font-mono: "JetBrains Mono", monospace;
      }

      :root {
        --background: ${palette.background};
        --foreground: ${palette.foreground};
        --primary: ${palette.primary};
        --primary-foreground: ${palette.primaryForeground};
        --secondary: ${palette.secondary};
        --secondary-foreground: ${palette.secondaryForeground};
        --muted-foreground: ${palette.mutedForeground};
        --card: ${palette.card};
        --card-foreground: ${palette.cardForeground};
        --border: ${palette.border};
        --input: ${palette.input};
        --radius: 1rem;
      }

      body {
        background-color: var(--background);
        color: var(--foreground);
        font-family: var(--font-sans);
        min-height: 100vh;
        margin: 0;
      }
    </style>
</head>
<body>
    <div id="root" class="w-full min-h-screen">
        ${htmlContent}
    </div>
</body>
</html>`;
  }, [htmlContent, title, colorPalette]);

  const handleCopyCode = useCallback(() => {
    const fullHtml = generateFullHtml();
    navigator.clipboard.writeText(fullHtml);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [generateFullHtml]);

  const handleDownloadCode = useCallback(() => {
    const fullHtml = generateFullHtml();
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(title || 'design').toLowerCase().replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [generateFullHtml, title]);

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
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
           <div className="flex items-center gap-3">
             <h2 className="text-xl font-semibold text-foreground tracking-tight">{title || 'Design'} Code</h2>
           </div>
           
           <div className="flex items-center gap-3">
             {/* Download Button */}
             <button 
                onClick={handleDownloadCode}
                className="flex items-center gap-2 px-4 py-1.5 bg-primary hover:opacity-90 text-primary-foreground rounded-lg text-sm font-semibold transition-all active:scale-95 shadow-lg shadow-primary/20"
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

        {/* Code Body */}
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
              value={generateFullHtml()}
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
