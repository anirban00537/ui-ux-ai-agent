"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, Suspense } from "react";

const FALLBACK_IMAGE = "https://picsum.photos/seed/placeholder/400/600";
const FALLBACK_BG_IMAGE = "https://picsum.photos/seed/background/1200/800";

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

const extractBgUrl = (bgImage: string): string | null => {
  const match = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
  return match ? match[1].trim() : null;
};

const applyBackgroundFallbacks = async (root: HTMLElement) => {
  const elementsWithBg: Array<{ el: HTMLElement; url: string }> = [];
  const uniqueUrls = new Set<string>();

  root.querySelectorAll("*").forEach((node) => {
    const el = node as HTMLElement;
    const bg = getComputedStyle(el).backgroundImage;
    if (!bg || bg === "none") return;
    const url = extractBgUrl(bg);
    if (!url || url.startsWith("data:") || url === FALLBACK_BG_IMAGE) return;
    elementsWithBg.push({ el, url });
    uniqueUrls.add(url);
  });

  const failedUrls = new Set<string>();
  for (const url of uniqueUrls) {
    const ok = await testImageUrl(url);
    if (!ok) failedUrls.add(url);
  }

  elementsWithBg.forEach(({ el, url }) => {
    if (failedUrls.has(url)) {
      el.style.backgroundImage = `url("${FALLBACK_BG_IMAGE}")`;
      el.style.backgroundSize = "cover";
      el.style.backgroundPosition = "center";
    }
  });
};

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
      if (p.background != null) docRoot.style.setProperty("--background", p.background);
      if (p.foreground != null) docRoot.style.setProperty("--foreground", p.foreground);
      if (p.primary != null) docRoot.style.setProperty("--primary", p.primary);
      if (p.primaryForeground != null) docRoot.style.setProperty("--primary-foreground", p.primaryForeground);
      if (p.secondary != null) docRoot.style.setProperty("--secondary", p.secondary);
      if (p.secondaryForeground != null) docRoot.style.setProperty("--secondary-foreground", p.secondaryForeground);
      if (p.mutedForeground != null) docRoot.style.setProperty("--muted-foreground", p.mutedForeground);
      if (p.card != null) docRoot.style.setProperty("--card", p.card);
      if (p.cardForeground != null) docRoot.style.setProperty("--card-foreground", p.cardForeground);
      if (p.border != null) docRoot.style.setProperty("--border", p.border);
      if (p.input != null) docRoot.style.setProperty("--input", p.input);

      // Dynamic Font Loading
      if (p.fontHeading || p.fontBody) {
        const headingFont = p.fontHeading || 'Space Grotesk';
        const bodyFont = p.fontBody || 'Plus Jakarta Sans';
        
        // 1. Set CSS variables for fonts
        docRoot.style.setProperty("--font-heading", `'${headingFont}', sans-serif`);
        docRoot.style.setProperty("--font-sans", `'${bodyFont}', sans-serif`);

        // 2. Load the font from Google Fonts if not already loaded
        const fontId = `google-fonts-${headingFont}-${bodyFont}`.replace(/ /g, '-').toLowerCase();
        if (!document.getElementById(fontId)) {
          const link = document.createElement('link');
          link.id = fontId;
          link.rel = 'stylesheet';
          link.href = `https://fonts.googleapis.com/css2?family=${headingFont.replace(/ /g, '+')}:wght@300;400;500;600;700&family=${bodyFont.replace(/ /g, '+')}:wght@300;400;500;600;700&display=swap`;
          document.head.appendChild(link);
        }
      }
    };

    // Debounce for background fallbacks and height reporting
    let fallbackTimeout: NodeJS.Timeout;
    let heightReportTimeout: NodeJS.Timeout;

    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data) return;

      if (data.type === "UPDATE_CONTENT") {
        const html = data.html || "";
        if (root) {
          // 1. Set HTML - Use h-auto for editor mode to grow, h-full for preview to scroll
          root.innerHTML = `<div id="canvas-wrapper" class="w-full h-auto flex flex-col">${html}</div>`;

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

          // 4. Debounced heavy fallback check
          clearTimeout(fallbackTimeout);
          fallbackTimeout = setTimeout(() => {
            applyBackgroundFallbacks(root).catch(() => {});
          }, 1000);

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
        const wrapper = document.getElementById("canvas-wrapper");
        window.parent.postMessage({ 
          type: "UPDATE_HEIGHT", 
          height: wrapper ? wrapper.scrollHeight : document.body.scrollHeight 
        }, "*");
      }, 150);
    });

    resizeObserver.observe(document.body);
    window.addEventListener("message", handleMessage);
    window.parent.postMessage({ type: "CANVAS_READY" }, "*");

    return () => {
      root.removeEventListener("error", handleImageError, true);
      window.removeEventListener("message", handleMessage);
      resizeObserver.disconnect();
      clearTimeout(fallbackTimeout);
      clearTimeout(heightReportTimeout);
    };
  }, []);

  return (
    <>
      <div
        id="root"
        ref={rootRef}
        className="w-full relative"
      />

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
          width: ${isPreview ? '6px' : '0px'};
          display: ${isPreview ? 'block' : 'none'};
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
          scrollbar-width: ${isPreview ? 'thin' : 'none'};
          scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
        }
        
        html, body {
          margin: 0;
          padding: 0;
          min-height: 100%;
          width: 100%;
          overflow: ${isPreview ? 'hidden' : 'auto'} !important;
          background: var(--background, transparent);
        }

        #root {
          min-height: 100%;
          overflow-y: ${isPreview ? 'auto' : 'visible'} !important;
          overflow-x: hidden;
        }

        #canvas-wrapper {
          min-height: 100%;
        }

        /* Generated content can grow beyond iframe */
        #canvas-wrapper > div:first-child {
          height: auto !important;
          min-height: 100% !important;
          overflow: visible !important;
        }

        /* Prevent internal scrolling in logic (override prompt's overflow-y-auto w/ visible) */
        #canvas-wrapper > div:first-child main {
          overflow: visible !important;
        }
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
