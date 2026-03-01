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
  fontFamily?: string;
  fontHeading?: string;
  fontBody?: string;
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
  disableDrag?: boolean;
  disableResize?: boolean;
  isStatic?: boolean;
}

export const PreviewMobileFrame = React.memo(({
  id,
  htmlContent,
  title,
  subtitle,
  className = "",
  width = 390,
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
  disableDrag = false,
  disableResize = false,
  isStatic = false,
}: MobileFrameProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showUpdateInput, setShowUpdateInput] = useState(false);

  // State for dimensions - Standard Mobile (390x844)
  const MIN_FRAME_HEIGHT = 844;
  const standardRatio = 844 / 390;
  const frameWidth = width || 390;
  const frameHeight = height || Math.max(Math.floor(frameWidth * standardRatio), MIN_FRAME_HEIGHT);

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
  }, [width, height, initialX, initialY, isResizing, isDragging, isStatic]);



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
    if (!isSelected && !isStatic) {
      setIsSelected(true);
    }
  }, [isSelected, isStatic]);

  const frameContent = (
    <div
      className={cn(
        "relative flex flex-col items-center select-none",
        isStatic ? "w-full h-full" : ""
      )}
    >
      {/* Toolbar (Floating Top) */}
      {isSelected && !isStatic && (
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

      {/* Floating Title (Dark Premium) */}
      {title && !isStatic && (
        <div className={cn(
          "absolute -top-10 w-full text-center transition-opacity drag-target cursor-grab z-[60]",
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest bg-white/95 px-2 py-1 rounded shadow-sm border border-black/[0.04] backdrop-blur-sm">
            {title}
          </span>
        </div>
      )}

      {/* Frame Wrapper */}
      <div
        className="relative w-full h-full group"
      >
        {/* Selection Border - Rectangular Bounding Box */}
        {isSelected && !isStatic && (
          <div className="absolute -inset-[1.5px] border-2 border-primary/50 z-20 pointer-events-none rounded-[40px]" />
        )}

        {/* Generating Animation */}
        {isGenerating && (
          <div
            className="absolute -inset-1.5 rounded-[34px] opacity-75 blur-md pointer-events-none transition-all duration-500"
            style={{
              background: "linear-gradient(90deg, #6366f1, #a855f7, #ec4899, #6366f1)",
              backgroundSize: "300% 100%",
              animation: "gradient-flow 2s linear infinite",
            }}
          />
        )}

        {/* Inner Frame Container (The Phone) */}
        <div
          className={cn(
            "relative overflow-hidden isolate w-full h-full",
            !isSelected && !isStatic ? 'drag-target cursor-grab active:cursor-grabbing' : ''
          )}
          style={{
            borderRadius: "36px",
            background: colorPalette?.background || "#ffffff",
            border: `6px solid ${colorPalette?.border || "#1a1a1a"}`,
            boxShadow: isStatic
              ? "0 25px 50px -12px rgba(0,0,0,0.5)"
              : isSelected
                ? "0 20px 45px rgba(0,0,0,0.25)"
                : "0 8px 16px rgba(0,0,0,0.15)"
          }}
        >

          <iframe
            ref={iframeRef}
            src="/renderers/canvas?mode=preview"
            className={cn(
              "size-full border-0 block transition-opacity duration-500",
              isLoaded ? 'opacity-100' : 'opacity-0'
            )}
            title="Canvas Frame"
            style={{
              pointerEvents: (isResizing || isDragging) ? 'none' : 'auto',
            }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          />

          {/* Click Shield (Unselected) - Draggable */}
          {!isSelected && !isStatic && (
            <div
              className="absolute inset-0 z-40 drag-target cursor-grab active:cursor-grabbing"
              title="Click to select or drag"
              onClick={(e) => {
                setIsSelected(true);
              }}
            />
          )}

          {!isLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white border border-black/5 rounded-[26px]">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4 shadow-sm shadow-primary/10" />
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 font-bold animate-pulse">
                Initializing
              </p>
            </div>
          )}
        </div>

        {/* Dimensions Label (Bottom) */}
        {isSelected && !isStatic && (
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 rounded-full bg-white/95 backdrop-blur-xl border border-black/[0.04] px-3 py-1 text-slate-600 text-[10px] shadow-sm font-bold tracking-widest tabular-nums z-[60] pointer-events-none uppercase whitespace-nowrap">
            {Math.round(frameWidth)} <span className="text-slate-400 mx-1">×</span> {Math.round(frameHeight)}
          </div>
        )}
      </div>


      {/* Generating Badge */}
      {isGenerating && (
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/20 whitespace-nowrap z-[70]">
          <div className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-white tracking-wide">Generating...</span>
        </div>
      )}
    </div>
  );

  if (isStatic) {
    return (
      <div
        className={cn("relative flex items-center justify-center isolation-auto", className)}
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <div
          className="relative transition-all duration-300 origin-center flex-shrink-0"
          style={{
            width: frameWidth,
            height: frameHeight,
            minWidth: frameWidth,
            minHeight: frameHeight,
            transform: `scale(${scale})`
          }}
        >
          {frameContent}
        </div>
      </div>
    );
  }

  return (
    <>
      <Rnd
        ref={rndRef}
        className={`mobile-frame-container z-10 ${isSelected ? 'z-50' : ''} ${className}`}
        size={{ width: frameWidth, height: frameHeight }}
        position={{ x: position.x, y: position.y }}
        disableDragging={disableDrag}
        enableResizing={disableResize ? false : {
          bottomRight: true,
          bottomLeft: true,
          topRight: true,
          topLeft: true,
          bottom: false,
          top: false,
          left: false,
          right: false,
        }}
        scale={scale}
        dragHandleClassName="drag-target"
        onDragStart={() => {
          setIsDragging(true);
          setIsSelected(true);
        }}
        onDrag={(e, d) => {
          setPosition({ x: d.x, y: d.y });
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
          setPosition(position);
          onSave?.(id, { x: position.x, y: position.y, width: newSize.width, height: newSize.height });
        }}
        resizeHandleComponent={isSelected && !disableResize ? {
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
        {frameContent}
      </Rnd>

      <CodeViewerModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        title={title || 'Design'}
        htmlContent={htmlContent}
        colorPalette={colorPalette}
      />
    </>
  );
});
