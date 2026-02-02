"use client";

import React, { useCallback, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { MobileFrame } from "@/components/design-editor/MobileFrame";
import { Trash2, Copy, Check } from "lucide-react";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";
import { DesignType } from "@/services/designs";

interface Artboard {
  id: string;
  title: string;
  description?: string;
  html: string;
  createdAt: string;
  status?: 'generating' | 'complete';
}

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

interface EditorProps {
  artboards: Artboard[];
  designType?: DesignType;
  loading?: boolean;
  error?: string;
  colorPalette?: ColorPalette;
  onDeleteArtboard?: (artboardId: string, artboardTitle: string) => void;
}

export function Editor({
  artboards,
  designType = "mobile_app",
  loading,
  error,
  colorPalette,
  onDeleteArtboard,
}: EditorProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = useCallback(async (html: string, id: string) => {
    try {
      await navigator.clipboard.writeText(html);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = html;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }, []);

  return (
    <div className="w-full h-full bg-background relative overflow-hidden isolate">
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 -z-20 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: `linear-gradient(to right, #64748b 1px, transparent 1px), linear-gradient(to bottom, #64748b 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} 
      />
      
      {/* Dot Pattern with better fade */}
      <DotPattern
        className={cn(
          "[mask-image:radial-gradient(ellipse_at_center,white_20%,transparent_90%)] opacity-30"
        )}
        width={24}
        height={24}
        cr={0.8}
      />
      
      {/* Radial Glow */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.03)_0%,transparent_70%)] pointer-events-none" />

      <TransformWrapper
        initialScale={0.6}
        minScale={0.1}
        maxScale={3}
        centerOnInit={true}
        limitToBounds={false}
        panning={{ excluded: ["input", "textarea", "button", "select"] }}
        wheel={{ step: 0.1 }}
        doubleClick={{ disabled: true }}
        pinch={{ step: 5 }}
      >
        {({ zoomIn, zoomOut, resetTransform, instance }) => (
          <>
            <div className="absolute top-6 right-6 z-20">
              <div className="flex items-center gap-1.5 bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-1.5 shadow-2xl ring-1 ring-white/5">
                <button
                  onClick={() => zoomOut()}
                  className="p-2.5 hover:bg-white/5 rounded-xl transition-all duration-200 text-muted-foreground hover:text-foreground active:scale-95"
                  title="Zoom Out"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <div className="flex flex-col items-center justify-center min-w-[3.5rem] px-1 group cursor-default">
                  <span className="text-[11px] font-bold text-foreground/90 tracking-tight">
                    {Math.round((instance?.transformState?.scale ?? 1) * 100)}%
                  </span>
                </div>
                <button
                  onClick={() => zoomIn()}
                  className="p-2.5 hover:bg-white/5 rounded-xl transition-all duration-200 text-muted-foreground hover:text-foreground active:scale-95"
                  title="Zoom In"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <div className="w-px h-4 bg-border/50 mx-1" />
                <button
                  onClick={() => resetTransform()}
                  className="p-2.5 hover:bg-white/5 rounded-xl transition-all duration-200 text-muted-foreground hover:text-foreground active:scale-95"
                  title="Reset View"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
            <TransformComponent
              wrapperStyle={{ width: "100%", height: "100%" }}
              contentStyle={{ width: "max-content", height: "max-content" }}
            >
              <div
                className="flex items-center justify-center p-20 gap-12"
                style={{ minWidth: "800px", minHeight: "800px" }}
              >
                {artboards.map((artboard) => (
                  <div key={artboard.id} className="relative group">
                    <div className="absolute -top-3 -right-3 z-30 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={() => handleCopy(artboard.html, artboard.id)}
                        className="rounded-full p-3 bg-card/90 hover:bg-card backdrop-blur-md text-foreground border border-border shadow-depth-2 hover:scale-110 transition-all active:scale-95"
                        title={`Copy HTML`}
                      >
                        {copiedId === artboard.id ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        )}
                      </button>
                      {onDeleteArtboard && (
                        <button
                          onClick={() => onDeleteArtboard(artboard.id, artboard.title)}
                          className="rounded-full p-3 bg-red-500/10 hover:bg-red-500/20 backdrop-blur-md text-red-500 border border-red-500/20 shadow-depth-2 hover:scale-110 transition-all active:scale-95"
                          title={`Delete ${artboard.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <MobileFrame
                      title={artboard.title}
                      subtitle={loading ? "Generating..." : artboard.description}
                      htmlContent={artboard.html}
                      width={440}
                      colorPalette={colorPalette}
                      isGenerating={artboard.status === 'generating'}
                    />
                  </div>
                ))}
              </div>
            </TransformComponent>
            <div className="absolute bottom-6 left-6 z-20">
              <div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800/50 rounded-xl px-4 py-3 shadow-xl ring-1 ring-white/5">
                <p className="text-sm text-white/80 font-medium">
                  {artboards.length} screen{artboards.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            {error && (
              <div className="absolute top-4 left-4 right-4 bg-red-50 border border-red-200 text-red-700 rounded-md px-3 py-2 text-sm z-20">
                <div className="flex items-start gap-2">
                  <div className="flex-1">{error}</div>
                  {error.includes("Insufficient credits") && (
                    <a
                      href="/subscription"
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors whitespace-nowrap"
                    >
                      Upgrade
                    </a>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
