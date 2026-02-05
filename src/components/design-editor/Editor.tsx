"use client";

import React, { useCallback, useRef } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { MobileFrame } from "@/components/design-editor/MobileFrame";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";
import { Plus, Minus, Maximize, Eye } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { 
  removeArtboard
} from "@/store/slices/designEditorSlice";

interface EditorProps {
  onDeleteArtboard?: (artboardId: string) => void;
  onUpdateArtboard?: (artboardId: string, prompt: string) => void;
  onSaveArtboard?: (id: string, data: { x?: number; y?: number; width?: number; height?: number }) => void;
}

export function Editor({
  onDeleteArtboard,
  onUpdateArtboard,
  onSaveArtboard,
}: EditorProps) {
  const dispatch = useAppDispatch();
  const { 
    conversation, 
    isGenerating, 
    error, 
  } = useAppSelector((state) => state.designEditor);

  const artboards = conversation?.artboards ?? [];
  const colorPalette = conversation?.colorPalette;
  
  // Debounce save requests to avoid spamming the API
  const saveTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  const handleSave = useCallback((id: string, data: { x?: number; y?: number; width?: number; height?: number }) => {
    if (saveTimeouts.current[id]) {
      clearTimeout(saveTimeouts.current[id]);
    }

    saveTimeouts.current[id] = setTimeout(() => {
      if (onSaveArtboard) {
        onSaveArtboard(id, data);
      }
      delete saveTimeouts.current[id];
    }, 1000);
  }, [onSaveArtboard]);

  const handleDeleteArtboardInternal = useCallback((id: string) => {
    if (onDeleteArtboard) {
      onDeleteArtboard(id);
    } else {
      dispatch(removeArtboard(id));
    }
  }, [onDeleteArtboard, dispatch]);

  const handleUpdateArtboardInternal = useCallback((id: string, prompt: string) => {
    onUpdateArtboard?.(id, prompt);
  }, [onUpdateArtboard]);

  const handleSaveInternal = useCallback((id: string, data: any) => {
    handleSave(id, data);
  }, [handleSave]);

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
                  <Minus className="w-4 h-4" />
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
                  <Plus className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-border/50 mx-1" />
                <button
                  onClick={() => resetTransform()}
                  className="p-2.5 hover:bg-white/5 rounded-xl transition-all duration-200 text-muted-foreground hover:text-foreground active:scale-95"
                  title="Reset View"
                >
                  <Maximize className="w-4 h-4" />
                </button>
                {conversation?.id && (
                  <>
                    <div className="w-px h-4 bg-border/50 mx-1" />
                    <button
                      onClick={() => window.open(`/preview/${conversation.id}`, '_blank')}
                      className="flex items-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all duration-200 active:scale-95 group font-bold text-xs ring-1 ring-primary/20"
                      title="Preview Design"
                    >
                      <Eye className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                      <span>Preview</span>
                    </button>
                  </>
                )}
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
                  className="relative"
                  style={{ 
                    width: "12000px", 
                    height: "3200px",
                  }}
                >
                  {artboards.map((artboard, index) => {
                    // Check if x or y is null or undefined (both handled by == null)
                    const isNew = artboard.x == null || artboard.y == null;
                    
                    if (isNew) {
                      // Single horizontal line layout
                      const SPACING_X = 600;
                      
                      const col = index;
                      const row = 0;

                      // Start from the visual left edge of the centered view
                      // Canvas is 12000px, centered at 6000px.
                      // Visual view at start is approx 6000 +/- 1400.
                      // Left edge ~4600px.
                      const initialX = 4600 + (col * SPACING_X);
                      // Let's stick to fixed Y: 1200 was previous "row 0".
                      
                      return (
                        <MobileFrame
                          id={artboard.id}
                          key={artboard.id}
                          title={artboard.title}
                          subtitle={artboard.description}
                          htmlContent={artboard.html}
                          width={artboard.width || 480}
                          height={artboard.height}
                          initialX={initialX}
                          initialY={1200}
                          colorPalette={colorPalette}
                          isGenerating={artboard.status === "generating"}
                          onDelete={handleDeleteArtboardInternal}
                          onSave={handleSaveInternal}
                          onUpdate={handleUpdateArtboardInternal}
                          scale={instance?.transformState?.scale || 1}
                          autoSave={true}
                        />
                      );
                    }

                    return (
                      <MobileFrame
                        id={artboard.id}
                        key={artboard.id}
                        title={artboard.title}
                        subtitle={artboard.description}
                        htmlContent={artboard.html}
                        width={artboard.width || 480}
                        height={artboard.height}
                        initialX={Number(artboard.x)}
                        initialY={Number(artboard.y)}
                        colorPalette={colorPalette}
                        isGenerating={artboard.status === "generating"}
                        onDelete={handleDeleteArtboardInternal}
                        onSave={handleSaveInternal}
                        onUpdate={handleUpdateArtboardInternal}
                        scale={instance?.transformState?.scale || 1}
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
                <div className="absolute top-4 left-4 right-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm z-50 backdrop-blur-md flex items-center justify-between gap-4">
                  <div className="flex-1 font-medium select-text">{error}</div>
                  {(error.toLowerCase().includes("credit") || error.toLowerCase().includes("plan")) && (
                    <a
                      href="/subscription"
                      className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap shadow-lg shadow-red-500/20"
                    >
                      Upgrade Plan
                    </a>
                  )}
                </div>
              )}
            </>
          )}
        </TransformWrapper>
    </div>
  );
}
