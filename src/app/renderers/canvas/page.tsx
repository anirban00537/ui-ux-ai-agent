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
        
        // Map camelCase palette to kebab-case CSS variables
        const mappings: Record<string, string> = {
          background: p.background,
          foreground: p.foreground,
          card: p.card,
          'card-foreground': p.cardForeground,
          popover: p.popover,
          'popover-foreground': p.popoverForeground,
          primary: p.primary,
          'primary-foreground': p.primaryForeground,
          secondary: p.secondary,
          'secondary-foreground': p.secondaryForeground,
          muted: p.muted,
          'muted-foreground': p.mutedForeground,
          accent: p.accent,
          'accent-foreground': p.accentForeground,
          destructive: p.destructive,
          'destructive-foreground': p.destructiveForeground,
          border: p.border,
          input: p.input,
          ring: p.ring,
          radius: p.radius,
          'chart-1': p.chart1,
          'chart-2': p.chart2,
          'chart-3': p.chart3,
          'chart-4': p.chart4,
          'chart-5': p.chart5,
        };

        Object.entries(mappings).forEach(([key, value]) => {
          if (value) root.style.setProperty(`--${key}`, value);
        });
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
        className="w-full h-full overflow-y-auto overflow-x-hidden bg-transparent relative"
      />
    </>
  );
}
