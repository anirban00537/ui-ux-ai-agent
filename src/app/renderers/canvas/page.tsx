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

const testImageUrl = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

const rgbaToHex = (rgba: string) => {
  if (!rgba) return "#000000";
  if (rgba.startsWith("#")) return rgba;
  if (rgba === "transparent") return "transparent";
  
  const match = rgba.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
  if (!match) return rgba;
  
  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  const a = match[4] ? parseFloat(match[4]) : 1;
  
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  
  if (a < 1) {
    const alpha = Math.round(a * 255).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${alpha}`;
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
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
          // Use h-full and min-h-screen to ensure the wrapper fills the iframe viewport
          // This fixes the issue where manual resizing left empty space at the bottom (Step Id: 561)
          root.innerHTML = `
            <div id="canvas-wrapper" class="w-full h-full min-h-full flex flex-col relative" style="${isPreview ? '' : 'min-height: 1100px;'}">
              <div id="canvas-dot-pattern" class="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style="background-size: 24px 24px; background-image: radial-gradient(var(--primary) 1.5px, transparent 1.5px);"></div>
              <div class="canvas-design-root flex-1 flex flex-col h-full relative z-10">
                ${html}
              </div>
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
          // 6. Fix viewport units if infinite canvas
          fixViewportUnits();
        }
      }

      if (data.type === "UPDATE_THEME" && data.palette) {
        console.log('[Canvas] UPDATE_THEME received, fontFamily:', data.palette.fontFamily);
        applyTheme(data.palette);
      }
    };

    // Watch for size changes with throttling (only really needed for editor mode to inform parent)
    // Polyfill for viewport units when using infinite canvas (Editor Mode)
    // When user resizes frame to be very tall (>1000px), standard vh units break layout.
    // We clamp them to standard mobile height (844px).
    function fixViewportUnits() {
      if (isPreview || !root) return;
      
      const viewportHeight = window.innerHeight;
      const INFINITE_CANVAS_THRESHOLD = 1000;
      const STANDARD_MOBILE_HEIGHT = 844;
      const isBigScreen = viewportHeight > INFINITE_CANVAS_THRESHOLD;

      // Find elements with vh classes
      // We target the common patterns coming from AI: min-h-[...vh] and h-[...vh]
      const vhElements = root.querySelectorAll('[class*="h-["]');
      
      vhElements.forEach((el) => {
        const element = el as HTMLElement;
        const classList = Array.from(element.classList);

        // Pattern: min-h-[70vh]
        const minHMatch = classList.find(c => /min-h-\[(\d+)vh\]/.test(c));
        if (minHMatch) {
          if (isBigScreen) {
             const vh = parseInt(minHMatch.match(/min-h-\[(\d+)vh\]/)![1]);
             const px = (STANDARD_MOBILE_HEIGHT * vh) / 100;
             element.style.minHeight = `${px}px`;
          } else {
             element.style.minHeight = '';
          }
        }

        // Pattern: h-[100vh]
        const hMatch = classList.find(c => /^h-\[(\d+)vh\]/.test(c));
        if (hMatch) {
          if (isBigScreen) {
             const vh = parseInt(hMatch.match(/^h-\[(\d+)vh\]/)![1]);
             const px = (STANDARD_MOBILE_HEIGHT * vh) / 100;
             element.style.height = `${px}px`;
          } else {
             element.style.height = '';
          }
        }
      });
    };

    const resizeObserver = new ResizeObserver(() => {
      // Fix units on resize
      fixViewportUnits();

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
    resizeObserver.observe(document.body);
    window.addEventListener("message", handleMessage);
    // Also listen to window resize for fixViewportUnits
    window.addEventListener("resize", fixViewportUnits);
    
    // -------------------------------------------------------------------------
    // INSPECTOR LOGIC
    // -------------------------------------------------------------------------
    let inspectMode = false;
    let hoveredElement: HTMLElement | null = null;
    let selectedElement: HTMLElement | null = null;

    const highlightStyleId = "inspector-styles";
    if (!document.getElementById(highlightStyleId)) {
      const style = document.createElement("style");
      style.id = highlightStyleId;
      style.textContent = `
        .inspector-hover {
          outline: 2px solid #3b82f6 !important;
          cursor: crosshair !important;
        }
        .inspector-selected {
          outline: 2px solid #ef4444 !important;
        }
      `;
      document.head.appendChild(style);
    }

    const getElementPath = (element: HTMLElement): string => {
       // Generate a unique selector or rely on a data-id if we attach one
       // For simplicity, let's use a data-editor-id which we can inject on hover/click if missing
       if (!element.dataset.editorId) {
         element.dataset.editorId = Math.random().toString(36).substr(2, 9);
       }
       return element.dataset.editorId;
    };

    const getComputedStyles = (element: Element) => {
  const computed = window.getComputedStyle(element);
  return {
    color: rgbaToHex(computed.color),
    backgroundColor: rgbaToHex(computed.backgroundColor),
    fontSize: computed.fontSize,
    fontWeight: computed.fontWeight,
    textAlign: computed.textAlign,
    
    // Borders
    borderRadius: computed.borderRadius,
    borderColor: rgbaToHex(computed.borderColor),
    borderWidth: computed.borderWidth,
    borderStyle: computed.borderStyle,
        
        // Spacing Shorthands
        padding: computed.padding,
        margin: computed.margin,
        
        // Individual Spacing
        paddingTop: computed.paddingTop,
        paddingRight: computed.paddingRight,
        paddingBottom: computed.paddingBottom,
        paddingLeft: computed.paddingLeft,
        
        marginTop: computed.marginTop,
        marginRight: computed.marginRight,
        marginBottom: computed.marginBottom,
        marginLeft: computed.marginLeft,
        
        // Layout
        display: computed.display,
        width: computed.width,
        height: computed.height,
        
        // SVG
    fill: rgbaToHex(computed.fill),
    stroke: rgbaToHex(computed.stroke),
  };
};

    const handleInspectHover = (e: MouseEvent) => {
      if (!inspectMode) return;
      e.stopPropagation();
      e.preventDefault();

      const target = e.target as HTMLElement;
      if (target === hoveredElement) return;
      if (target.id === "root" || target.id === "canvas-wrapper") return;

      if (hoveredElement) {
        hoveredElement.classList.remove("inspector-hover");
      }
      
      hoveredElement = target;
      target.classList.add("inspector-hover");
    };

    const handleInspectClick = (e: MouseEvent) => {
      if (!inspectMode) return;
      e.stopPropagation();
      e.preventDefault();

      const target = e.target as HTMLElement;
      if (target.id === "root" || target.id === "canvas-wrapper") return;

      if (selectedElement) {
        selectedElement.classList.remove("inspector-selected");
      }

      selectedElement = target;
      target.classList.add("inspector-selected");

      const editorId = getElementPath(target);
      const styles = getComputedStyles(target);

      window.parent.postMessage({
        type: "ELEMENT_SELECTED",
        element: {
          id: editorId,
          tagName: target.tagName.toLowerCase(),
          innerText: (target.textContent || "").slice(0, 50),
          styles: styles
        }
      }, "*");
    };

    const EXTENDED_handleMessage = (event: MessageEvent) => {
        handleMessage(event); // Call original handler

        const data = event.data;
        if (!data) return;

        if (data.type === "TOGGLE_INSPECT") {
            inspectMode = data.enabled;
            if (inspectMode) {
                document.addEventListener("mouseover", handleInspectHover, true);
                document.addEventListener("click", handleInspectClick, true);
                document.body.style.cursor = "crosshair";
            } else {
                document.removeEventListener("mouseover", handleInspectHover, true);
                document.removeEventListener("click", handleInspectClick, true);
                
                if (hoveredElement) hoveredElement.classList.remove("inspector-hover");
                if (selectedElement) selectedElement.classList.remove("inspector-selected");
                hoveredElement = null;
                selectedElement = null;
                document.body.style.cursor = "";
            }
        }

        if (data.type === "UPDATE_ELEMENT_STYLE") {
             const { id, styles, textContent } = data;
             // Find element by data-editor-id
             const el = document.querySelector(`[data-editor-id="${id}"]`) as HTMLElement;
             if (el) {
                 if (styles) {
                 Object.entries(styles).forEach(([key, value]) => {
                     if (value !== undefined) {
                         // Convert camelCase to kebab-case for setProperty
                         const kebabKey = key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
                         // Use !important to override any Tailwind or AI-generated classes
                         el.style.setProperty(kebabKey, value as string, 'important');
                     }
                 });
             }
                 if (textContent !== undefined) {
                     // Be careful replacing textContent if it has children
                     if (el.children.length === 0) {
                         el.textContent = textContent;
                     }
                 }
                 
                 // Send update to persist
                 // Wait a bit for render
                 setTimeout(() => {
                     const designRoot = document.querySelector('.canvas-design-root');
                     if (designRoot) {
                         // Clean up inspector classes before saving
                         const cleanHtml = designRoot.innerHTML
                             .replace(/inspector-hover/g, '')
                             .replace(/inspector-selected/g, '')
                             .replace(/class="\s*"/g, '');
                         
                         window.parent.postMessage({
                             type: "SAVE_HTML_REQUEST",
                             html: cleanHtml
                         }, "*");
                     }
                 }, 100);
             }
        }

        if (data.type === "DELETE_ELEMENT") {
             const { id } = data;
             const el = document.querySelector(`[data-editor-id="${id}"]`);
             if (el && el.parentNode) {
                 el.parentNode.removeChild(el);
                 
                 // Deselect
                 if (selectedElement === el) selectedElement = null;
                 if (hoveredElement === el) hoveredElement = null;
                 
                 // Save
                 setTimeout(() => {
                     const designRoot = document.querySelector('.canvas-design-root');
                     if (designRoot) {
                         const cleanHtml = designRoot.innerHTML
                             .replace(/inspector-hover/g, '')
                             .replace(/inspector-selected/g, '')
                             .replace(/class="\s*"/g, '');
                         
                         window.parent.postMessage({
                             type: "SAVE_HTML_REQUEST",
                             html: cleanHtml
                         }, "*");
                     }
                 }, 100);
             }
        }
    };

    // Replace the listener with our extended one
    window.removeEventListener("message", handleMessage);
    window.addEventListener("message", EXTENDED_handleMessage);

    window.parent.postMessage({ type: "CANVAS_READY" }, "*");

    return () => {
      root.removeEventListener("error", handleImageError, true);
      window.removeEventListener("message", EXTENDED_handleMessage);
      window.removeEventListener("resize", fixViewportUnits);
      document.removeEventListener("mouseover", handleInspectHover, true);
      document.removeEventListener("click", handleInspectClick, true);
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
          /* Ensure root takes full height to fill the iframe */
          min-height: 100%;
          display: flex;
          flex-direction: column;
          overflow-y: ${isPreview ? "auto" : "visible"} !important;
          overflow-x: hidden;
          background: var(--background, transparent);
        }

        #canvas-wrapper {
          flex: 1;
          ${isPreview ? 'height: 100%; overflow-y: auto;' : 'overflow: visible;'}
          /* Ensure wrapper takes full height even in editor mode to match iframe */
          min-height: 100%; 
          display: flex;
          flex-direction: column;
          align-items: stretch;
          position: relative;
          background: var(--background, transparent);
        }

        .canvas-design-root {
          width: 100%;
          /* Ensure it takes full height so absolute bottom-0 children sit at the bottom of the FRAME */
          min-height: 100%;
          display: flex;
          flex-direction: column;
        }

        .canvas-design-root > div:not(style):first-of-type {
          display: flex;
          flex-direction: column;
          /* Force user code root to take full height */
          min-height: 100%; 
          flex: 1;
        }

        /* Bottom navigation bar should be FIXED to the bottom of the viewport */
        /* This ensures it stays at the bottom even if content is short or frame is resized tall */
        .canvas-design-root nav[class*="bottom-0"],
        .canvas-design-root > div > nav:last-child,
        .canvas-design-root > div:first-of-type > nav:last-child {
          position: fixed !important; 
          bottom: 0 !important;
          left: 0 !important;
          right: 0 !important;
          z-index: 50 !important;
          margin-top: auto !important;
          transform: none !important;
        }

        /* Make main content area flexible to push nav to bottom */
        .canvas-design-root main,
        .canvas-design-root > div > main {
          flex: 1 1 auto !important;
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
