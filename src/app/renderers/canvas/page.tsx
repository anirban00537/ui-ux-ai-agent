"use client";

import { useEffect, useRef } from "react";

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
          // 1. Set HTML wrapped so background applies
          root.innerHTML = `<div class="canvas-content-wrapper w-full h-full min-h-full">${html}</div>`;

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

          // 4. Apply fallback for background images that fail to load
          requestAnimationFrame(() => {
            applyBackgroundFallbacks(root).catch(() => {});
          });
        }
      }

      if (data.type === "UPDATE_THEME" && data.palette) {
        const p = data.palette;
        const docRoot = document.documentElement;
        if (p.background != null) docRoot.style.setProperty("--background", p.background);
        if (p.primary != null) docRoot.style.setProperty("--primary", p.primary);
        if (p.secondary != null) docRoot.style.setProperty("--secondary", p.secondary);
        if (p.text != null) docRoot.style.setProperty("--text", p.text);
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
      <div
        id="root"
        ref={rootRef}
        className="w-full h-full overflow-y-auto overflow-x-hidden bg-transparent relative"
      />
    </>
  );
}
