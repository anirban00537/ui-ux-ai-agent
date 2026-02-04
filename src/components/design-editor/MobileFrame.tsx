"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import { cn } from "@/lib/utils";
import { CodeViewerModal } from "./CodeViewerModal";
import { FrameToolbar } from "./FrameToolbar";
import { Monitor } from "lucide-react";

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

interface MobileFrameProps {
  id: string;
  htmlContent: string;
  title?: string;
  subtitle?: string;
  className?: string;
  width?: number;
  height?: number;
  initialX?: number;
  initialY?: number;
  colorPalette?: ColorPalette;
  isGenerating?: boolean;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, prompt: string) => void;
  onSave?: (id: string, data: { x: number; y: number; width: number; height: number }) => void;
  scale?: number;
  autoSave?: boolean;
}

export const MobileFrame = React.memo(({
  id,
  htmlContent,
  title,
  subtitle,
  className = "",
  width = 480,
  height,
  initialX = 0,
  initialY = 0,
  colorPalette,
  isGenerating = false,
  onDelete,
  onUpdate,
  onSave,
  scale = 1,
  autoSave = false,
}: MobileFrameProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showUpdateInput, setShowUpdateInput] = useState(false);

  // State for dimensions - Large Mobile (480x1040)
  const standardRatio = 1040 / 480;
  const standardHeight = Math.floor(width * standardRatio);

  const [size, setSize] = useState({ width: width, height: height || standardHeight });
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isSelected, setIsSelected] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const lastWidthProp = useRef(width);
  const lastHeightProp = useRef(height);
  const lastXProp = useRef(initialX);
  const lastYProp = useRef(initialY);

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
        setSize(prev => ({ ...prev, width }));
        lastWidthProp.current = width;
    }
    if (height !== undefined && height !== lastHeightProp.current) {
        setSize(prev => ({ ...prev, height }));
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
      onSave(id, { x: initialX, y: initialY, width, height: height || standardHeight });
    }
    // Only run once on mount/init when autoSave is true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (iframeRef.current && event.source === iframeRef.current.contentWindow) {
        if (typeof event.data === 'object') {
          if (event.data.type === 'CANVAS_READY') {
            setIsLoaded(true);
            // Immediately sync theme if we have it
            if (colorPalette && iframeRef.current?.contentWindow) {
              iframeRef.current.contentWindow.postMessage(
                { type: "UPDATE_THEME", palette: colorPalette },
                "*"
              );
            }
          } else if (event.data.type === 'UPDATE_HEIGHT') {
            const contentHeight = event.data.height;
            if (contentHeight && !isResizing && !isDragging) {
              setSize(prev => {
                // Max height safety cap to prevent infinite growth
                const MAX_AUTO_HEIGHT = 2000;
                
                // Use content height but keep it within reasonable bounds
                // We allow it to be shorter than standardHeight if the user wants "auto" height
                const targetHeight = contentHeight;
                const safeHeight = Math.min(Math.max(targetHeight, 200), MAX_AUTO_HEIGHT);

                // Only update if difference is significant to avoid jitter loops
                if (Math.abs(safeHeight - prev.height) > 10) {
                   return { ...prev, height: safeHeight };
                }
                return prev;
              });
            }
          }
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [colorPalette, isResizing, isDragging]);

  useEffect(() => {
    if (isLoaded && htmlContent && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { 
          type: "UPDATE_CONTENT", 
          html: htmlContent,
          // Send theme as well during content updates to ensure consistency
          palette: colorPalette 
        },
        "*"
      );
    }
  }, [htmlContent, isLoaded, colorPalette]);

  useEffect(() => {
    if (isLoaded && colorPalette && iframeRef.current?.contentWindow) {
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
      if (rndRef.current) {
        const rndElement = rndRef.current.getSelfElement();
        if (rndElement && !rndElement.contains(target)) {
          setIsSelected(false);
          setShowUpdateInput(false);
        }
      }
    };

    const timer = setTimeout(() => {
        window.addEventListener('mousedown', handleClickOutside);
    }, 10);

    return () => {
        clearTimeout(timer);
        window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSelected]);

  const handleSelect = useCallback((e?: React.MouseEvent | MouseEvent) => {
    if (!isSelected) {
      setIsSelected(true);
    }
  }, [isSelected]);

  return (
    <>
    <Rnd
      ref={rndRef}
      className={`mobile-frame-container z-10 ${isSelected ? 'z-50' : ''} ${className}`}
      size={{ width: size.width, height: size.height }}
      position={{ x: position.x, y: position.y }}
      scale={scale}
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
        onSave?.(id, { x: d.x, y: d.y, width: size.width, height: size.height });
      }}
      onResizeStart={() => {
        setIsResizing(true);
        setIsSelected(true);
      }}
      onResize={(e, direction, ref, delta, position) => {
        setSize({ 
          width: parseInt(ref.style.width), 
          height: parseInt(ref.style.height) 
        });
        setPosition(position);
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        setIsResizing(false);
        const newSize = { 
          width: parseInt(ref.style.width), 
          height: parseInt(ref.style.height) 
        };
        setSize(newSize);
        setPosition(position);
        onSave?.(id, { x: position.x, y: position.y, width: newSize.width, height: newSize.height });
      }}
      enableResizing={{
        bottomRight: true,
        bottomLeft: true,
        topRight: true,
        topLeft: true,
        bottom: false,
        top: false,
        left: false,
        right: false,
      }}
      resizeHandleComponent={isSelected ? {
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
      } : {}}
    >
      <div 
        className="relative w-full h-full flex flex-col items-center select-none"
      >
        {/* Toolbar (Floating Top) */}
        {isSelected && (
          <div className="absolute -top-14 left-0 w-full flex justify-center z-[60]">
             <FrameToolbar
                title={title}
                onDelete={() => onDelete?.(id)}
                onViewCode={() => setShowCodeModal(true)}
                onUpdate={(prompt) => onUpdate?.(id, prompt)}
                showUpdateInput={showUpdateInput}
                setShowUpdateInput={setShowUpdateInput}
              />
          </div>
        )}

        {/* Unselected Title (Legacy/Hover) */}
        {!isSelected && title && (
          <div className="absolute -top-10 w-full text-center opacity-0 group-hover:opacity-100 transition-opacity drag-target cursor-grab">
             <span className="text-xs font-medium text-gray-400 uppercase tracking-wider bg-background/80 px-2 py-1 rounded shadow-sm border border-border">
                {title}
             </span>
          </div>
        )}

        {/* Frame Wrapper */}
        <div 
           className="relative w-full h-full group"
        >
             {/* Selection Border - Rectangular Bounding Box */}
            {isSelected && (
              <div className="absolute -inset-[1px] border border-primary z-20 pointer-events-none" />
            )}

            {/* Generating Animation */}
            {isGenerating && (
              <div 
                  className="absolute -inset-1 rounded-[36px] opacity-75 blur-md pointer-events-none"
                  style={{
                    background: "linear-gradient(90deg, #6366f1, #a855f7, #ec4899, #6366f1)",
                    backgroundSize: "300% 100%",
                    animation: "gradient-flow 2s linear infinite",
                  }}
               />
            )}

            {/* Inner Frame Container */}
            <div
              className={`relative overflow-hidden isolate shadow-2xl w-full h-full ${!isSelected ? 'drag-target cursor-grab active:cursor-grabbing' : ''}`}
              style={{
                borderRadius: "32px", 
                background: "transparent"
              }}
            >
              <iframe
                ref={iframeRef}
                src="/renderers/canvas?mode=editor"
                className={`size-full border-0 block transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                title="Canvas Frame"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                style={{ pointerEvents: (isResizing || isDragging) ? 'none' : 'auto' }}
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
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-gray-300 pointer-events-none">
                  <div className="w-8 h-8 rounded-full border-2 border-current border-t-transparent animate-spin mb-4" />
                  <p className="text-xs font-mono uppercase tracking-widest">Loading Renderer</p>
                </div>
              )}
            </div>
          </div>

        {/* Dimensions Label (Bottom) */}
        {isSelected && (
           <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 rounded-md bg-primary px-2 py-0.5 text-primary-foreground text-xs shadow-sm font-medium tabular-nums z-[60] pointer-events-none">
              {Math.round(size.width)} × {Math.round(size.height)}
           </div>
        )}

        {/* Generating Badge */}
        {isGenerating && (
          <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/20 whitespace-nowrap z-[70]">
            <div className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
            <span className="text-xs font-semibold text-white tracking-wide">Generating...</span>
          </div>
        )}
      </div>
    </Rnd>
    
    <CodeViewerModal 
      isOpen={showCodeModal}
      onClose={() => setShowCodeModal(false)}
      htmlContent={htmlContent}
      title={title}
      colorPalette={colorPalette}
    />
    </>
  );
});
