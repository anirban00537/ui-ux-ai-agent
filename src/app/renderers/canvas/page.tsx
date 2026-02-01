"use client";

import { useEffect, useRef } from "react";

const FALLBACK_IMAGE = "https://picsum.photos/seed/placeholder/400/600";

const applyFallback = (img: HTMLImageElement) => {
  if (img.src === FALLBACK_IMAGE) return;
  img.src = FALLBACK_IMAGE;
  img.onerror = null;
  img.style.objectFit = "contain";
  img.style.objectPosition = "center";
};

export default function CanvasPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const handleImageError = (e: Event) => {
      const img = e.target;
      if (img instanceof HTMLImageElement) applyFallback(img);
    };

    root.addEventListener("error", handleImageError, true);

    const handleMessage = (event: MessageEvent) => {
      // Just accept messages for now. In production, check origin.
      const data = event.data;
      if (!data) return;

      if (data.type === "UPDATE_CONTENT") {
        const html = data.html || "";
        if (root) {
          // 1. Set HTML
          root.innerHTML = html;

          // 2. Attach fallback for images that fail to load
          root.querySelectorAll("img").forEach((img) => {
            img.onerror = () => applyFallback(img);
          });

          // 3. Execute scripts manually consistently
          const scripts = root.querySelectorAll("script");
          scripts.forEach((oldScript) => {
            const newScript = document.createElement("script");
            Array.from(oldScript.attributes).forEach((attr) =>
              newScript.setAttribute(attr.name, attr.value)
            );
            newScript.appendChild(document.createTextNode(oldScript.innerHTML));
            oldScript.parentNode?.replaceChild(newScript, oldScript);
          });
        }
      }

      if (data.type === "UPDATE_THEME" && data.palette) {
        const p = data.palette;
        const root = document.documentElement;

        if (p.primary) root.style.setProperty("--primary", p.primary);
        if (p.backgroundLight) root.style.setProperty("--background-light", p.backgroundLight);
        if (p.backgroundDark) root.style.setProperty("--background-dark", p.backgroundDark);
      }
    };

    window.addEventListener("message", handleMessage);

    // Notify parent that the renderer is ready to receive content
    // Use a small timeout to ensure the listener is bound in parent? 
    // Usually parent waits or sends repeatedly, but let's just send 'READY'
    window.parent.postMessage({ type: "CANVAS_READY" }, "*");

    return () => {
      root.removeEventListener("error", handleImageError, true);
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <>
      {/* External Resources that might be needed by designs */}
      {/* External Resources */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css"
      />
      {/* Material Symbols for Google-style designs */}
      <link 
        rel="stylesheet" 
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" 
      />
      
      <div
        id="root"
        ref={rootRef}
        className="w-full h-full overflow-y-auto overflow-x-hidden bg-transparent relative"
      />
    </>
  );
}
