
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Rnd } from "react-rnd";
import { CodeViewerModal } from "./CodeViewerModal";
import { cn } from "@/lib/utils";
import { FrameToolbar } from "./FrameToolbar";
import { ElementStylePanel } from "./ElementStylePanel";
import { Sparkles, ChevronRight } from "lucide-react";

import { useExportArtboard } from "@/hooks/use-export";
import { type ColorPalette } from "@/services/designs";

// Separate component for portal content to handle position updates
interface ToolbarPortalContentProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  title?: string;
  onDelete?: () => void;
  onViewCode?: () => void;
  onUpdate?: (prompt: string) => void;
  onExportImage?: () => void;
  onExportHtml?: () => void;
  showUpdateInput: boolean;
  setShowUpdateInput: (show: boolean) => void;
  updateInputRef: React.RefObject<HTMLInputElement | null>;
  handleUpdateSubmit: () => void;
  onToggleInspect: () => void;
  isInspecting: boolean;
}

function ToolbarPortalContent({
  containerRef,
  title,
  onDelete,
  onViewCode,
  onUpdate,
  onExportImage,
  onExportHtml,
  showUpdateInput,
  setShowUpdateInput,
  updateInputRef,
  handleUpdateSubmit,
  onToggleInspect,
  isInspecting
}: ToolbarPortalContentProps) {
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  useEffect(() => {
    let rafId: number;

    const updatePosition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setPosition({
          top: rect.top - 16,
          left: rect.left + rect.width / 2,
        });
      }
      rafId = requestAnimationFrame(updatePosition);
    };

    updatePosition();

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [containerRef]);

  if (!position) return null;

  return (
    <div
      className="fixed z-[9999] flex flex-col items-center gap-3 pointer-events-auto"
      style={{
        left: position.left,
        top: position.top,
        transform: "translate(-50%, -100%)",
      }}
      data-toolbar-portal="true"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <FrameToolbar
        title={title}
        onDelete={onDelete}
        onViewCode={onViewCode}
        onUpdate={onUpdate}
        onExportImage={onExportImage}
        onExportHtml={onExportHtml}
        showUpdateInput={showUpdateInput}
        setShowUpdateInput={setShowUpdateInput}
        onToggleInspect={onToggleInspect}
        isInspecting={isInspecting}
      />

      {/* Prompt Box */}
      {showUpdateInput && (
        <div className="w-[400px] animate-in slide-in-from-top-2 duration-300">
          <div
            className="flex items-center gap-3 p-2 bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-1 ring-white/5"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex-1 flex items-center gap-3 px-3 py-2.5 bg-white/[0.03] rounded-xl border border-white/[0.05] focus-within:border-primary/50 transition-all">
              <Sparkles className="w-4 h-4 text-primary animate-pulse shrink-0" />
              <input
                ref={updateInputRef}
                type="text"
                placeholder="Ask me to change anything..."
                className="bg-transparent border-none outline-none text-[13px] w-full text-white placeholder:text-zinc-500 font-medium"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUpdateSubmit();
                  if (e.key === "Escape") setShowUpdateInput(false);
                  e.stopPropagation();
                }}
              />
            </div>
            <button
              onClick={handleUpdateSubmit}
              className="w-10 h-10 flex items-center justify-center bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95 shrink-0"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface ElementStylePanelWrapperProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  element: any;
  onUpdate: (id: string, styles: any, textContent?: string) => void;
  onClose: () => void;
  onDelete: () => void;
}

function ElementStylePanelWrapper({ containerRef, element, onUpdate, onClose, onDelete }: ElementStylePanelWrapperProps) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    let rafId: number;
    const updatePosition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setPosition({
          top: rect.top + 60,
          left: rect.right + 20,
        });
      }
      rafId = requestAnimationFrame(updatePosition);
    };
    updatePosition();
    return () => cancelAnimationFrame(rafId);
  }, [containerRef]);

  if (!position) return null;

  return (
    <ElementStylePanel 
      element={element}
      onUpdate={onUpdate}
      onClose={onClose}
      onDelete={onDelete}
      position={position}
    />
  );
}

export interface MobileFrameProps {
  id: string;
  htmlContent: string;
  title?: string;
  subtitle?: string;
  className?: string;
  width?: number;
  height?: number;
  isHeightLocked?: boolean; // When true, user has manually set height - don't auto-resize
  initialX?: number;
  initialY?: number;
  colorPalette?: ColorPalette;
  isGenerating?: boolean;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, prompt: string) => void;
  onSave?: (
    id: string,
    data: { x: number; y: number; width: number; height: number; isHeightLocked?: boolean }
  ) => void;
  scale?: number;
  autoSave?: boolean;
  onSaveHtml?: (id: string, html: string) => void;
  activeTool?: 'select' | 'hand' | 'inspect';
}

