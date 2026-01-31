"use client";

import React, { useEffect, useRef, useState } from "react";
import { CARD_MAX_WIDTH } from "@/lib/constants";

interface ScalableCardContainerProps {
    children: React.ReactNode;
}

/**
 * A container that scales its content to fit the available width.
 * It also dynamically measures the content height to ensure correct vertical spacing.
 */
export const ScalableCardContainer = ({ children }: ScalableCardContainerProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentWrapRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [contentHeight, setContentHeight] = useState(0);

    // 1. Determine Scale based on available width
    useEffect(() => {
        if (!containerRef.current) return;

        const updateScale = () => {
            if (!containerRef.current) return;
            const { width } = containerRef.current.getBoundingClientRect();
            // Calculate scale based on available width, maxing out at 1 (no zoom in beyond 100%)
            const targetScale = Math.min(1, width / CARD_MAX_WIDTH);
            setScale(targetScale);
        };

        updateScale();
        const observer = new ResizeObserver(updateScale);
        observer.observe(containerRef.current);

        return () => observer.disconnect();
    }, []);

    // 2. Measure actual content height to adjust container height
    useEffect(() => {
        if (!contentWrapRef.current) return;

        const updateHeight = () => {
            if (contentWrapRef.current) {
                const child = contentWrapRef.current.firstElementChild as HTMLElement;
                if (child) {
                    // Use scrollHeight to capture full content area including bottom padding
                    const height = child.scrollHeight;
                    if (height > 0) {
                        setContentHeight(height);
                    }
                } else {
                    setContentHeight(contentWrapRef.current.offsetHeight);
                }
            }
        };

        // Initial measurement
        updateHeight();
        
        // Polling measurement for a short period after mounting to catch images loading
        // Optimized: Reduced frequency and stop once valid height is found
        let polls = 0;
        const intervalId = setInterval(() => {
            polls++;
            if (contentWrapRef.current) {
                const child = contentWrapRef.current.firstElementChild as HTMLElement;
                if (child && child.scrollHeight > 0) {
                     updateHeight();
                     // If we have a valid height after a few polls, we can likely stop aggressive polling
                     if (polls > 5 && child.scrollHeight > 100) {
                         clearInterval(intervalId);
                     }
                }
            }
        }, 900); // 900ms interval instead of 300ms
        const timeoutId = setTimeout(() => clearInterval(intervalId), 3000);

        const observer = new ResizeObserver(updateHeight);
        observer.observe(contentWrapRef.current);

        return () => {
            observer.disconnect();
            clearInterval(intervalId);
            clearTimeout(timeoutId);
        };
    }, []);

    // We no longer enforce a large aspect-ratio minimum height to allow cards to hug their content.
    // Use a larger fallback to prevent overlap during initial render.
    const finalContentHeight = contentHeight || 400;

    return (
        <div
            ref={containerRef}
            className="w-full flex justify-center items-start overflow-visible origin-top"
            style={{
                height: Math.ceil(finalContentHeight * scale),
            }}
        >
            <div
                style={{
                    width: CARD_MAX_WIDTH,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top center',
                }}
            >
                <div ref={contentWrapRef} className="h-full w-full">
                    {children}
                </div>
            </div>
        </div>
    );
};
