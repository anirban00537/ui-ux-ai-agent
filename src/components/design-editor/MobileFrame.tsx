"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";

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

import { Trash2, Copy, Check, RotateCcw, ExternalLink, Download, MoreHorizontal, Monitor, GripVertical } from "lucide-react";

interface MobileFrameProps {
  htmlContent: string;
  title?: string;
  subtitle?: string;
  className?: string;
  width?: number;
  initialX?: number;
  initialY?: number;
  colorPalette?: ColorPalette;
  isGenerating?: boolean;
  onCopy?: () => void;
  onDelete?: () => void;
  onSave?: (data: { x: number; y: number; width: number; height: number }) => void;
  isCopied?: boolean;
  scale?: number;
  autoSave?: boolean;
}

export function MobileFrame({
  htmlContent,
  title,
  subtitle,
  className = "",
  width = 440,
  initialX = 0,
  initialY = 0,
  colorPalette,
  isGenerating = false,
  onCopy,
  onDelete,
  onSave,
  isCopied = false,
  scale = 1,
  autoSave = false,
}: MobileFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // State for dimensions
  const aspectRatio = 932 / 430;
  const standardHeight = Math.floor(width * aspectRatio);

  // Initialize size and position
  const [size, setSize] = useState({ width: width, height: standardHeight });
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  
  // Auto-save initial position if requested (for smart placement persistence)
  useEffect(() => {
    if (autoSave && onSave) {
      onSave({ x: initialX, y: initialY, width, height: standardHeight });
    }
    // Only run once on mount/init when autoSave is true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const [isSelected, setIsSelected] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Sync with prop updates if they change externally (and not resizing/dragging)
  useEffect(() => {
    if (!isResizing && !isDragging && width !== size.width) {
       setSize(prev => ({ ...prev, width }));
    }
  }, [width, isResizing, isDragging]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (iframeRef.current && event.source === iframeRef.current.contentWindow) {
        if (typeof event.data === 'object') {
          if (event.data.type === 'CANVAS_READY') {
            setIsLoaded(true);
          } else if (event.data.type === 'UPDATE_HEIGHT') {
            const newHeight = event.data.height;
            if (newHeight && !isResizing && !isDragging) {
              // Ensure we don't shrink below standard mobile height automatically, 
              // but allow growing for longer content.
              setSize(prev => ({ ...prev, height: Math.max(newHeight, standardHeight) }));
            }
          }
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isResizing, isDragging]);

  useEffect(() => {
    if (isLoaded && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_CONTENT", html: htmlContent },
        "*"
      );
    }
  }, [htmlContent, isLoaded]);

  useEffect(() => {
    if (isLoaded && colorPalette && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_THEME", palette: colorPalette },
        "*"
      );
    }
  }, [colorPalette, isLoaded]);

  const containerRef = useRef<HTMLDivElement>(null);

  // Handle Click Outside to Deselect
  useEffect(() => {
    if (!isSelected) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // If we have a container and the click was outside it
      if (containerRef.current && !containerRef.current.contains(target)) {
          // Additional check: maybe it's a drag handle or portal?
          // For now, simple outside check is best.
          setIsSelected(false);
      }
    };

    // Use a slight delay or check to ensure we don't catch the SAME click that selected us
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
    <Rnd
      className={`mobile-frame-container z-10 ${isSelected ? 'z-50' : ''} ${className}`}
      size={{ width: size.width, height: size.height }}
      position={{ x: position.x, y: position.y }}
      scale={scale}
      onMouseDown={handleSelect}
      onDragStart={() => {
        setIsDragging(true);
        setIsSelected(true);
      }}
      onDragStop={(e, d) => {
        setIsDragging(false);
        setPosition({ x: d.x, y: d.y });
        onSave?.({ x: d.x, y: d.y, width: size.width, height: size.height });
      }}
      onResizeStart={() => {
        setIsResizing(true);
        setIsSelected(true);
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        setIsResizing(false);
        const newSize = { 
          width: parseInt(ref.style.width), 
          height: parseInt(ref.style.height) 
        };
        setSize(newSize);
        setPosition(position);
        onSave?.({ x: position.x, y: position.y, width: newSize.width, height: newSize.height });
      }}
      lockAspectRatio={false}
      minWidth={200}
      maxWidth={800}
      minHeight={200}
      dragHandleClassName="drag-target"
      enableResizing={isSelected ? { 
        bottomRight: true, 
        topLeft: true, 
        topRight: true, 
        bottomLeft: true,
        left: true,
        right: true, 
        top: true,
        bottom: true 
      } : false}
      resizeHandleComponent={{
        bottomRight: (
           <div className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border border-primary shadow-sm z-50 cursor-nwse-resize" />
        ),
        bottomLeft: (
           <div className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border border-primary shadow-sm z-50 cursor-nesw-resize" />
        ),
        topRight: (
           <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border border-primary shadow-sm z-50 cursor-nesw-resize" />
        ),
        topLeft: (
           <div className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border border-primary shadow-sm z-50 cursor-nwse-resize" />
        ),
        top: <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border border-primary shadow-sm z-50 cursor-ns-resize hidden" />,
        bottom: <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-primary shadow-sm z-50 cursor-ns-resize hidden" />,
        left: <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3.5 h-3.5 bg-white border-primary shadow-sm z-50 cursor-ew-resize hidden" />,
        right: <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3.5 h-3.5 bg-white border-primary shadow-sm z-50 cursor-ew-resize hidden" />,
      }}
    >
      <div 
        ref={containerRef}
        className="relative w-full h-full flex flex-col items-center select-none"
      >
        
        {/* Figma-like Floating Toolbar (Visible on Selected) - BIGGER VERSION */}
        {isSelected && (
          <div 
            className="absolute -top-24 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-xl border-2 border-border bg-background px-3 py-2 shadow-2xl z-[60] drag-target cursor-grab active:cursor-grabbing animate-in fade-in slide-in-from-bottom-2 duration-200"
            style={{ minWidth: 'max-content' }}
          >
             {/* Drag Handle */}
             <div className="text-foreground-muted/40 hover:text-foreground-muted transition-colors">
                <GripVertical className="w-5 h-5 shrink-0" />
             </div>

             {/* Icon + Title */}
             <div className="flex items-center gap-2 text-foreground-muted">
                <Monitor className="w-5 h-5 shrink-0" />
                <span className="text-base font-semibold select-text max-w-[160px] truncate">{title || 'Mobile Frame'}</span>
             </div>

             {/* Separator */}
             <div className="h-6 w-px bg-border mx-1" />

             {/* Actions Group */}
             <div className="flex items-center gap-1.5">
                {/* Refresh/Regenerate */}
                <button 
                  onMouseDown={(e) => e.stopPropagation()}
                  className="p-1.5 hover:bg-accent rounded-lg text-foreground-muted hover:text-foreground transition-all active:scale-90"
                  title="Regenerate"
                >
                  <RotateCcw className="w-4.5 h-4.5" />
                </button>

                 {/* Copy Code */}
                 {onCopy && (
                  <button 
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); onCopy(); }}
                    className="p-1.5 hover:bg-accent rounded-lg text-foreground-muted hover:text-foreground transition-all active:scale-90"
                    title="Copy Code"
                  >
                    {isCopied ? <Check className="w-4.5 h-4.5 text-green-500" /> : <Copy className="w-4.5 h-4.5" />}
                  </button>
                 )}

                 {/* Delete */}
                 {onDelete && (
                   <button 
                     onMouseDown={(e) => e.stopPropagation()}
                     onClick={(e) => { e.stopPropagation(); onDelete(); }}
                     className="p-1.5 hover:bg-red-500/10 rounded-lg text-foreground-muted hover:text-red-500 transition-all active:scale-90"
                     title="Delete"
                   >
                     <Trash2 className="w-4.5 h-4.5" />
                   </button>
                 )}
                 
                 {/* More Options */}
                 <button 
                   onMouseDown={(e) => e.stopPropagation()}
                   className="p-1.5 hover:bg-accent rounded-lg text-foreground-muted hover:text-foreground transition-all active:scale-90">
                    <MoreHorizontal className="w-4.5 h-4.5" />
                 </button>
             </div>
          </div>
        )}

        {/* Unselected Title (Legacy/Hover) */}
        {!isSelected && (title || subtitle) && (
          <div className="absolute -top-10 w-full text-center opacity-0 group-hover:opacity-100 transition-opacity drag-target cursor-grab">
             <span className="text-xs font-medium text-gray-400 uppercase tracking-wider bg-background/80 px-2 py-1 rounded shadow-sm border border-border">
                {title}
             </span>
          </div>
        )}

        {/* Frame Wrapper */}
        <div 
           className="relative w-full h-full group"
           onClick={(e) => {
             e.stopPropagation();
             setIsSelected(true);
           }}
        >
             {/* Selection Border - Matches SVG Concept */}
            {isSelected && (
              <div className="absolute -inset-[1px] border-[2px] border-primary rounded-[33px] z-20 pointer-events-none" />
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
                background: colorPalette?.background || "#ffffff"
              }}
            >
              <iframe
                ref={iframeRef}
                src="/renderers/canvas"
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
                     // e.stopPropagation(); 
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
  );
}
