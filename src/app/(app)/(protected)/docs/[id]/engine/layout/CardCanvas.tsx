import React, {
  useState,
  memo,
  useCallback,
  lazy,
  Suspense,
  useEffect,
  useRef,
} from "react";
import { useDroppable, useDndMonitor } from "@dnd-kit/core";
import { ContentRow } from "./ContentRow";
import type { Card, CardAccent } from "@/store/slices/cardsSlice";
import type { BlockContent } from "@/types/docs";
import { useAppDispatch } from "@/store/hooks";
import {
  setCardAccentSize,
  updateCardAccent,
} from "@/store/slices/cardsSlice";
import { useEditorTheme } from "@/app/(app)/(protected)/docs/[id]/engine/theme/EditorThemeProvider";
import { CardToolbar } from "@/app/(app)/(protected)/docs/[id]/editor/card/CardToolbar";
import type { SelectedImage } from "@/app/(app)/(protected)/docs/[id]/editor/panels/ImagePickerModal";
import { getFontFamily } from "@/lib/fonts";
import { CARD_MAX_WIDTH } from "@/lib/constants";
import { useResize } from "@/app/(app)/(protected)/docs/[id]/engine/hooks/useResize";
import { CardPattern } from "./CardPattern";
import { DragStateBridge } from "./DragStateBridge";
import { InsertDropZone } from "./InsertDropZone";
import { cn } from "@/lib/utils";
import { useLazyImage } from "@/hooks/use-lazy-image";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";

// Lazy load the heavy ImagePickerModal
const ImagePickerModal = lazy(() =>
  import("@/app/(app)/(protected)/docs/[id]/editor/panels/ImagePickerModal").then(
    (mod) => ({ default: mod.ImagePickerModal })
  )
);

interface CardCanvasProps {
  card: Card;
  onUpdateBlock: (
    cardId: string,
    blockId: string,
    content: BlockContent
  ) => void;
  onDeleteRow: (cardId: string, rowId: string) => void;
  onAddColumn: (cardId: string, rowId: string, afterBlockId: string) => void;
  onAddRowAtTop: (cardId: string) => void;
  onAddRowAtBottom: (cardId: string) => void;
  onUpdateColumnWidths: (
    cardId: string,
    rowId: string,
    columnWidths: number[]
  ) => void;
  onUpdateAccent?: (cardId: string, accent: CardAccent | undefined) => void;
  onDeleteBlock?: (cardId: string, rowId: string, blockId: string) => void;
  enableDragHints?: boolean;
  readOnly?: boolean;
  fullWidth?: boolean;
}

