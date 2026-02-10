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
import { useExportDesign } from "@/hooks/use-export";
import { Download, Image as ImageIcon, FileCode, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { CanvasToolbar, CanvasTool } from "./CanvasToolbar";

interface EditorProps {
  onDeleteArtboard?: (artboardId: string) => void;
  onUpdateArtboard?: (artboardId: string, prompt: string) => void;
  onSaveArtboard?: (id: string, data: { x?: number; y?: number; width?: number; height?: number }) => void;
  onSaveArtboardHtml?: (id: string, html: string) => void;
}

export function Editor({
  onDeleteArtboard,
  onUpdateArtboard,
  onSaveArtboard,
  onSaveArtboardHtml,
}: EditorProps) {
  const dispatch = useAppDispatch();
  const { 
    conversation, 
    isGenerating, 
    error, 
  } = useAppSelector((state) => state.designEditor);

  const { exportAllImages, exportAllHtml, isExporting } = useExportDesign();

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

  const [activeTool, setActiveTool] = useState<CanvasTool>('select');
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const effectiveTool = isSpacePressed ? 'hand' : activeTool;
  
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      
      if (e.key === ' ') {
        if (!isSpacePressed) setIsSpacePressed(true);
      } else {
        switch (e.key.toLowerCase()) {
          case 'v': setActiveTool('select'); break;
          case 'h': setActiveTool('hand'); break;
          case 'i': setActiveTool('inspect'); break;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') setIsSpacePressed(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSpacePressed]);

  useEffect(() => {
    if (!showExportMenu) return;
    const handleClickOutside = () => setShowExportMenu(false);
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [showExportMenu]);

  const handleExportAllHtml = useCallback(() => {
    if (!conversation?.id) return;
    exportAllHtml.mutate({ 
      id: conversation.id, 
      filename: `${conversation.id}_html_export` 
    });
    setShowExportMenu(false);
  }, [conversation, exportAllHtml]);

  const handleExportAllImages = useCallback(() => {
    if (!conversation?.id) return;
    exportAllImages.mutate({ 
      id: conversation.id, 
      filename: `${conversation.id}_images_export` 
    });
    setShowExportMenu(false);
  }, [conversation, exportAllImages]);

  // Debug logging for artboard positions
  useEffect(() => {
    if (artboards.length > 0) {
      console.log('[Editor] Artboards updated:', {
        count: artboards.length,
        artboards: artboards.map(a => ({
          id: a.id,
          title: a.title,
          x: a.x,
          y: a.y,
          width: a.width,
          height: a.height,
          isUnpositioned: a.x == null || a.y == null || (Number(a.x) === 0 && Number(a.y) === 0)
        }))
      });
    }
  }, [artboards]);

  return (
    <div className="w-full h-full bg-background relative overflow-hidden">
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
        initialScale={0.4}
        minScale={0.1}
        maxScale={3}
        initialPositionX={-1750} // Focus on start (4600 * 0.4 = 1840. Target ~90px margin -> -1750)
        initialPositionY={-300}  // Focus on top (1000 * 0.4 = 400. Target ~100px margin -> -300)
        centerOnInit={false}
        limitToBounds={false}
        panning={{ 
          excluded: ["input", "textarea", "button", "select", "mobile-frame-container", "drag-target"],
          disabled: effectiveTool !== 'hand'
        }}
        wheel={{ step: 0.1, disabled: effectiveTool === 'hand' }}
        doubleClick={{ disabled: true }}
        pinch={{ step: 5 }}
      >
        {({ zoomIn, zoomOut, resetTransform, instance }) => (
          <>
            {/* Branding - Top Left */}
            <div className="absolute top-6 left-6 z-20">
              <div className="flex items-center justify-center bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-2.5 shadow-2xl ring-1 ring-white/5">
                <img 
                  src="/logo.svg" 
                  alt="Butterfast Logo" 
                  className="w-28 h-5 drop-shadow-sm" 
                />
              </div>
            </div>

            {/* Export Actions - Top Right (Reduced) */}
            <div className="absolute top-6 right-6 z-20">
               {/* Just Export button here, maybe Preview if preferred, but Preview is in toolbar now */}
               {conversation?.id && (
                  <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowExportMenu(!showExportMenu);
                        }}
                        disabled={isExporting}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 bg-zinc-950/50 hover:bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-xl transition-all duration-200 text-zinc-400 hover:text-white active:scale-95 font-medium text-xs shadow-xl",
                          showExportMenu && "bg-zinc-950/90 text-white border-white/20",
                          isExporting && "opacity-50 cursor-not-allowed"
                        )}
                        title="Export All"
                      >
                        <Download className={cn("w-3.5 h-3.5", isExporting && "animate-bounce")} />
                        <span>{isExporting ? "Exporting..." : "Export"}</span>
                        <ChevronDown className="w-3 h-3 opacity-50" />
                      </button>

                      {/* Export Dropdown */}
                      {showExportMenu && (
                        <div 
                          className="absolute top-full right-0 mt-2 w-56 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[70]"
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <div className="p-1.5 flex flex-col gap-1">
                            <button
                              onClick={() => handleExportAllImages()}
                              className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white rounded-lg transition-all active:scale-[0.98] group"
                            >
                              <div className="w-7 h-7 rounded-md bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <ImageIcon className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex flex-col items-start text-left">
                                <span className="text-foreground">Export as Images</span>
                                <span className="text-[10px] text-muted-foreground font-medium">ZIP with PNG files</span>
                              </div>
                            </button>
                            
                            <button
                              onClick={() => handleExportAllHtml()}
                              className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white rounded-lg transition-all active:scale-[0.98] group"
                            >
                              <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                <FileCode className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex flex-col items-start text-left">
                                <span className="text-foreground">Export as Code</span>
                                <span className="text-[10px] text-muted-foreground font-medium">ZIP with HTML files</span>
                              </div>
                            </button>
                          </div>
                        </div>
                      )}
                  </div>
               )}
            </div>

            <TransformComponent
              wrapperStyle={{ 
                width: "100%", 
                height: "100%", 
                flex: 1,
              }}
              contentStyle={{ width: "100%", height: "100%" }}
            >
                <div
                  className="relative bg-zinc-900/5 border-2 border-dashed border-white/5"
                  style={{ 
                    width: "12000px", 
                    height: "4000px",
                    cursor: effectiveTool === 'hand' ? 'grab' : effectiveTool === 'inspect' ? 'crosshair' : 'default'
                  }}
                >
                  <div className="absolute inset-0 pointer-events-none opacity-[0.02]" 
                       style={{ backgroundImage: 'radial-gradient(circle, #64748b 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                  
                  {artboards.length === 0 && (
                      <div className="absolute top-[1000px] left-[6000px] -translate-x-1/2 p-10 text-zinc-500 border border-white/10 rounded-2xl bg-zinc-900/50 backdrop-blur-xl">
                          <p className="text-xl font-bold">No artboards in conversation</p>
                      </div>
                  )}

                  {artboards.map((artboard, index) => {
                    // Check if x or y is null, undefined, or 0 (treat 0,0 as new/unpositioned)
                    const isUnpositioned = artboard.x == null || artboard.y == null || (Number(artboard.x) === 0 && Number(artboard.y) === 0);
                    
                    if (isUnpositioned) {
                      // Horizontal line layout starting from left-center of canvas
                      const SPACING_X = 600;
                      const col = index;
                      // Center all artboards around the middle of the canvas (6000)
                      // Calculate total width of this batch
                      const totalWidth = artboards.length * SPACING_X;
                      const startX = 6000 - (totalWidth / 2);
                      
                      const initialX = startX + (col * SPACING_X);
                      const initialY = 1000;
                      
                      return (
                        <MobileFrame
                          id={artboard.id}
                          key={artboard.id}
                          title={artboard.title}
                          subtitle={artboard.description}
                          htmlContent={artboard.html}
                          width={artboard.width || 480}
                          height={artboard.height}
                          isHeightLocked={artboard.isHeightLocked}
                          initialX={initialX}
                          initialY={initialY}
                          colorPalette={colorPalette}
                          isGenerating={artboard.status === "generating"}
                          onDelete={handleDeleteArtboardInternal}
                          onSave={handleSaveInternal}
                          onUpdate={handleUpdateArtboardInternal}
                          scale={instance?.transformState?.scale || 1}
                          autoSave={true}
                          onSaveHtml={onSaveArtboardHtml}
                          activeTool={effectiveTool}
                        />
                      );
                    }

                    console.log(`[Editor] Using saved position for artboard ${artboard.id} (${artboard.title}):`, {
                      x: artboard.x,
                      y: artboard.y
                    });

                    return (
                      <MobileFrame
                        id={artboard.id}
                        key={artboard.id}
                        title={artboard.title}
                        subtitle={artboard.description}
                        htmlContent={artboard.html}
                        width={artboard.width || 480}
                        height={artboard.height}
                        isHeightLocked={artboard.isHeightLocked}
                        initialX={Number(artboard.x)}
                        initialY={Number(artboard.y)}
                        colorPalette={colorPalette}
                        isGenerating={artboard.status === "generating"}
                        onDelete={handleDeleteArtboardInternal}
                        onSave={handleSaveInternal}
                        onUpdate={handleUpdateArtboardInternal}
                        scale={instance?.transformState?.scale || 1}
                        onSaveHtml={onSaveArtboardHtml}
                        activeTool={effectiveTool}
                      />
                    );
                  })}
                </div>
              </TransformComponent>

            <CanvasToolbar 
              activeTool={activeTool}
              onToolChange={setActiveTool}
              zoomLevel={instance.transformState.scale}
              onZoomIn={() => zoomIn()}
              onZoomOut={() => zoomOut()}
              canUndo={false}
              canRedo={false}
              onUndo={() => {}}
              onRedo={() => {}}
              onPreview={() => conversation?.id && window.open(`/preview/${conversation.id}`, '_blank')}
            />

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
