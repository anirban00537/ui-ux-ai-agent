"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { CardCanvas } from "@/app/(app)/(protected)/docs/[id]/engine/layout/CardCanvas";
import { EditorThemeProvider } from "@/app/(app)/(protected)/docs/[id]/engine/theme/EditorThemeProvider";
import { Theme } from "@/store/slices/cardsSlice";
import { CARD_MAX_WIDTH } from "@/lib/constants";

interface CardPreviewProps {
  card: any;
  theme: Theme;
}

export const CardPreview: React.FC<CardPreviewProps> = ({ card, theme }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Measure container width dynamically using ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initial measurement
    setContainerWidth(container.offsetWidth);

    // Setup ResizeObserver for responsive updates
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width > 0) {
          setContainerWidth(width);
        }
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Calculate scale based on actual container width
  const scale = containerWidth > 0 ? containerWidth / CARD_MAX_WIDTH : 0;
  const cardHeight = CARD_MAX_WIDTH * (9 / 16);

  // Convert API card data to Redux format
  const reduxCard = useMemo(
    () => ({
      id: card.id,
      rows: (card.data?.rows || []).map((row: any) => ({
        ...row,
        blocks: row.blocks || [],
      })),
      accent: card.data?.accent || card.accent || undefined,
    }),
    [card]
  );

  // No-op handlers for read-only preview
  const noop = () => {};

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden w-full flex items-center justify-center"
      style={{
        aspectRatio: "16/9",
        borderRadius: "0.75rem 0.75rem 0 0",
        backgroundColor: theme.pageBackground,
      }}
    >
      {/* Subtle gradient overlay at top for depth */}
      <div
        className="absolute inset-x-0 top-0 h-8 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, transparent 100%)",
        }}
      />

      {/* Only render the card content once we have a valid width */}
      {containerWidth > 0 && (
        <div
          className="pointer-events-none"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "center center",
            width: `${CARD_MAX_WIDTH}px`,
            minHeight: `${cardHeight}px`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontFamily: `${theme.fontFamily}, sans-serif`,
            }}
          >
            <EditorThemeProvider themeOverride={theme}>
              <CardCanvas
                card={reduxCard}
                onUpdateBlock={noop}
                onDeleteRow={noop}
                onAddColumn={noop}
                onAddRowAtTop={noop}
                onAddRowAtBottom={noop}
                onUpdateColumnWidths={noop}
                enableDragHints={false}
                readOnly={true}
              />
            </EditorThemeProvider>
          </div>
        </div>
      )}
    </div>
  );
};
