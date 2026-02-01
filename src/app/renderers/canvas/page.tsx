"use client";

import { useEffect, useRef } from "react";

export default function CanvasPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Just accept messages for now. In production, check origin.
      const data = event.data;
      if (!data) return;

      if (data.type === "UPDATE_CONTENT") {
        const html = data.html || "";
        if (rootRef.current) {
          // 1. Set HTML
          rootRef.current.innerHTML = html;

          // 2. Execute scripts manually consistently
          const scripts = rootRef.current.querySelectorAll("script");
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