export const CardCanvas = memo(function CardCanvas({
  card,
  onUpdateBlock,
  onDeleteRow,
  onAddColumn,
  onAddRowAtTop,
  onAddRowAtBottom,
  onUpdateColumnWidths,
  onUpdateAccent,
  onDeleteBlock,
  enableDragHints = true,
  readOnly = false,
  fullWidth = false,
}: CardCanvasProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [localAccentSize, setLocalAccentSize] = useState(
    card.accent?.size || 40
  );
  const latestSizeRef = useRef<number>(card.accent?.size || 40);
  const [prevAccentSize, setPrevAccentSize] = useState(card.accent?.size);

  const theme = useEditorTheme();
  const dispatch = useAppDispatch();
  const isDark = theme.themeType === "dark";
  const dragActive = enableDragHints ? isDragging : false;

  // Sync local accent size when prop changes (React recommended pattern)
  if (card.accent?.size !== prevAccentSize) {
    setPrevAccentSize(card.accent?.size);
    if (card.accent?.size !== undefined) {
      setLocalAccentSize(card.accent.size);
    }
  }

  // Keep ref in sync (refs can be updated in effects)
  useEffect(() => {
    latestSizeRef.current = localAccentSize;
  }, [localAccentSize]);

  // Accent resize hook
  const {
    isResizing: isResizingAccent,
    handleMouseDown: handleAccentResizeStart,
  } = useResize({
    direction:
      card.accent?.position === "top" || card.accent?.position === "bottom"
        ? "vertical"
        : "horizontal",
    onResize: (delta) => {
      if (card.accent?.position === "background") return;

      const container = document.getElementById(`card-content-${card.id}`);
      if (!container) return;

      const isVertical =
        card.accent?.position === "top" || card.accent?.position === "bottom";
      const containerDimension = isVertical
        ? container.offsetHeight
        : container.offsetWidth;
      if (containerDimension === 0) return;

      setLocalAccentSize((prev) => {
        const deltaPercent = (delta / containerDimension) * 100;
        let newSize =
          card.accent?.position === "right" ||
          card.accent?.position === "bottom"
            ? prev - deltaPercent
            : prev + deltaPercent;

        newSize = Math.max(5, Math.min(100, newSize));
        latestSizeRef.current = newSize;
        return newSize;
      });
    },
    onResizeEnd: () => {
      dispatch(
        setCardAccentSize({ cardId: card.id, size: latestSizeRef.current })
      );
    },
  });

  const handleAccentImageLoaded = useCallback((loadedUrl: string) => {
    if (onUpdateAccent) {
      onUpdateAccent(card.id, {
        ...card.accent!,
        imageUrl: loadedUrl,
        imageQuery: undefined,
      });
    } else {
      dispatch(
        updateCardAccent({
          cardId: card.id,
          update: { imageUrl: loadedUrl, imageQuery: undefined },
        })
      );
    }
  }, [card.id, card.accent, onUpdateAccent, dispatch]);

  const { url: accentUrl, isLoading: accentLoading } = useLazyImage({
    imageUrl: card.accent?.imageUrl || "",
    imageQuery: card.accent?.imageQuery,
    orientation: 'landscape',
    onImageLoaded: handleAccentImageLoaded,
    disabled: card.isStreaming,
  });

  const handleAccentImageSelect = useCallback(
    (image: SelectedImage) => {
      if (onUpdateAccent) {
        const updatedAccent = {
          position: card.accent?.position || ("right" as const),
          size: card.accent?.size || 40,
          imageUrl: image.imageUrl,
          imageQuery: undefined,
        };
        onUpdateAccent(card.id, updatedAccent);
      } else {
        dispatch(
          updateCardAccent({
            cardId: card.id,
            update: { imageUrl: image.imageUrl, imageQuery: undefined },
          })
        );
      }
      setIsImagePickerOpen(false);
    },
    [dispatch, card.id, card.accent, onUpdateAccent]
  );

  // Stabilized callbacks for ContentRow to prevent re-renders
  const handleRowUpdateBlock = useCallback(
    (blockId: string, content: BlockContent) => {
      onUpdateBlock(card.id, blockId, content);
    },
    [card.id, onUpdateBlock]
  );

  const handleRowDelete = useCallback(
    (rowId: string) => {
      onDeleteRow(card.id, rowId);
    },
    [card.id, onDeleteRow]
  );

  const handleRowAddColumn = useCallback(
    (rowId: string, afterBlockId: string) => {
      onAddColumn(card.id, rowId, afterBlockId);
    },
    [card.id, onAddColumn]
  );

  const handleRowUpdateColumnWidths = useCallback(
    (rowId: string, columnWidths: number[]) => {
      onUpdateColumnWidths(card.id, rowId, columnWidths);
    },
    [card.id, onUpdateColumnWidths]
  );
  
  const handleAddRow = useCallback(() => {
    onAddRowAtBottom(card.id);
  }, [card.id, onAddRowAtBottom]);

  const handleRowDeleteBlock = useCallback(
    (rowId: string, blockId: string) => {
      if (onDeleteBlock) {
        onDeleteBlock(card.id, rowId, blockId);
      }
    },
    [card.id, onDeleteBlock]
  );

  // Frame styling
  const getStyle = (): React.CSSProperties => {
    const opacity = theme.cardOpacity !== undefined ? theme.cardOpacity : 1;
    const backdropBlur = theme.cardBackdropBlur || "0px";

    const baseStyle: React.CSSProperties = {
      transition: isResizingAccent
        ? "none"
        : "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      backgroundColor:
        opacity < 1
          ? `rgba(${isDark ? "0, 0, 0" : "255, 255, 255"}, ${opacity})`
          : theme.pageBackground,
      fontFamily: getFontFamily(theme.fontFamily || "Inter"),
      position: "relative",
      backdropFilter: backdropBlur !== "0px" ? `blur(${backdropBlur})` : "none",
      WebkitBackdropFilter:
        backdropBlur !== "0px" ? `blur(${backdropBlur})` : "none",
      minWidth: fullWidth ? "100%" : `${CARD_MAX_WIDTH}px`,
      maxWidth: fullWidth ? "100%" : `${CARD_MAX_WIDTH}px`,
      overflow: "visible",
      display: fullWidth ? "flex" : "block",
      flexDirection: fullWidth ? "column" : undefined,
      justifyContent: fullWidth ? "center" : undefined,
    };

    const borderRadius = fullWidth ? "0px" : theme.cardBorderRadius || "12px";
    const boxShadow =
      theme.cardBoxShadow ||
      (isDark
        ? "0 4px 20px rgba(0, 0, 0, 0.4)"
        : "0 4px 12px rgba(0, 0, 0, 0.08)");

    const borderWidth = theme.cardBorderWidth || "0px";
    const borderStyle = fullWidth ? "none" : theme.cardBorderStyle || "solid";
    const borderColor =
      theme.borderColor ||
      (isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)");

    const border =
      !fullWidth && borderWidth !== "0px" && borderStyle !== "none"
        ? `${borderWidth} ${borderStyle} ${borderColor}`
        : "none";

    return {
      ...baseStyle,
      borderRadius,
      boxShadow: fullWidth ? "none" : boxShadow,
      border,
      backgroundColor: fullWidth ? "transparent" : baseStyle.backgroundColor,
    };
  };

  const finalStyle = getStyle();
  const borderRadius = finalStyle.borderRadius;



  const isVertical =
    card.accent?.position === "top" || card.accent?.position === "bottom";
  const isBackground = card.accent?.position === "background";

  return (
    <>
      <div
        className={`group/card relative z-0 hover:z-20 ${
          fullWidth ? "w-full min-h-screen" : "mx-auto"
        }`}
        style={finalStyle}
        onMouseEnter={!readOnly ? () => setIsHovered(true) : undefined}
        onMouseLeave={!readOnly ? () => setIsHovered(false) : undefined}
      >
        {/* Background layer */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{
            borderRadius,
            ...(fullWidth ? { height: "100%", width: "100%" } : {}),
          }}
        >
          <CardPattern
            pattern={theme.cardDesignPattern}
            primary={theme.primary}
            secondary={theme.secondaryColors}
            opacity={theme.cardDesignPatternOpacity}
          />

          {/* Background Image Mode */}
          {isBackground && (accentUrl || accentLoading) && (
            <div className="absolute inset-0">
              {accentUrl ? (
                <img
                  src={accentUrl}
                  crossOrigin="anonymous"
                  alt="Background Accent"
                  className="w-full h-full object-cover transition-opacity duration-500"
                  style={{ opacity: (card.accent?.size ?? 40) / 100 }}
                />
              ) : (
                <ImagePlaceholder isLoading={accentLoading} className="h-full border-none rounded-none" />
              )}
              <div
                className={`absolute inset-0 ${
                  isDark ? "bg-black/20" : "bg-white/10"
                }`}
              />
            </div>
          )}

          {(theme.cardNoiseOpacity ?? 0) > 0 && (
            <div
              className="absolute inset-0 mix-blend-overlay pointer-events-none"
              style={{
                opacity: theme.cardNoiseOpacity,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                backgroundSize: "100px 100px",
              }}
            />
          )}

          {(theme.cardVignetteOpacity ?? 0) > 0 && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle, transparent 30%, rgba(0,0,0,${theme.cardVignetteOpacity}) 100%)`,
              }}
            />
          )}
        </div>

        {enableDragHints && !readOnly && (
          <DragStateBridge onDragChange={setIsDragging} />
        )}

        {/* Card Controls */}
        {!readOnly && (
          <CardToolbar
            card={card}
            isHovered={isHovered}
            fullWidth={fullWidth}
            onOpenImagePicker={() => setIsImagePickerOpen(true)}
            onAddRow={handleAddRow}
            onUpdateAccent={onUpdateAccent}
            onToggleAccent={
              onUpdateAccent
                ? (cardId) => {
                    if (card.accent) {
                      onUpdateAccent(cardId, undefined);
                    } else {
                      onUpdateAccent(cardId, {
                        position: "right",
                        size: 40,
                        imageUrl: undefined,
                      });
                    }
                  }
                : undefined
            }
          />
        )}

        <div
          id={`card-content-${card.id}`}
          className={`relative z-10 w-full flex items-stretch ${
            card.accent?.position === "right"
              ? "flex-row-reverse"
              : card.accent?.position === "bottom"
              ? "flex-col-reverse"
              : card.accent?.position === "top"
              ? "flex-col"
              : "flex-row"
          }`}
          style={{
            borderRadius,
            minHeight: fullWidth ? "100vh" : "auto",
          }}
        >
          {card.accent && !isBackground && (accentUrl || accentLoading) && (
            <div
              className="relative shrink-0 group/accent z-0"
              style={{
                width: isVertical ? "100%" : `${localAccentSize}%`,
                height: isVertical ? `${localAccentSize}%` : "auto",
                minHeight: isVertical ? "200px" : fullWidth ? "100vh" : "auto",
                overflow: "hidden",
                borderTopLeftRadius:
                  card.accent.position === "left" ||
                  card.accent.position === "top"
                    ? borderRadius
                    : "0",
                borderBottomLeftRadius:
                  card.accent.position === "left" ||
                  card.accent.position === "bottom"
                    ? borderRadius
                    : "0",
                borderTopRightRadius:
                  card.accent.position === "right" ||
                  card.accent.position === "top"
                    ? borderRadius
                    : "0",
                borderBottomRightRadius:
                  card.accent.position === "right" ||
                  card.accent.position === "bottom"
                    ? borderRadius
                    : "0",
              }}
            >
              {accentUrl ? (
                <img
                  src={accentUrl}
                  crossOrigin="anonymous"
                  alt="Accent"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <ImagePlaceholder isLoading={accentLoading} className="h-full border-none rounded-none" />
              )}
              <div className="absolute inset-0 bg-black/10 transition-opacity opacity-0 group-hover/accent:opacity-100" />

              {/* Resize Handle */}
              {!readOnly && (
                <div
                  onMouseDown={handleAccentResizeStart}
                  className={`absolute z-50 transition-all duration-300 ${
                    isVertical
                      ? `left-0 w-full h-[1px] cursor-row-resize ${
                          card.accent.position === "top" ? "bottom-0" : "top-0"
                        }`
                      : `top-0 w-[1px] h-full cursor-col-resize ${
                          card.accent.position === "left"
                            ? "right-0"
                            : "left-0"
                        }`
                  } ${
                    isResizingAccent
                      ? "opacity-100 scale-[2]"
                      : "opacity-0 group-hover/accent:opacity-30 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: theme.primary }}
                >
                  <div
                    className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-primary bg-white transition-all ${
                      isResizingAccent
                        ? "scale-100 opacity-100"
                        : "scale-0 opacity-0 group-hover/accent:scale-100 group-hover/accent:opacity-100"
                    }`}
                  />
                </div>
              )}
            </div>
          )}

          <div
            className={`relative flex-1 flex flex-col justify-center min-w-0 z-10 ${
              isBackground ? "z-20" : ""
            }`}
          >
            <div
              className={cn(
                "relative min-w-0 max-w-full outline-none",
                fullWidth
                  ? "w-full max-w-[1600px] mx-auto px-16 md:px-24 py-20 md:py-32"
                  : "px-3 py-5 md:px-5 md:py-10"
              )}
            >
              <div className="flex flex-col gap-2 relative">
                {!readOnly && (
                  <InsertDropZone
                    cardId={card.id}
                    insertIndex={0}
                    themePrimary={theme.primary}
                    isActive={dragActive}
                  />
                )}
                {(card.rows || []).map((row, rowIndex) => (
                  <React.Fragment key={row.id}>
                    <ContentRow
                      row={row}
                      cardId={card.id}
                      rowIndex={rowIndex}
                      totalRowsInCard={card.rows?.length || 0}
                      isDragging={dragActive}
                      enableDragHints={enableDragHints}
                      onUpdateBlock={handleRowUpdateBlock}
                      onDeleteRow={handleRowDelete}
                      onAddColumn={handleRowAddColumn}
                      onUpdateColumnWidths={handleRowUpdateColumnWidths}
                      onDeleteBlock={onDeleteBlock ? handleRowDeleteBlock : undefined}
                      rowCount={card.rows?.length || 0}
                      readOnly={readOnly}
                      isStreaming={card.isStreaming}
                    />
                    {!readOnly && (
                      <InsertDropZone
                        cardId={card.id}
                        insertIndex={rowIndex + 1}
                        themePrimary={theme.primary}
                        isActive={dragActive}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {!readOnly && isImagePickerOpen && (
        <Suspense fallback={null}>
          <ImagePickerModal
            isOpen={isImagePickerOpen}
            onClose={() => setIsImagePickerOpen(false)}
            onSelect={handleAccentImageSelect}
          />
        </Suspense>
      )}
    </>
  );
});
