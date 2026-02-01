"use client";

import React, { useEffect, useRef, useState } from "react";

interface ColorPalette {
  background: string;
  primary: string;
  secondary: string;
}

interface PresentationFrameProps {
  htmlContent: string;
  title?: string;
  subtitle?: string;
  className?: string;
  width?: number;
  colorPalette?: ColorPalette;
  isGenerating?: boolean;
}

export function PresentationFrame({
  htmlContent,
  title,
  subtitle,
  className = "",
  width = 640,
  colorPalette,
  isGenerating = false,
}: PresentationFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const aspectRatio = 16 / 9;
  const height = Math.round(width / aspectRatio);

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

      {/* Slide Frame */}
      <div
        className="relative"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        {/* Animated gradient border - only when generating */}
        {isGenerating && (
          <>
            <div
              className="absolute -inset-1 rounded-none opacity-75 blur-md"
              style={{
                background: "linear-gradient(90deg, #6366f1, #a855f7, #ec4899, #6366f1)",
                backgroundSize: "300% 100%",
                animation: "gradient-flow 2s linear infinite",
              }}
            />
            <div
              className="absolute -inset-[3px] rounded-none"
              style={{
                background: "linear-gradient(90deg, #6366f1, #a855f7, #ec4899, #6366f1)",
                backgroundSize: "300% 100%",
                animation: "gradient-flow 2s linear infinite",
              }}
            />
          </>
        )}

        {/* Inner Frame Container - no rounded corners (anti-aliasing at rounded clip caused thin border) */}
        <div
          className="relative overflow-hidden isolate rounded-none"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            backgroundColor: colorPalette?.background ?? "#0f172a",
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
