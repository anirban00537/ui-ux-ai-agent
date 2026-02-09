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

    // Strip hardcoded font definitions from AI-generated HTML
    // This allows our theme fonts to take effect instead of the AI's defaults
    const sanitizeHtmlFonts = (html: string): string => {
      let sanitized = html;
      
      // If full HTML document, extract body content and style tags from head
      if (sanitized.includes('<body') || sanitized.includes('<!DOCTYPE')) {
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(sanitized, 'text/html');
          
          // Extract styles from head that are NOT font definitions
          const headStyles = Array.from(doc.head.querySelectorAll('style'))
            .map(style => style.outerHTML)
            .join(' ');
            
          // Extract link tags (e.g. for icons, external fonts)
          const headLinks = Array.from(doc.head.querySelectorAll('link'))
            .map(link => link.outerHTML)
            .join(' ');
            
          // Get body innerHTML
          const bodyContent = doc.body.innerHTML;
          
          sanitized = headLinks + headStyles + bodyContent;
          console.log('[Canvas] Extracted body content and head links from full HTML document');
        } catch (e) {
          console.error('[Canvas] Failed to parse HTML:', e);
        }
      }
      
      // Remove font-family declarations from inline <style> tags
      // Match patterns like: .font-heading{font-family:'DM Sans',sans-serif}
      // and --font-heading: 'DM Sans', sans-serif; in :root
      
      // Remove .font-heading and .font-sans class definitions with font-family
      // Handle both minified and spaced versions, and direct font-family setting
      sanitized = sanitized.replace(
        /\.font-heading\s*\{[^}]*font-family[^}]*\}/gi,
        ''
      );
      sanitized = sanitized.replace(
        /\.font-sans\s*\{[^}]*font-family[^}]*\}/gi,
        ''
      );
      
      // Also remove any generic rule setting font-family
      // BUT preserve closing braces and Material Icons font declarations
      // Match: font-family: value; OR font-family: value} (but don't consume the brace)
      sanitized = sanitized.replace(
        /font-family\s*:\s*[^;}]+;?/gi,
        (match) => {
          // Keep if it's using var() as that might be valid logic
          if (match.includes('var(')) return match;
          // Keep Material Icons font-family declarations  
          if (match.includes('Material')) return match;
          console.log('[Canvas] Removed explicit font-family:', match.trim());
          return '';
        }
      );

      // Remove CSS variable definitions for fonts
      sanitized = sanitized.replace(
        /--font-heading\s*:\s*[^;]+;/gi, 
        (match) => {
             console.log('[Canvas] Removed font var definition:', match);
             return '--font-heading: inherit;';
        }
      );
      sanitized = sanitized.replace(
        /--font-sans\s*:\s*[^;]+;/gi, 
        (match) => {
             console.log('[Canvas] Removed font var definition:', match);
             return '--font-sans: inherit;';
        }
      );
      
      // Remove font-family from body style definitions
      sanitized = sanitized.replace(
        /(body\s*\{[^}]*?)font-family\s*:\s*[^;]+;/gi,
        '$1'
      );
      
      if (sanitized !== html) {
          console.log('[Canvas] sanitizeHtmlFonts modified content. Length diff:', sanitized.length - html.length);
      }

      return sanitized;
    };

    const stripExistingFontStyles = () => {
      console.log('[Canvas] stripExistingFontStyles called');
      // Find and modify style tags in the loaded content
      const styleTags = document.querySelectorAll('style');
      styleTags.forEach((tag) => {
        if (tag.id === 'theme-font-override') return; // Skip our override
        const originalCSS = tag.textContent || '';
        const sanitizedCSS = sanitizeHtmlFonts(originalCSS);
        if (sanitizedCSS !== originalCSS) {
          console.log('[Canvas] Updating style tag content');
          tag.textContent = sanitizedCSS;
        }
      });
    };

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
      if (p.fontHeading || p.fontBody || p.fontFamily) {
        console.log('[Canvas] Applying fonts:', { fontFamily: p.fontFamily, fontHeading: p.fontHeading, fontBody: p.fontBody });
        
        // First, strip any remaining hardcoded fonts from loaded content
        stripExistingFontStyles();
        
        const mainFont = p.fontFamily;
        const headingFont = p.fontHeading || mainFont || "Space Grotesk";
        const bodyFont = p.fontBody || mainFont || "Plus Jakarta Sans";
        console.log('[Canvas] Using fonts - body:', bodyFont, 'heading:', headingFont);

        // 1. Set CSS variables for fonts (set multiple variants for Tailwind 4 compatibility)
        const bodyFontValue = `'${bodyFont}', sans-serif`;
        const headingFontValue = `'${headingFont}', sans-serif`;
        
        // Standard variables
        docRoot.style.setProperty("--font-heading", headingFontValue);
        docRoot.style.setProperty("--font-sans", bodyFontValue);
        
        // Tailwind 4 internal variables (--font-font-xxx maps to font-xxx utility)
        docRoot.style.setProperty("--font-font-sans", bodyFontValue);
        docRoot.style.setProperty("--font-font-heading", headingFontValue);
        
        // Override Tailwind's default font family
        docRoot.style.setProperty("--default-font-family", bodyFontValue);

        // 2. Apply font directly to body and all content to override inline styles
        document.body.style.fontFamily = bodyFontValue;
        
        // Also apply to the canvas design root if it exists
        const designRoot = document.querySelector('.canvas-design-root');
        if (designRoot) {
          (designRoot as HTMLElement).style.fontFamily = bodyFontValue;
        }
        
        // Create/update a style tag for font override with !important
        // Don't use var() here to avoid circular references
        let fontStyle = document.getElementById('theme-font-override');
        if (!fontStyle) {
          fontStyle = document.createElement('style');
          fontStyle.id = 'theme-font-override';
          document.head.appendChild(fontStyle);
        }
        
        // Use high-specificity selectors to beat any inline styles or classes in the content
        fontStyle.textContent = `
          :root {
            --font-sans: ${bodyFontValue} !important;
            --font-heading: ${headingFontValue} !important;
            --font-font-sans: ${bodyFontValue} !important;
            --font-font-heading: ${headingFontValue} !important;
            --default-font-family: ${bodyFontValue} !important;
          }
          /* High specificity selectors using ID */
          #canvas-wrapper,
          #canvas-wrapper *:not(.material-icons):not(.material-icons-outlined):not(.material-icons-round):not(.material-icons-sharp):not(.material-symbols-outlined),
          .canvas-design-root,
          .canvas-design-root *:not(.material-icons):not(.material-icons-outlined):not(.material-icons-round):not(.material-icons-sharp):not(.material-symbols-outlined) {
            font-family: ${bodyFontValue} !important;
          }
          
          /* EXPLICITLY Restore Icon Fonts to beat the global override just in case */
          .material-icons { font-family: 'Material Icons' !important; }
          .material-icons-outlined { font-family: 'Material Icons Outlined' !important; }
          .material-icons-round { font-family: 'Material Icons Round' !important; }
          .material-icons-sharp { font-family: 'Material Icons Sharp' !important; }
          .material-symbols-outlined { font-family: 'Material Symbols Outlined' !important; }
          
          /* Target specific classes that might be in the content */
          /* Target specific classes that might be in the content */
          .font-sans, 
          [class*="font-sans"] {
            font-family: ${bodyFontValue} !important;
          }
          h1, h2, h3, h4, h5, h6, 
          .font-heading,
          [class*="font-heading"] {
            font-family: ${headingFontValue} !important;
          }
        `;


        // 3. Load the font from Google Fonts if not already loaded
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
        const rawHtml = data.html || "";
        // Sanitize fonts from AI-generated HTML so theme fonts can override
        const html = sanitizeHtmlFonts(rawHtml);
        if (root) {
          // In preview mode, content scrolls inside a fixed frame
          // In editor mode, content grows and frame expands, but maintains minimum height
          // The frame has MIN_FRAME_HEIGHT of 1100px, so we need to fill at least that
          root.innerHTML = `
            <div id="canvas-wrapper" class="w-full ${isPreview ? 'h-full overflow-y-auto' : ''} flex flex-col flex-1 ${isPreview ? 'min-h-full' : ''} relative" style="${isPreview ? '' : 'min-height: 1100px;'}">
              <div id="canvas-dot-pattern" class="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style="background-size: 24px 24px; background-image: radial-gradient(var(--primary) 1.5px, transparent 1.5px);"></div>
              <div class="canvas-design-root flex-1 flex flex-col ${isPreview ? 'min-h-full' : ''} relative z-10" style="${isPreview ? '' : 'min-height: 1100px;'}">${html}</div>
            </div>
          `;

          // Force a reflow to trigger Tailwind v4's MutationObserver to process new content
          // This is necessary because innerHTML changes may not always trigger the observer immediately
          void root.offsetHeight;
          
          // Also trigger a slight DOM modification to ensure MutationObserver fires
          root.setAttribute('data-render-time', Date.now().toString());

          // Measure actual content height - look for the first direct child of design root
          // which is the actual UI content, not the wrapper with min-height
          const designRoot = root.querySelector('.canvas-design-root');
          if (designRoot && !isPreview) {
            // Wait a tick for images and fonts to load before measuring
            requestAnimationFrame(() => {
              // Get the actual content element (first child that's not a style)
              const contentEl = designRoot.querySelector(':scope > div:not(style)');
              const contentHeight = contentEl ? contentEl.getBoundingClientRect().height : designRoot.scrollHeight;
              
              if (contentHeight > 0) {
                window.parent.postMessage(
                  {
                    type: "UPDATE_HEIGHT",
                    height: Math.ceil(contentHeight),
                  },
                  "*"
                );
              }
            });
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
        console.log('[Canvas] UPDATE_THEME received, fontFamily:', data.palette.fontFamily);
        applyTheme(data.palette);
      }
    };

    // Watch for size changes with throttling (only really needed for editor mode to inform parent)
    const resizeObserver = new ResizeObserver(() => {
      // Don't report height in preview mode - frame is fixed
      if (isPreview) return;
      
      clearTimeout(heightReportTimeout);
      heightReportTimeout = setTimeout(() => {
        // Measure actual content height from the first child of design root
        const designRoot = root?.querySelector('.canvas-design-root');
        if (!designRoot) return;

        // Get the actual content element (first child that's not a style)
        const contentEl = designRoot.querySelector(':scope > div:not(style)');
        const contentHeight = contentEl ? contentEl.getBoundingClientRect().height : 0;
        
        if (contentHeight > 0) {
          window.parent.postMessage(
            {
              type: "UPDATE_HEIGHT",
              height: Math.ceil(contentHeight),
            },
            "*"
          );
        }
      }, 250); // Increased debounce to let content settle
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
          ${isPreview ? 'min-height: 100%;' : 'min-height: 1100px;'}
          display: flex;
          flex-direction: column;
          overflow-y: ${isPreview ? "auto" : "visible"} !important;
          overflow-x: hidden;
          background: var(--background, transparent);
        }

        #canvas-wrapper {
          flex: 1;
          ${isPreview ? 'height: 100%; overflow-y: auto;' : 'overflow: visible;'}
          ${isPreview ? 'min-height: 100%;' : 'min-height: 1100px;'}
          display: flex;
          flex-direction: column;
          align-items: stretch;
          position: relative;
          background: var(--background, transparent);
        }

        .canvas-design-root > div:not(style):first-of-type {
          ${isPreview ? 'min-height: 100%;' : 'min-height: 1100px;'}
          display: flex;
          flex-direction: column;
          height: 100%;
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
