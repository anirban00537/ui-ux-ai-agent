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

import { useArtboardCode } from "@/hooks/use-export";

interface CodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  artboardId: string;
}

export function CodeViewerModal({
  isOpen,
  onClose,
  artboardId,
}: CodeViewerModalProps) {
  const [isCopied, setIsCopied] = useState(false);
  const { data: codeData, isLoading } = useArtboardCode(isOpen ? artboardId : null);

  const handleCopyCode = useCallback(() => {
    if (!codeData?.data.html) return;
    navigator.clipboard.writeText(codeData.data.html);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [codeData]);

  const handleDownloadCode = useCallback(() => {
    if (!codeData?.data.html) return;
    const blob = new Blob([codeData.data.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const title = codeData.data.title || 'design';
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [codeData]);

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
             <h2 className="text-xl font-semibold text-foreground tracking-tight">
               {codeData?.data.title || 'Design'} Code
             </h2>
           </div>
           
           <div className="flex items-center gap-3">
             {/* Download Button */}
             <button 
                onClick={handleDownloadCode}
                disabled={isLoading}
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

        {/* Code Body */}
        <div className="flex-1 overflow-hidden relative group">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-30">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-sm text-muted-foreground font-medium">Fetching code...</p>
              </div>
            </div>
          ) : (
            <div className="absolute top-4 right-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={handleCopyCode}
                  className="p-2.5 bg-background border border-border hover:bg-muted rounded-xl text-foreground transition-all active:scale-90 shadow-xl"
                  title="Copy Code"
                >
                  {isCopied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                </button>
            </div>
          )}
          
          <div className="w-full h-full">
            <MonacoEditor
              height="100%"
              defaultLanguage="html"
              value={codeData?.data.html || ""}
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
