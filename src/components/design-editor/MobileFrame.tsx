"use client";

import React, { useEffect, useRef, useState } from "react";

interface ColorPalette {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  radius: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
}

interface MobileFrameProps {
  htmlContent: string;
  title?: string;
  subtitle?: string;
  className?: string;
  width?: number;
  colorPalette?: ColorPalette;
}

export function MobileFrame({
  htmlContent,
  title,
  subtitle,
  className = "",
  width = 400,
  colorPalette,
}: MobileFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Calculate height based on typical aspect ratio (approx 19.5:9 like iPhone 14/15)
  // iPhone 14 Pro Max is 430x932
  const aspectRatio = 932 / 430;
  const height = Math.floor(width * aspectRatio);

  // Handle Communication
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Ensure the message comes from THIS specific iframe
      if (iframeRef.current && event.source === iframeRef.current.contentWindow) {
        // Listen for ready signal from the canvas
        if (typeof event.data === 'object' && event.data?.type === 'CANVAS_READY') {
          setIsLoaded(true);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Sync content
  useEffect(() => {
    if (isLoaded && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "UPDATE_CONTENT",
          html: htmlContent,
        },
        "*"
      );
    }
  }, [htmlContent, isLoaded]);

  // Sync palette
  useEffect(() => {
    if (isLoaded && colorPalette && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "UPDATE_THEME",
          palette: colorPalette,
        },
        "*"
      );
    }
  }, [colorPalette, isLoaded]);

  return (
    <div className={`relative ${className} flex flex-col items-center select-none`}>
      {(title || subtitle) && (
        <div className="w-full text-center pb-4 opacity-70 hover:opacity-100 transition-opacity">
          {title && (
            <h3 className="text-sm font-medium text-gray-500 tracking-wide uppercase font-mono">
              {title}
            </h3>
          )}
        </div>
      )}

      {/* Frame Container */}
      <div
        className="relative bg-white overflow-hidden isolate"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          // Large border radius to mimic the smooth "squircle" curve
          borderRadius: "50px", 
          // Soft, premium shadow
          boxShadow: `
            0 0 0 1px rgba(0,0,0,0.03),
            0 1px 2px -1px rgba(0,0,0,0.04),
            0 12px 32px -8px rgba(0,0,0,0.08),
            0 24px 64px -12px rgba(0,0,0,0.08)
          `
        }}
      >
        <iframe
          ref={iframeRef}
          src="/renderers/canvas"
          className={`size-full border-0 block transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          title="Canvas Frame"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        />

        {/* Loading State */}
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-gray-300">
             <div className="w-8 h-8 rounded-full border-2 border-current border-t-transparent animate-spin mb-4" />
             <p className="text-xs font-mono uppercase tracking-widest">Loading Renderer</p>
          </div>
        )}
      </div>
    </div>
  );
}
