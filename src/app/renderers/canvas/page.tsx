"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, Suspense } from "react";

const FALLBACK_IMAGE = "https://picsum.photos/seed/placeholder/400/600";

const applyFallback = (img: HTMLImageElement) => {
  if (img.src === FALLBACK_IMAGE) return;
  img.src = FALLBACK_IMAGE;
  img.onerror = null;
  img.style.objectFit = "contain";
  img.style.objectPosition = "center";
};

const testImageUrl = (url: string): Promise<boolean> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });


function CanvasContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "editor";
  const isPreview = mode === "preview";

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const handleImageError = (e: Event) => {
      const img = e.target;
      if (img instanceof HTMLImageElement) applyFallback(img);
    };

    root.addEventListener("error", handleImageError, true);

    const applyTheme = (p: any) => {
      const docRoot = document.documentElement;
      if (!p) return;
      if (p.background != null)
        docRoot.style.setProperty("--background", p.background);
      if (p.foreground != null)
        docRoot.style.setProperty("--foreground", p.foreground);
      if (p.primary != null) docRoot.style.setProperty("--primary", p.primary);
      if (p.primaryForeground != null)
        docRoot.style.setProperty("--primary-foreground", p.primaryForeground);
      if (p.secondary != null)
        docRoot.style.setProperty("--secondary", p.secondary);
      if (p.secondaryForeground != null)
        docRoot.style.setProperty(
          "--secondary-foreground",
          p.secondaryForeground
        );
      if (p.mutedForeground != null)
        docRoot.style.setProperty("--muted-foreground", p.mutedForeground);
      if (p.card != null) docRoot.style.setProperty("--card", p.card);
      if (p.cardForeground != null)
        docRoot.style.setProperty("--card-foreground", p.cardForeground);
      if (p.border != null) docRoot.style.setProperty("--border", p.border);
      if (p.input != null) docRoot.style.setProperty("--input", p.input);

      // Dynamic Font Loading
      if (p.fontHeading || p.fontBody) {
        const headingFont = p.fontHeading || "Space Grotesk";
        const bodyFont = p.fontBody || "Plus Jakarta Sans";

        // 1. Set CSS variables for fonts
        docRoot.style.setProperty(
          "--font-heading",
          `'${headingFont}', sans-serif`
        );
        docRoot.style.setProperty("--font-sans", `'${bodyFont}', sans-serif`);

        // 2. Load the font from Google Fonts if not already loaded
        const fontId = `google-fonts-${headingFont}-${bodyFont}`
          .replace(/ /g, "-")
          .toLowerCase();
        if (!document.getElementById(fontId)) {
          const link = document.createElement("link");
          link.id = fontId;
          link.rel = "stylesheet";
          link.href = `https://fonts.googleapis.com/css2?family=${headingFont.replace(
            / /g,
            "+"
          )}:wght@300;400;500;600;700&family=${bodyFont.replace(
            / /g,
            "+"
          )}:wght@300;400;500;600;700&display=swap`;
          document.head.appendChild(link);
        }
      }

      // Explicit body background for immediate coverage
      if (p.background) {
        document.body.style.backgroundColor = p.background;
        document.documentElement.style.backgroundColor = p.background;
      }
    };

    // Debounce for height reporting
    let heightReportTimeout: NodeJS.Timeout;

    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data) return;

      if (data.type === "UPDATE_CONTENT") {
        const html = data.html || "";
        if (root) {
          // In preview mode, content scrolls inside a fixed frame
          // In editor mode, content grows and frame expands
          root.innerHTML = `
            <div id="canvas-wrapper" class="w-full ${isPreview ? 'h-full overflow-y-auto' : 'h-auto'} flex flex-col flex-1 min-h-full relative">
              <div id="canvas-dot-pattern" class="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style="background-size: 24px 24px; background-image: radial-gradient(var(--primary) 1.5px, transparent 1.5px);"></div>
              <div class="canvas-design-root flex-1 flex flex-col min-h-full relative z-10">${html}</div>
            </div>
          `;

          // Measure actual content height (not wrapper which has min-height)
          const designRoot = root.querySelector('.canvas-design-root');
          const contentHeight = designRoot ? designRoot.scrollHeight : 0;
          if (contentHeight > 0) {
            window.parent.postMessage(
              {
                type: "UPDATE_HEIGHT",
                height: contentHeight,
              },
              "*"
            );
          }

          // 2. Attach fallback for images that fail to load
          root.querySelectorAll("img").forEach((img) => {
            img.onerror = () => applyFallback(img);
          });

          // 3. Execute scripts manually
          const scripts = root.querySelectorAll("script");
          scripts.forEach((oldScript) => {
            const newScript = document.createElement("script");
            Array.from(oldScript.attributes).forEach((attr) =>
              newScript.setAttribute(attr.name, attr.value)
            );
            newScript.appendChild(document.createTextNode(oldScript.innerHTML));
            oldScript.parentNode?.replaceChild(newScript, oldScript);
          });


          // 5. Apply theme if provided
          if (data.palette) {
            applyTheme(data.palette);
          }
        }
      }

      if (data.type === "UPDATE_THEME" && data.palette) {
        applyTheme(data.palette);
      }
    };

    // Watch for size changes with throttling (only really needed for editor mode to inform parent)
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(heightReportTimeout);
      heightReportTimeout = setTimeout(() => {
        // Measure actual content height from the design root, not wrapper
        const designRoot = root?.querySelector('.canvas-design-root');
        if (!designRoot) return;

        // Get the actual content height
        const contentHeight = designRoot.scrollHeight;
        
        window.parent.postMessage(
          {
            type: "UPDATE_HEIGHT",
            height: contentHeight,
          },
          "*"
        );
      }, 150);
    });

    resizeObserver.observe(document.body);
    window.addEventListener("message", handleMessage);
    window.parent.postMessage({ type: "CANVAS_READY" }, "*");

    return () => {
      root.removeEventListener("error", handleImageError, true);
      window.removeEventListener("message", handleMessage);
      resizeObserver.disconnect();
      clearTimeout(heightReportTimeout);
    };
  }, []);

  return (
    <>
      <div id="root" ref={rootRef} className={`w-full relative ${isPreview ? 'h-full overflow-y-auto' : ''}`} />

      <style jsx global>{`
        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 0px;
          background: transparent;
          display: none;
        }

        * {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        #root::-webkit-scrollbar {
          width: ${isPreview ? "6px" : "0px"};
          display: ${isPreview ? "block" : "none"};
        }

        #root::-webkit-scrollbar-track {
          background: transparent;
        }

        #root::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.3);
          border-radius: 9999px;
        }

        /* Firefox */
        #root {
          scrollbar-width: ${isPreview ? "thin" : "none"};
          scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          overflow: ${isPreview ? "hidden" : "auto"} !important;
          background: var(--background, transparent);
        }

        #root {
          min-height: 100%;
          display: flex;
          flex-direction: column;
          overflow-y: ${isPreview ? "auto" : "visible"} !important;
          overflow-x: hidden;
          background: var(--background, transparent);
        }

        #canvas-wrapper {
          flex: 1;
          ${isPreview ? 'height: 100%; overflow-y: auto;' : 'height: auto; overflow: visible;'}
          ${isPreview ? 'min-height: 100%;' : ''}
          display: flex;
          flex-direction: column;
          align-items: stretch;
          position: relative;
          background: var(--background, transparent);
        }

        .canvas-design-root > div:not(style):first-of-type {
          min-height: auto !important;
          display: flex;
          flex-direction: column;
        }

        /* In preview mode, allow internal elements to scroll naturally */
        /* In editor mode, prevent internal scrolling so frame grows */
        ${isPreview ? '' : `
        #canvas-wrapper main,
        #canvas-wrapper section,
        #canvas-wrapper > div {
          overflow-y: visible !important;
        }
        `}
      `}</style>
    </>
  );
}

export default function CanvasPage() {
  return (
    <Suspense fallback={null}>
      <CanvasContent />
    </Suspense>
  );
}
