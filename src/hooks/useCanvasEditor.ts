import { useEffect, useCallback, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export const useCanvasEditor = () => {
    // Refs to hold state that shouldn't trigger re-renders but persists
    const inspectModeRef = useRef(false);
    const hoveredElementRef = useRef<HTMLElement | null>(null);
    const selectedElementRef = useRef<HTMLElement | null>(null);
    const editingElementRef = useRef<HTMLElement | null>(null);

    const getElementPath = useCallback((element: HTMLElement): string => {
        if (!element.dataset.editorId) {
            element.dataset.editorId = Math.random().toString(36).substr(2, 9);
        }
        return element.dataset.editorId;
    }, []);

    const rgbaToHex = useCallback((rgba: string) => {
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
    }, []);

    const getComputedStyles = useCallback((element: Element) => {
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
          flexDirection: computed.flexDirection,
          justifyContent: computed.justifyContent,
          alignItems: computed.alignItems,
          width: computed.width,
          height: computed.height,
          opacity: computed.opacity,
          
          // SVG
          fill: rgbaToHex(computed.fill),
          stroke: rgbaToHex(computed.stroke),
        };
    }, [rgbaToHex]);

    const saveDesign = useDebouncedCallback(() => {
        const designRoot = document.querySelector('.canvas-design-root');
        if (designRoot) {
            const clone = designRoot.cloneNode(true) as HTMLElement;
            
            // Clean up inspector artifacts
            clone.querySelectorAll('.inspector-hover').forEach(el => el.classList.remove('inspector-hover'));
            clone.querySelectorAll('.inspector-selected').forEach(el => el.classList.remove('inspector-selected'));
            clone.querySelectorAll('.inspector-editing').forEach(el => {
                el.classList.remove('inspector-editing');
                el.removeAttribute('contenteditable');
            });
            
            // Clean class attributes
            const html = clone.innerHTML.replace(/class="\s*"/g, '');
            
            window.parent.postMessage({
                type: "SAVE_HTML_REQUEST",
                html: html
            }, "*");
        }
    }, 1000);

    const debouncedSync = useDebouncedCallback((target: HTMLElement) => {
        const editorId = getElementPath(target);
        window.parent.postMessage({
            type: "UPDATE_ELEMENT_STYLE", 
            id: editorId,
            textContent: target.innerHTML,
            isLiveEdit: true
        }, "*");
        saveDesign();
    }, 1000);

    const handleContentEditInput = useCallback((e: Event) => {
        const target = e.target as HTMLElement;
        debouncedSync(target);
    }, [debouncedSync]);

    const handleContentEditBlur = useCallback((e: Event) => {
        const target = e.target as HTMLElement;
        target.contentEditable = "false";
        target.classList.remove("inspector-editing");
        target.removeEventListener('input', handleContentEditInput);
        editingElementRef.current = null;

        // Immediate sync on blur
        const editorId = getElementPath(target);
        window.parent.postMessage({
            type: "UPDATE_ELEMENT_STYLE",
            id: editorId,
            textContent: target.innerHTML,
            isLiveEdit: true
        }, "*");
        
        saveDesign.flush();
    }, [getElementPath, handleContentEditInput, saveDesign]);

    const handleInspectDoubleClick = useCallback((e: MouseEvent) => {
        if (!inspectModeRef.current) return;
        let target = e.target as HTMLElement;
        if (target.id === "root" || target.id === "canvas-wrapper") return;

        e.stopPropagation();
        e.preventDefault();
        
        // Blur previous
        if (editingElementRef.current && editingElementRef.current !== target) {
             editingElementRef.current.blur();
        }

        editingElementRef.current = target;
        target.contentEditable = "true";
        target.classList.add("inspector-editing");
        target.focus();
        
        // Select text if no selection
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0 || !target.contains(sel.anchorNode)) {
             const range = document.createRange();
             range.selectNodeContents(target);
             sel?.removeAllRanges();
             sel?.addRange(range);
        }

        target.addEventListener('blur', handleContentEditBlur, { once: true });
        target.addEventListener('input', handleContentEditInput);
    }, [handleContentEditBlur, handleContentEditInput]);

    const handleInspectHover = useCallback((e: MouseEvent) => {
        if (!inspectModeRef.current) return;
        e.stopPropagation();
        e.preventDefault();
  
        const target = e.target as HTMLElement;
        if (target === hoveredElementRef.current) return;
        if (target.id === "root" || target.id === "canvas-wrapper") return;
  
        if (hoveredElementRef.current) {
            hoveredElementRef.current.classList.remove("inspector-hover");
        }
        
        hoveredElementRef.current = target;
        target.classList.add("inspector-hover");
    }, []);

    const handleInspectClick = useCallback((e: MouseEvent) => {
        if (!inspectModeRef.current) return;
        e.stopPropagation();
        e.preventDefault();
  
        const target = e.target as HTMLElement;
        if (target.id === "root" || target.id === "canvas-wrapper") return;
  
        if (selectedElementRef.current) {
            selectedElementRef.current.classList.remove("inspector-selected");
        }
  
        selectedElementRef.current = target;
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
    }, [getComputedStyles, getElementPath]);

    const handleMessage = useCallback((event: MessageEvent) => {
        const data = event.data;
        if (!data) return;

        if (data.type === "TOGGLE_INSPECT") {
            inspectModeRef.current = data.enabled;
            if (inspectModeRef.current) {
                document.addEventListener("mouseover", handleInspectHover, true);
                document.addEventListener("click", handleInspectClick, true);
                document.addEventListener("dblclick", handleInspectDoubleClick, true);
                document.body.style.cursor = "crosshair";
            } else {
                document.removeEventListener("mouseover", handleInspectHover, true);
                document.removeEventListener("click", handleInspectClick, true);
                document.removeEventListener("dblclick", handleInspectDoubleClick, true);
                
                if (hoveredElementRef.current) hoveredElementRef.current.classList.remove("inspector-hover");
                if (selectedElementRef.current) selectedElementRef.current.classList.remove("inspector-selected");
                hoveredElementRef.current = null;
                selectedElementRef.current = null;
                document.body.style.cursor = "";
            }
        }

        if (data.type === "UPDATE_ELEMENT_STYLE") {
             const { id, styles, textContent } = data;
             const el = document.querySelector(`[data-editor-id="${id}"]`) as HTMLElement;
             if (el) {
                 if (styles) {
                    Object.entries(styles).forEach(([key, value]) => {
                        if (value !== undefined) {
                            const kebabKey = key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
                            el.style.setProperty(kebabKey, value as string, 'important');
                        }
                    });
                 }
                 
                 if (textContent !== undefined) {
                     const isLiveEdit = (data as any).isLiveEdit;
                     
                     if (!isLiveEdit) {
                         if (el.children.length === 0) {
                             el.textContent = textContent; 
                             if (el.innerHTML !== textContent) el.innerHTML = textContent; 
                         } else {
                             if (textContent.includes('<') && textContent.includes('>')) {
                                 el.innerHTML = textContent;
                             } else {
                                 el.innerHTML = textContent;
                             }
                         }
                     }
                 }
                 
                 saveDesign();
             }
        }

        if (data.type === "DELETE_ELEMENT") {
             const { id } = data;
             const el = document.querySelector(`[data-editor-id="${id}"]`);
             if (el && el.parentNode) {
                 el.parentNode.removeChild(el);
                 
                 if (selectedElementRef.current === el) selectedElementRef.current = null;
                 if (hoveredElementRef.current === el) hoveredElementRef.current = null;
                 
                 saveDesign();
             }
        }
    }, [handleInspectHover, handleInspectClick, handleInspectDoubleClick, saveDesign]);

    return { handleMessage };
}
