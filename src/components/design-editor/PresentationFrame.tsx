"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

interface PresentationFrameProps {
  htmlContent: string;
  title?: string;
  subtitle?: string;
  className?: string;
  width?: number;
}

export function PresentationFrame({
  htmlContent,
  title,
  subtitle,
  className = "",
  width = 640,
}: PresentationFrameProps) {
  const hasContent = htmlContent && htmlContent.trim().length > 0;
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [iframeHeight, setIframeHeight] = useState<number>(360); // 16:9 aspect ratio

  const aspectRatio = 16 / 9;
  const calculatedHeight = Math.round(width / aspectRatio);

  const srcDoc = useMemo(() => {
    const safeContent = hasContent ? htmlContent : "";
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" />
    <style>
      html, body { margin: 0; padding: 0; background: transparent; overflow: hidden !important; }
      * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
      *::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
      :root { color-scheme: light; }
      #root { width: ${width}px; height: ${calculatedHeight}px; background-color: #ffffff; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; }
    </style>
  </head>
  <body>
    <div id="root">${safeContent}</div>
  </body>
</html>`;
  }, [htmlContent, hasContent, width, calculatedHeight]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const onLoad = () => {
      setIframeHeight(calculatedHeight);
    };

    iframe.addEventListener("load", onLoad);
    return () => {
      iframe.removeEventListener("load", onLoad);
    };
  }, [srcDoc, calculatedHeight]);

  return (
    <div className={`relative ${className} flex flex-col items-center`}>
      {(title || subtitle) && (
        <div className="w-full text-center pb-4">
          {title && (
            <h3 className="text-sm font-medium text-gray-500 tracking-wide uppercase">{title}</h3>
          )}
        </div>
      )}
      
      {/* Presentation Slide Frame - 16:9 aspect ratio */}
      <div 
        className="bg-white rounded-lg overflow-hidden relative shadow-2xl ring-1 ring-gray-900/5"
        style={{ width: `${width}px`, aspectRatio: '16/9' }}
      >
        {hasContent ? (
          <iframe
            ref={iframeRef}
            srcDoc={srcDoc}
            sandbox="allow-scripts allow-same-origin"
            scrolling="no"
            style={{
              width: `${width}px`,
              height: `${calculatedHeight}px`,
              border: "0",
              display: "block",
              background: "white",
            }}
          />
        ) : (
          <div 
            className="flex items-center justify-center text-gray-400 bg-gray-50 w-full h-full"
          >
            <div className="text-center">
              <i className="ri-slideshow-line text-4xl mb-2 block"></i>
              <p className="text-sm">Generating Slide...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
