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
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css"
      />
      <div
        id="root"
        ref={rootRef}
        className="w-full h-full overflow-y-auto overflow-x-hidden bg-white relative"
      />
    </>
  );
}
