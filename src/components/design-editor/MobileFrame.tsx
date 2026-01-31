"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

interface MobileFrameProps {
  htmlContent: string;
  title?: string;
  subtitle?: string;
  className?: string;
  width?: number;
}

export function MobileFrame({
  htmlContent,
  title,
  subtitle,
  className = "",
  width = 300,
}: MobileFrameProps) {
  const hasContent = htmlContent && htmlContent.trim().length > 0;
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [iframeHeight, setIframeHeight] = useState<number>(1);

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
      #root { width: ${width}px; box-sizing: border-box; }
    </style>
  </head>
  <body>
    <div id="root">${safeContent}</div>
  </body>
</html>`;
  }, [htmlContent, hasContent, width]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const updateHeight = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return;
        const root = doc.getElementById("root");
        let newHeight = 0;
        if (root) {
          newHeight = Math.ceil(
            (root as HTMLElement).scrollHeight ||
              (root as HTMLElement).getBoundingClientRect().height ||
              0
          );
        } else {
          newHeight = Math.max(
            doc.body?.scrollHeight || 0,
            doc.documentElement?.scrollHeight || 0
          );
        }
        newHeight = Math.max(newHeight, 1) + 4;
        setIframeHeight((prev) => (prev !== newHeight ? newHeight : prev));
      } catch {}
    };

    const onLoad = () => {
      updateHeight();
      setTimeout(updateHeight, 60);
      setTimeout(updateHeight, 200);
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return;
        const root = (doc.getElementById("root") || doc.body || doc.documentElement) as HTMLElement;
        if (root && typeof ResizeObserver !== "undefined") {
          const resizeObserver = new ResizeObserver(() => updateHeight());
          resizeObserver.observe(root);
          (iframe as unknown as { _ro?: ResizeObserver })._ro = resizeObserver;
        }
      } catch {}
    };

    iframe.addEventListener("load", onLoad);
    const t = setTimeout(onLoad, 100);
    return () => {
      iframe.removeEventListener("load", onLoad);
      clearTimeout(t);
      const ro = (iframe as unknown as { _ro?: ResizeObserver })._ro;
      if (ro?.disconnect) ro.disconnect();
    };
  }, [srcDoc]);

  return (
    <div className={`relative ${className}`}>
      <div
        className="rounded-lg shadow-sm overflow-hidden"
        style={{ width: `${width}px` }}
      >
        {(title || subtitle) && (
          <div className="text-left py-3 px-4">
            {title && (
              <h3 className="text-sm font-light text-gray-400 mb-1">{title}</h3>
            )}
          </div>
        )}
        {hasContent ? (
          <iframe
            ref={iframeRef}
            srcDoc={srcDoc}
            sandbox="allow-scripts allow-same-origin"
            scrolling="no"
            style={{
              width: `${width}px`,
              height: `${iframeHeight}px`,
              border: "0",
              display: "block",
              background: "transparent",
              overflow: "hidden",
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <p>No content available</p>
          </div>
        )}
      </div>
    </div>
  );
}
