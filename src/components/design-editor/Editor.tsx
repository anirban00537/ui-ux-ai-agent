"use client";

import React, { useCallback, useRef } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { MobileFrame } from "@/components/design-editor/MobileFrame";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";
import { Plus, Minus, Maximize, Eye } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  removeArtboard,
  updateConversation
} from "@/store/slices/designEditorSlice";

import { useExportDesign } from "@/hooks/use-export";
import { Download, Image as ImageIcon, FileCode, ChevronDown, Share2, Globe, Lock, Copy, Check, Loader2 } from "lucide-react";
import { updateDesign } from "@/services/designs";
import { toast } from "sonner";
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

  // Debug: Log whenever activeTool or isSpacePressed changes
  useEffect(() => {
    console.log('[Editor] Tool State Changed:', { activeTool, isSpacePressed, effectiveTool });
  }, [activeTool, isSpacePressed, effectiveTool]);

  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) return;

      if (e.key === ' ') {
        if (!isSpacePressed) setIsSpacePressed(true);
        // Prevent scrolling with spacebar
        e.preventDefault();
      } else if (!isSpacePressed) { // Only handle shortcuts if not panning
        switch (e.key.toLowerCase()) {
          case 'v':
            console.log('[Editor] Keyboard: Setting tool to SELECT');
            setActiveTool('select');
            break;
          case 'h':
            console.log('[Editor] Keyboard: Setting tool to HAND');
            setActiveTool('hand');
            break;
          // Inspect (I) is now merged into Select (V) behavior
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') setIsSpacePressed(false);
    };

    const handleBlur = () => {
      setIsSpacePressed(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isSpacePressed]);

  useEffect(() => {
    if (!showExportMenu) return;
    const handleClickOutside = () => setShowExportMenu(false);
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [showExportMenu]);

  // Ref to access React Zoom Pan Pinch controls
  const transformRef = useRef<any>(null);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    // If holding Ctrl or Meta, let the library handle Zoom
    if (e.ctrlKey || e.metaKey) return;

    if (transformRef.current) {
      // Access current state
      const { positionX, positionY, scale } = transformRef.current.instance.transformState;

      // Settings
      const speed = 1.0;

      let newX = positionX;
      let newY = positionY;

      // If Shift is held, we prioritize Horizontal Panning.
      // Some browsers automatically swap X/Y deltas when Shift is held.
      // We handle both cases to ensure consistent behavior.
      if (e.shiftKey && e.deltaX === 0) {
        // Case 1: Browser reported Vertical Delta + Shift. We manually swap to X.
        newX -= e.deltaY * speed;
      } else {
        // Case 2: Browser reported Horizontal Delta (Shift auto-swapped)
        // OR Case 3: Normal vertical scroll (Shift not held)
        // OR Case 4: Trackpad 2D scroll
        newX -= e.deltaX * speed;
        newY -= e.deltaY * speed;
      }

      // Apply transform immediately (0 duration)
      transformRef.current.setTransform(newX, newY, scale, 0);
    }
  }, []);

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
    <div className="flex flex-col w-full h-full bg-background relative overflow-hidden">
      {/* Top Navbar */}
      <header className="h-16 border-b border-white/10 bg-[#1f2228] flex items-center justify-between px-6 z-40 shrink-0">
        <div className="flex items-center gap-5">
          {/* Logo */}
          <img
            src="/logo.svg"
            alt="Butterfast Logo"
            className="h-6 opacity-80 hover:opacity-100 transition-opacity"
          />

          {/* Divider */}
          <div className="h-5 w-px bg-white/10" />

          {/* Design Title */}
          <div className="flex flex-col">
            <span className="text-[15px] font-semibold text-white leading-none tracking-tight">
              {conversation?.title || "Untitled Design"}
            </span>
            <span className="text-[11px] text-white/50 font-medium mt-1">
              v1.0 • Auto-saved
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Preview Button */}
          {conversation?.id && (
            <button
              onClick={() => window.open(`/preview/${conversation.id}`, '_blank')}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-all font-mono uppercase tracking-[1.4px]"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          )}

          {/* Share Controls */}
          {conversation?.id && (
            <ShareControls
              designId={conversation.id}
              isPublic={!!conversation.isPublic}
              onUpdate={(isPublic) => dispatch(updateConversation({ isPublic }))}
            />
          )}

          {/* Export & Actions */}
          {conversation?.id && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowExportMenu(!showExportMenu);
                }}
                disabled={isExporting}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 bg-white text-[#1f2228] hover:bg-white/90 border border-white/20 rounded transition-all duration-200 active:scale-95 font-mono text-xs uppercase tracking-[1.4px] font-semibold",
                  isExporting && "opacity-70 cursor-not-allowed"
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
                  className="absolute top-full right-0 mt-2 w-56 bg-[#1f2228] border border-white/10 rounded overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[70]"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="p-1.5 flex flex-col gap-1">
                    <button
                      onClick={() => handleExportAllImages()}
                      className="flex items-center gap-3 w-full px-3 py-3 text-xs font-bold text-white/70 hover:text-white hover:bg-white/5 rounded transition-all active:scale-[0.98] group"
                    >
                      <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-white/70 group-hover:bg-white group-hover:text-[#1f2228] transition-colors">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col items-start text-left">
                        <span className="text-white text-[13px]">Export as Images</span>
                        <span className="text-[11px] text-white/50 font-medium">ZIP with PNG files</span>
                      </div>
                    </button>

                    <button
                      onClick={() => handleExportAllHtml()}
                      className="flex items-center gap-3 w-full px-3 py-3 text-xs font-bold text-white/70 hover:text-white hover:bg-white/5 rounded transition-all active:scale-[0.98] group"
                    >
                      <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-white/70 group-hover:bg-white group-hover:text-[#1f2228] transition-colors">
                        <FileCode className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col items-start text-left">
                        <span className="text-white text-[13px]">Export as Code</span>
                        <span className="text-[11px] text-white/50 font-medium">ZIP with HTML files</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Canvas Area */}
      <div
        className="flex-1 relative overflow-hidden bg-[#1a1d24]"
        onWheelCapture={handleWheel}
      >
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 -z-20 opacity-[0.15] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Dot Pattern with better fade */}
        <DotPattern
          className={cn(
            "[mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_90%)] opacity-10"
          )}
          width={24}
          height={24}
          cr={0.8}
        />

        <TransformWrapper
          ref={transformRef}
          initialScale={0.6}
          minScale={0.1}
          maxScale={3}
          initialPositionX={-50}
          initialPositionY={-850}
          centerOnInit={false}
          limitToBounds={false}
          panning={{
            excluded: ["input", "textarea", "button", "select", "drag-target"],
            disabled: effectiveTool !== 'hand'
          }}
          wheel={{ step: 0.1, activationKeys: ['Meta', 'Control'] }}
          doubleClick={{ disabled: true }}
          pinch={{ step: 5 }}
        >
          {({ zoomIn, zoomOut, resetTransform, instance }) => (
            <>
              <TransformComponent
                wrapperStyle={{
                  width: "100%",
                  height: "100%",
                  flex: 1,
                }}
                contentStyle={{ width: "100%", height: "100%" }}
              >
                <div
                  className="relative"
                  style={{
                    width: "12000px",
                    height: "4000px",
                    cursor: effectiveTool === 'hand' ? 'grab' : effectiveTool === 'inspect' ? 'crosshair' : 'default'
                  }}
                >
                  {/* Inner Canvas Background for Grid alignment */}
                  <div className="absolute inset-0 pointer-events-none opacity-[0.5]"
                    style={{ backgroundImage: 'radial-gradient(circle, #c1cffd 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                  {artboards.map((artboard, index) => {
                    const isUnpositioned = artboard.x == null || artboard.y == null || (Number(artboard.x) === 0 && Number(artboard.y) === 0);

                    let initialX = Number(artboard.x);
                    let initialY = Number(artboard.y);

                    if (isUnpositioned) {
                      // Horizontal line layout starting from left-center of canvas
                      const SPACING_X = 600;
                      // Use index relative to unpositioned items to ensure clean stacking
                      const unpositionedIndex = artboards
                        .slice(0, index)
                        .filter(a => a.x == null || a.y == null || (Number(a.x) === 0 && Number(a.y) === 0))
                        .length;

                      // Start position at Left Center (x=100)
                      const startX = 100;

                      initialX = startX + (unpositionedIndex * SPACING_X);
                      initialY = 1500; // Center vertically in 4000px canvas
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
                        isHeightLocked={artboard.isHeightLocked}
                        initialX={initialX}
                        initialY={initialY}
                        colorPalette={colorPalette}
                        isGenerating={artboard.status === "generating"}
                        onDelete={handleDeleteArtboardInternal}
                        onSave={handleSaveInternal}
                        onUpdate={handleUpdateArtboardInternal}
                        scale={instance?.transformState?.scale || 1}
                        autoSave={isUnpositioned} // Auto-save only if it was unpositioned
                        onSaveHtml={onSaveArtboardHtml}
                        activeTool={effectiveTool}
                      />
                    );
                  })}
                </div>
              </TransformComponent>

              <CanvasToolbar
                activeTool={activeTool}
                onToolChange={(tool) => {
                  console.log('[Editor] CanvasToolbar clicked, changing tool to:', tool);
                  setActiveTool(tool);
                }}
                zoomLevel={instance.transformState.scale}
                onZoomIn={() => zoomIn()}
                onZoomOut={() => zoomOut()}
                canUndo={false}
                canRedo={false}
                onUndo={() => { }}
                onRedo={() => { }}
                onPreview={() => conversation?.id && window.open(`/preview/${conversation.id}`, '_blank')}
              />

              <div className="absolute bottom-6 left-6 z-20">
                <div className="bg-[#1f2228] border border-white/10 px-5 py-3">
                  <p className="text-[13px] text-white font-mono uppercase tracking-[1.4px] font-semibold">
                    {artboards.length} screen{artboards.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {error && (
                <div className="absolute top-4 left-4 right-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded px-4 py-3 text-sm z-50 flex items-center justify-between gap-4">
                  <div className="flex-1 font-medium select-text">{error}</div>
                  {(error.toLowerCase().includes("credit") || error.toLowerCase().includes("plan")) && (
                    <a
                      href="/subscription"
                      className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded transition-colors whitespace-nowrap font-mono uppercase tracking-[1.4px]"
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
    </div>
  );
}

function ShareControls({
  designId,
  isPublic,
  onUpdate
}: {
  designId: string;
  isPublic: boolean;
  onUpdate: (isPublic: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const resp = await updateDesign(designId, { isPublic: !isPublic });
      if (resp.success) {
        onUpdate(!isPublic);
        toast.success(!isPublic ? "Design is now public" : "Design is now private");
      }
    } catch (error) {
      toast.error("Failed to update share settings");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    // Construct the preview URL
    const url = `${window.location.origin}/preview/${designId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Share link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggle}
        disabled={loading}
        className={cn(
          "flex items-center gap-2 px-3.5 py-2 rounded border transition-all active:scale-95 font-mono uppercase tracking-[1.4px] text-xs font-semibold",
          isPublic
            ? "bg-white text-[#1f2228] hover:bg-white/90 border-white/20"
            : "bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10"
        )}
        title={isPublic ? "Public - Anyone with link can view" : "Private - Only you can view"}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isPublic ? (
          <Globe className="w-4 h-4" />
        ) : (
          <Lock className="w-4 h-4" />
        )}
        <span className="text-[11px] font-bold uppercase tracking-wider">
          {isPublic ? "Public" : "Private"}
        </span>
      </button>

      <button
        onClick={copyLink}
        className="flex items-center gap-2 px-3.5 py-2 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all active:scale-95 group font-mono uppercase tracking-[1.4px] text-xs font-semibold"
        title="Copy Preview Link"
      >
        {copied ? (
          <Check className="w-4 h-4 text-white" />
        ) : (
          <Share2 className="w-4 h-4 group-hover:text-white transition-colors" />
        )}
        <span className="text-[12px] font-semibold tracking-wide">Share</span>
      </button>
    </div>
  );
}
