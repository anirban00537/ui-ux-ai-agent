"use client";

import React, { useCallback, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { MobileFrame } from "@/components/design-editor/MobileFrame";
import { Trash2, Copy, Check } from "lucide-react";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";
import { DesignType, updateArtboard } from "@/services/designs";

interface Artboard {
  id: string;
  title: string;
  description?: string;
  html: string;
  createdAt: string;
  status?: 'generating' | 'complete';
  x?: number;
  y?: number;
  width?: number;
  height?: number;
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
  onUpdateArtboard?: (artboardId: string, prompt: string) => void;
}

export function Editor({
  artboards,
  designType = "mobile_app",
  loading,
  error,
  colorPalette,
  onDeleteArtboard,
  onUpdateArtboard,
}: EditorProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Debounce save requests to avoid spamming the API
  const saveTimeouts = React.useRef<Record<string, NodeJS.Timeout>>({});

  const handleSave = useCallback((id: string, data: { x?: number; y?: number; width?: number; height?: number }) => {
    if (saveTimeouts.current[id]) {
      clearTimeout(saveTimeouts.current[id]);
    }

    saveTimeouts.current[id] = setTimeout(() => {
      updateArtboard(id, data);
      delete saveTimeouts.current[id];
    }, 1000);
  }, []);

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
        panning={{ 
          excluded: ["input", "textarea", "button", "select", "mobile-frame-container", "drag-target"] 
        }}
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
              wrapperStyle={{ 
                width: "100%", 
                height: "calc(100svh - var(--header-height, 3.5rem))", 
                flex: 1,
                overflow: "hidden" 
              }}
              contentStyle={{ width: "max-content", height: "max-content" }}
            >
              <div
                className="relative bg-dot-pattern"
                style={{ 
                  width: "6000px", 
                  height: "3200px",
                  // Center the initial view roughly if possible, or just start top-left
                }}
              >
                {artboards.map((artboard, index) => {
                  const gapX = 120;
                  const itemWidth = 440;
                  const startY = 1200;
                  
                  // Smart Placement Logic
                  // 1. If the artboard has a saved position, use it.
                  if (artboard.x !== undefined && artboard.y !== undefined) {
                    return (
                      <MobileFrame
                        key={artboard.id}
                        title={artboard.title}
                        subtitle={loading ? "Generating..." : artboard.description}
                        htmlContent={artboard.html}
                        width={artboard.width ?? itemWidth}
                        height={artboard.height}
                        initialX={artboard.x}
                        initialY={artboard.y}
                        colorPalette={colorPalette}
                        isGenerating={artboard.status === 'generating'}
                        onCopy={() => handleCopy(artboard.html, artboard.id)}
                        onDelete={onDeleteArtboard ? () => onDeleteArtboard(artboard.id, artboard.title) : undefined}
                        onSave={(data) => handleSave(artboard.id, data)}
                        isCopied={copiedId === artboard.id}
                        scale={instance?.transformState?.scale || 1}
                        onUpdate={(prompt) => onUpdateArtboard?.(artboard.id, prompt)}
                      />
                    );
                  }

                  // 2. If it's a NEW artboard (no saved position), place it at the end of the line.
                  // Calculate the right-most edge of ALL *other* artboards that have positions.
                  // But wait, what if multiple are new? We need a stable index for new ones.
                  
                  // Filter out undefined x/y artboards to get the "anchors"
                  const placedArtboards = artboards.filter(a => a.x !== undefined && a.id !== artboard.id);
                  
                  // Find the max X extent
                  let rightMostEdge = 3000 - (itemWidth / 2); // Default center start if nothing exists
                  
                  if (placedArtboards.length > 0) {
                     rightMostEdge = Math.max(...placedArtboards.map(a => (a.x || 0) + (a.width || itemWidth)));
                  }

                  // If there are multiple NEW artboards, they naturally come in order in the array.
                  // We need to offset them relative to each other.
                  // Let's count how many *new* artboards came before this one.
                  const newArtboardsBefore = artboards
                    .slice(0, index)
                    .filter(a => a.x === undefined)
                    .length;
                  
                  const smartX = placedArtboards.length === 0 && index === 0 
                    ? 3000 - (itemWidth / 2) // Very first screen ever: Center it
                    : rightMostEdge + gapX + (newArtboardsBefore * (itemWidth + gapX));
                  
                  const smartY = startY;

                  return (
                    <MobileFrame
                      key={artboard.id}
                      title={artboard.title}
                      subtitle={loading ? "Generating..." : artboard.description}
                      htmlContent={artboard.html}
                      width={itemWidth}
                      height={artboard.height}
                      initialX={smartX}
                      initialY={smartY}
                      colorPalette={colorPalette}
                      isGenerating={artboard.status === 'generating'}
                      onCopy={() => handleCopy(artboard.html, artboard.id)}
                      onDelete={onDeleteArtboard ? () => onDeleteArtboard(artboard.id, artboard.title) : undefined}
                      onSave={(data) => handleSave(artboard.id, data)}
                      isCopied={copiedId === artboard.id}
                      scale={instance?.transformState?.scale || 1}
                      autoSave={artboard.x === undefined || artboard.y === undefined}
                      onUpdate={(prompt) => onUpdateArtboard?.(artboard.id, prompt)}
                    />
                  );
                })}
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