export const MobileFrame = React.memo(
  ({
    id,
    htmlContent,
    title,
    subtitle,
    className = "",
    width = 480,
    height,
    isHeightLocked = false,
    initialX = 0,
    initialY = 0,
    colorPalette,
    isGenerating = false,
    onDelete,
    onUpdate,
    onSave,
    scale = 1,
    autoSave = false,
    onSaveHtml,
    activeTool = 'select',
  }: MobileFrameProps) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [showCodeModal, setShowCodeModal] = useState(false);
    const [showUpdateInput, setShowUpdateInput] = useState(false);
    const [isInspecting, setIsInspecting] = useState(false);
    const [selectedElement, setSelectedElement] = useState<{
        id: string;
        tagName: string;
        innerText: string;
        styles: any;
    } | null>(null);

    // Sync isInspecting with activeTool
    useEffect(() => {
        if (activeTool === 'inspect') {
            setIsInspecting(true);
        } else {
            setIsInspecting(false);
            setSelectedElement(null);
        }
    }, [activeTool]);

    // Send toggle inspect message whenever isInspecting changes
    useEffect(() => {
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
                type: "TOGGLE_INSPECT",
                enabled: isInspecting
            }, "*");
        }
    }, [isInspecting]);

    // State for dimensions - Large Mobile (480x1100 minimum)
    const MIN_FRAME_HEIGHT = 1100;
    const standardRatio = 1100 / 480;
    const standardHeight = Math.max(
      Math.floor(width * standardRatio),
      MIN_FRAME_HEIGHT
    );

    const [size, setSize] = useState({
      width: width,
      height: Math.max(height || standardHeight, MIN_FRAME_HEIGHT),
    });
    const [position, setPosition] = useState({ x: initialX, y: initialY });
    const [isSelected, setIsSelected] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const isHandTool = activeTool === 'hand';
    const isSelectTool = activeTool === 'select';
    
    // Track if height was explicitly set/locked by user (from saved flag or manual resize)
    // When true, we don't auto-resize based on content height
    // Uses the explicit isHeightLocked prop from database for reliable state
    const [hasExplicitHeight, setHasExplicitHeight] = useState(isHeightLocked);

    const { exportImage, exportHtml } = useExportArtboard();
    const lastWidthProp = useRef(width);
    const lastHeightProp = useRef(height);
    const lastXProp = useRef(initialX);
    const lastYProp = useRef(initialY);

    const handleExportImage = useCallback(() => {
      exportImage.mutate({ id, title: title || "export" });
    }, [id, title, exportImage]);

    const handleExportHtml = useCallback(() => {
      exportHtml.mutate({ id, title: title || "export" });
    }, [id, title, exportHtml]);

    // Sync with prop updates IF the props themselves changed (ignoring local state differences)
    useEffect(() => {
      // If we're interacting, just update the "last seen" to the current props
      // to avoid snapping back immediately after we stop.
      if (isResizing || isDragging) {
        lastWidthProp.current = width;
        lastHeightProp.current = height;
        lastXProp.current = initialX;
        lastYProp.current = initialY;
        return;
      }

      if (width !== lastWidthProp.current) {
        setSize((prev) => ({ ...prev, width }));
        lastWidthProp.current = width;
      }
      if (height !== undefined && height !== lastHeightProp.current) {
        setSize((prev) => ({ ...prev, height }));
        lastHeightProp.current = height;
      }
      if (initialX !== lastXProp.current || initialY !== lastYProp.current) {
        setPosition({ x: initialX, y: initialY });
        lastXProp.current = initialX;
        lastYProp.current = initialY;
      }
    }, [width, height, initialX, initialY, isResizing, isDragging]);

    // Auto-save initial position if requested (for smart placement persistence)
    useEffect(() => {
      if (autoSave && onSave) {
        onSave(id, {
          x: initialX,
          y: initialY,
          width,
          height: height || standardHeight,
        });
      }
      // Only run once on mount/init when autoSave is true
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      const handleMessage = (event: MessageEvent) => {
        if (
          iframeRef.current &&
          event.source === iframeRef.current.contentWindow
        ) {
          if (typeof event.data === "object") {
            if (event.data.type === "CANVAS_READY") {
              setIsLoaded(true);
              // Immediately sync theme if we have it
              if (colorPalette && iframeRef.current?.contentWindow) {
                iframeRef.current.contentWindow.postMessage(
                  { type: "UPDATE_THEME", palette: colorPalette },
                  "*"
                );
              }
            } else if (event.data.type === "UPDATE_HEIGHT") {
              const contentHeight = event.data.height;
              // Skip auto-height if user has explicitly set a height (via resize or saved data)
              if (contentHeight && !isResizing && !isDragging && !hasExplicitHeight) {
                setSize((prev) => {
                  // More reasonable max height for mobile screens
                  const MAX_AUTO_HEIGHT = 2500;
                  const MIN_HEIGHT = MIN_FRAME_HEIGHT;
                  const safeHeight = Math.min(
                    Math.max(contentHeight, MIN_HEIGHT),
                    MAX_AUTO_HEIGHT
                  );
                  // Only update if difference is significant (more than 20px)
                  // This prevents jitter from minor measurement variations
                  if (Math.abs(safeHeight - prev.height) > 20) {
                    return { ...prev, height: safeHeight };
                  }
                  return prev;
                });
              }
            } else if (event.data.type === "ELEMENT_SELECTED") {
              setSelectedElement(event.data.element);
            } else if (event.data.type === "SAVE_HTML_REQUEST") {
              if (onSaveHtml && event.data.html) {
                onSaveHtml(id, event.data.html);
              }
            }
          }
        }
      };

      window.addEventListener("message", handleMessage);
      return () => window.removeEventListener("message", handleMessage);
    }, [colorPalette, isResizing, isDragging, hasExplicitHeight, onSaveHtml, id]);

    useEffect(() => {
      if (isLoaded && htmlContent && iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          {
            type: "UPDATE_CONTENT",
            html: htmlContent,
            // Send theme as well during content updates to ensure consistency
            palette: colorPalette,
          },
          "*"
        );
      }
    }, [htmlContent, isLoaded, colorPalette]);

    useEffect(() => {
      if (isLoaded && colorPalette && iframeRef.current?.contentWindow) {
        console.log('[MobileFrame] Sending UPDATE_THEME, fontFamily:', colorPalette.fontFamily);
        iframeRef.current.contentWindow.postMessage(
          { type: "UPDATE_THEME", palette: colorPalette },
          "*"
        );
      }
    }, [colorPalette, isLoaded]);

    const rndRef = useRef<any>(null);

    // Handle Click Outside to Deselect
    useEffect(() => {
      if (!isSelected) return;

      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;

        // Check if click is inside the toolbar portal
        const toolbarPortal = target.closest('[data-toolbar-portal="true"]');
        if (toolbarPortal) {
          return; // Don't deselect if clicking on toolbar
        }

        if (rndRef.current) {
            // If dragging slider in style panel, don't deselect
            // Actually simpler: preventing propagation on panel solves this
          const rndElement = rndRef.current.getSelfElement();
          if (rndElement && !rndElement.contains(target) && !document.getElementById(`style-panel-${id}`)) {
            setIsSelected(false);
            setShowUpdateInput(false);
            // Don't turn off inspect mode automatically on outside click, but maybe deselect element?
            // If user clicks outside frame, maybe deselect element inside?
          }
        }
      };

      const timer = setTimeout(() => {
        window.addEventListener("mousedown", handleClickOutside);
      }, 10);

      return () => {
        clearTimeout(timer);
        window.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isSelected]);

    const handleSelect = useCallback(
      (e?: React.MouseEvent | MouseEvent) => {
        if (!isSelected) {
          setIsSelected(true);
        }
      },
      [isSelected]
    );

    const updateInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (showUpdateInput) {
        setTimeout(() => updateInputRef.current?.focus(), 100);
      }
    }, [showUpdateInput]);

    const handleUpdateSubmit = () => {
      const val = updateInputRef.current?.value.trim();
      if (val && onUpdate) {
        onUpdate(id, val);
        setShowUpdateInput(false);
      }
    };

    const toggleInspect = useCallback(() => {
        const newState = !isInspecting;
        setIsInspecting(newState);
        if (!newState) {
            setSelectedElement(null);
        } else {
             // Make sure we are selected so toolbar stays visible
             setIsSelected(true);
        }
        iframeRef.current?.contentWindow?.postMessage({
            type: "TOGGLE_INSPECT",
            enabled: newState
        }, "*");
    }, [isInspecting]);

    const handleStyleUpdate = useCallback((elId: string, styles: any, textContent?: string) => {
        iframeRef.current?.contentWindow?.postMessage({
            type: "UPDATE_ELEMENT_STYLE",
            id: elId,
            styles,
            textContent
        }, "*");
    }, []);

    return (
      <>
        <Rnd
          ref={rndRef}
          className={cn(
            "mobile-frame-container z-10",
            isSelected && "z-50",
            className,
            isHandTool && "pointer-events-none"
          )}
          disableDragging={!isSelectTool}
          size={{ width: size.width, height: size.height }}
          position={{ x: position.x, y: position.y }}
          scale={scale}
          minWidth={480}
          minHeight={MIN_FRAME_HEIGHT}
          dragHandleClassName="drag-target"
          onDragStart={() => {
            setIsDragging(true);
            setIsSelected(true);
          }}
          onDrag={(e, d) => {
            setPosition({ x: d.x, y: d.y });
          }}
          onDragStop={(e, d) => {
            setIsDragging(false);
            setPosition({ x: d.x, y: d.y });
            onSave?.(id, {
              x: d.x,
              y: d.y,
              width: size.width,
              height: size.height,
            });
          }}
          onResizeStart={() => {
            setIsResizing(true);
            setIsSelected(true);
          }}
          onResize={(e, direction, ref, delta, position) => {
            setSize({
              width: parseInt(ref.style.width),
              height: parseInt(ref.style.height),
            });
            setPosition(position);
          }}
          onResizeStop={(e, direction, ref, delta, position) => {
            setIsResizing(false);
            // Mark that user explicitly set the height - prevents auto-resize
            setHasExplicitHeight(true);
            const newSize = {
              width: parseInt(ref.style.width),
              height: parseInt(ref.style.height),
            };
            setSize(newSize);
            setPosition(position);
            onSave?.(id, {
              x: position.x,
              y: position.y,
              width: newSize.width,
              height: newSize.height,
              isHeightLocked: true, // Persist the lock state to database
            });
          }}
          enableResizing={isSelectTool ? {
            bottomRight: true,
            bottomLeft: true,
            topRight: true,
            topLeft: true,
            bottom: false,
            top: false,
            left: false,
            right: false,
          } : false}
          resizeHandleComponent={
            isSelected
              ? {
                  bottomRight: (
                    <div className="absolute -bottom-[4px] -right-[4px] w-2.5 h-2.5 bg-white border border-primary shadow-[0_0_0_1px_rgba(0,0,0,0.1)] z-[70]" />
                  ),
                  bottomLeft: (
                    <div className="absolute -bottom-[4px] -left-[4px] w-2.5 h-2.5 bg-white border border-primary shadow-[0_0_0_1px_rgba(0,0,0,0.1)] z-[70]" />
                  ),
                  topRight: (
                    <div className="absolute -top-[4px] -right-[4px] w-2.5 h-2.5 bg-white border border-primary shadow-[0_0_0_1px_rgba(0,0,0,0.1)] z-[70]" />
                  ),
                  topLeft: (
                    <div className="absolute -top-[4px] -left-[4px] w-2.5 h-2.5 bg-white border border-primary shadow-[0_0_0_1px_rgba(0,0,0,0.1)] z-[70]" />
                  ),
                }
              : {}
          }
        >
          <div
            ref={containerRef}
            className="relative w-full h-full flex flex-col items-center select-none"
          >
            {/* Unselected Title (Legacy/Hover) */}
            {!isSelected && title && (
              <div className="absolute -top-10 w-full text-center opacity-0 group-hover:opacity-100 transition-opacity drag-target cursor-grab">
                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider bg-zinc-950/80 px-2 py-1 rounded shadow-sm border border-white/10 backdrop-blur-sm">
                  {title}
                </span>
              </div>
            )}

            {/* Frame Wrapper */}
            <div className="relative w-full h-full group">
              {/* Selection Border - Rectangular Bounding Box */}
              {isSelected && (
                <div className="absolute -inset-[1.5px] border-2 border-primary/50 z-20 pointer-events-none rounded-[32px]" />
              )}

              {/* Generating Animation */}
              {isGenerating && (
                <div
                  className="absolute -inset-1.5 rounded-[34px] opacity-75 blur-md pointer-events-none transition-all duration-500"
                  style={{
                    background:
                      "linear-gradient(90deg, #6366f1, #a855f7, #ec4899, #6366f1)",
                    backgroundSize: "300% 100%",
                    animation: "gradient-flow 2s linear infinite",
                  }}
                />
              )}

              {/* Inner Frame Container */}
              <div
                className={`relative overflow-hidden isolate w-full h-full ${
                  !isSelected
                    ? "drag-target cursor-grab active:cursor-grabbing"
                    : ""
                }`}
                style={{
                  borderRadius: "28px",
                  background:
                    colorPalette?.background || "var(--background, #ffffff)",
                  border: "1px solid var(--border, #e5e7eb)",
                  boxShadow: isSelected
                    ? "0 20px 45px rgba(0,0,0,0.25)"
                    : "0 8px 24px rgba(0,0,0,0.12)",
                }}
              >
                <iframe
                  ref={iframeRef}
                  src="/renderers/canvas?mode=editor"
                  className={`size-full border-0 block transition-opacity duration-300 ${
                    isLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  title="Canvas Frame"
                  data-artboard-id={id}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                  style={{
                    pointerEvents: isResizing || isDragging ? "none" : "auto",
                  }}
                />

                {/* Click Shield (Unselected) - Draggable */}
                {!isSelected && (
                  <div
                    className="absolute inset-0 z-40 drag-target cursor-grab active:cursor-grabbing"
                    title="Click to select or drag"
                    onClick={(e) => {
                      setIsSelected(true);
                    }}
                  />
                )}

                {!isLoaded && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 border border-white/5 rounded-[26px]">
                    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4 shadow-lg shadow-primary/20" />
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 animate-pulse">
                      Initializing
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Dimensions Label (Bottom) */}
            {isSelected && !showUpdateInput && (
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 rounded-full bg-zinc-950/80 backdrop-blur-xl border border-white/10 px-3 py-1 text-zinc-100 text-[10px] shadow-2xl font-bold tracking-widest tabular-nums z-[60] pointer-events-none uppercase">
                {Math.round(size.width)}{" "}
                <span className="text-zinc-500 mx-1">×</span>{" "}
                {Math.round(size.height)}
              </div>
            )}

            {/* Generating Badge */}
            {isGenerating && (
              <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 bg-primary text-white rounded-full shadow-2xl shadow-primary/30 whitespace-nowrap z-[70] border border-white/20 animate-in zoom-in-95 duration-300">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Generating UI
                </span>
              </div>
            )}
          </div>
        </Rnd>

        {/* Portal-based Toolbar - renders outside zoom container for consistent size */}
        {isSelected &&
          typeof window !== "undefined" &&
          containerRef.current &&
          createPortal(
            <ToolbarPortalContent
              containerRef={containerRef}
              title={title}
              onDelete={() => onDelete?.(id)}
              onViewCode={() => setShowCodeModal(true)}
              onUpdate={(prompt) => onUpdate?.(id, prompt)}
              onExportImage={handleExportImage}
              onExportHtml={handleExportHtml}
              showUpdateInput={showUpdateInput}
              setShowUpdateInput={setShowUpdateInput}
              updateInputRef={updateInputRef}
              handleUpdateSubmit={handleUpdateSubmit}
              onToggleInspect={toggleInspect}
              isInspecting={isInspecting}
            />,
            document.body
          )}
          
        {/* Element Style Panel */}
        {/* Render separate from portal to move with scrolling or fixed? 
            Since Rnd uses transform, fixed children move with it ONLY if not using portal.
            But we want it to be above everything.
            Let's use a portal but position it next to the frame.
         */}
        {selectedElement && isInspecting && isSelected && containerRef.current && (
             // We can just render it here if we want it to move with the Rnd component naturally?
             // But Rnd has overflow: hidden sometimes? No.
             // But z-index issues. Portal is safer.
             // Let's compute position.
             createPortal(
                 <ElementStylePanelWrapper
                    containerRef={containerRef}
                    element={selectedElement}
                    onUpdate={handleStyleUpdate}
                    onClose={() => setSelectedElement(null)}
                    onDelete={() => {
                        iframeRef.current?.contentWindow?.postMessage({
                            type: "DELETE_ELEMENT",
                            id: selectedElement.id
                        }, "*");
                        setSelectedElement(null);
                    }}
                 />,
                 document.body
             )
        )}

        <CodeViewerModal
          isOpen={showCodeModal}
          onClose={() => setShowCodeModal(false)}
          title={title || "Design"}
          htmlContent={htmlContent}
          colorPalette={colorPalette}
        />
      </>
    );
  },
  (prev: MobileFrameProps, next: MobileFrameProps) => {
    // Custom comparison to avoid re-renders if distinct props haven't changed
    // Especially important for colorPalette object reference stability
    return (
      prev.id === next.id &&
      prev.htmlContent === next.htmlContent &&
      prev.title === next.title &&
      prev.subtitle === next.subtitle &&
      prev.width === next.width &&
      prev.height === next.height &&
      prev.initialX === next.initialX &&
      prev.initialY === next.initialY &&
      prev.isGenerating === next.isGenerating &&
      prev.scale === next.scale &&
      prev.autoSave === next.autoSave &&
      // Deep compare color palette
      JSON.stringify(prev.colorPalette) === JSON.stringify(next.colorPalette)
    );
  }
);
