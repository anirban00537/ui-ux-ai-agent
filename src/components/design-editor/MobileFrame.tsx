"use client";

import React, { useEffect, useRef, useState } from "react";

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
  htmlContent: string;
  title?: string;
  subtitle?: string;
  className?: string;
  width?: number;
  colorPalette?: ColorPalette;
  isGenerating?: boolean;
}

export function MobileFrame({
  htmlContent,
  title,
  subtitle,
  className = "",
  width = 440,
  colorPalette,
  isGenerating = false,
}: MobileFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const aspectRatio = 932 / 430;
  const height = Math.floor(width * aspectRatio);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (iframeRef.current && event.source === iframeRef.current.contentWindow) {
        if (typeof event.data === 'object' && event.data?.type === 'CANVAS_READY') {
          setIsLoaded(true);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

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

  return (
    <div className={`relative ${className} flex flex-col items-center select-none`}>
      {(title || subtitle) && (
        <div className="w-full text-center pb-4 opacity-70 hover:opacity-100 transition-opacity">
          {title && (
            <h3 className={`text-sm font-medium ${isGenerating ? 'text-indigo-400' : 'text-gray-500'} tracking-wide uppercase font-mono`}>
              {title}
            </h3>
          )}
        </div>
      )}

      {/* Frame with animated border */}
      <div 
        className="relative"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        {/* Animated gradient border - only when generating */}
        {isGenerating && (
          <>
            {/* Glow effect */}
            <div 
              className="absolute -inset-1 rounded-[36px] opacity-75 blur-md"
              style={{
                background: "linear-gradient(90deg, #6366f1, #a855f7, #ec4899, #6366f1)",
                backgroundSize: "300% 100%",
                animation: "gradient-flow 2s linear infinite",
              }}
            />
            {/* Sharp border */}
            <div 
              className="absolute -inset-[3px] rounded-[35px]"
              style={{
                background: "linear-gradient(90deg, #6366f1, #a855f7, #ec4899, #6366f1)",
                backgroundSize: "300% 100%",
                animation: "gradient-flow 2s linear infinite",
              }}
            />
          </>
        )}
        
        {/* Inner Frame Container */}
        <div
          className="relative overflow-hidden isolate"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            borderRadius: "32px", 
          }}
        >
          <iframe
            ref={iframeRef}
            src="/renderers/canvas"
            className={`size-full border-0 block transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            title="Canvas Frame"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          />

          {!isLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-gray-300">
               <div className="w-8 h-8 rounded-full border-2 border-current border-t-transparent animate-spin mb-4" />
               <p className="text-xs font-mono uppercase tracking-widest">Loading Renderer</p>
            </div>
          )}
        </div>
      </div>

      {/* Generating Indicator Badge */}
      {isGenerating && (
        <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/20">
          <div className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-white tracking-wide">Generating...</span>
        </div>
      )}
    </div>
  );
}
