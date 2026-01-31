import React, { useState, useRef, useCallback, useEffect, memo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { BlockRenderer } from "@/app/(app)/(protected)/docs/[id]/engine/renderer/BlockRenderer";
import { BlockToolbar } from "@/app/(app)/(protected)/docs/[id]/editor/block-ui/BlockToolbar";
import { useBlockFocus } from "@/app/(app)/(protected)/docs/[id]/engine/selection/BlockSelectionContext";
import type { Block, BlockContent } from "@/types/docs";
import { duplicateBlock, deleteBlock } from "@/store/slices/cardsSlice";
import { useAppDispatch } from "@/store/hooks";
import { useEditorTheme } from "@/app/(app)/(protected)/docs/[id]/engine/theme/EditorThemeProvider";
import { IconGripHorizontal } from "@tabler/icons-react";
import { useResize } from "@/app/(app)/(protected)/docs/[id]/engine/hooks/useResize";

interface BlockCellProps {
  block: Block;
  cardId: string;
  rowId: string;
  index: number;
  totalBlocksInRow: number;
  rowIndex: number;
  totalRowsInCard: number;
  onUpdate: (blockId: string, content: BlockContent) => void;
  onAddColumn: (rowId: string, afterBlockId: string) => void;
  isLastBlock: boolean;
  canAddColumn: boolean;
  onResize?: (index: number, deltaX: number) => void;
  isResizing?: boolean;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
  onDeleteBlock?: (rowId: string, blockId: string) => void;
  readOnly?: boolean;
  isStreaming?: boolean;
}

export const BlockCell = memo(function BlockCell({
  block,
  cardId,
  rowId,
  index,
  totalBlocksInRow,
  rowIndex,
  totalRowsInCard,
  onUpdate,
  onAddColumn,
  isLastBlock,
  canAddColumn,
  onResize,
  isResizing,
  onResizeStart,
  onResizeEnd,
  onDeleteBlock,
  readOnly = false,
  isStreaming = false,
}: BlockCellProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isBorderHovered, setIsBorderHovered] = useState(false);
  const blockRef = useRef<HTMLDivElement>(null);
  
  const theme = useEditorTheme();
  const isDark = theme.themeType === "dark";
  const dispatch = useAppDispatch();
  // Use prop instead of Redux lookup to prevent re-renders
  const isStreamingCard = isStreaming;

  const { focusedBlockId, focusedCardId, setFocusedBlock } = useBlockFocus();
  const handleStartRef = useRef<{ x: number; y: number } | null>(null);
  const wasDraggingRef = useRef(false);

  const isFocused = focusedBlockId === block.id && focusedCardId === cardId;

  // Use the resize hook for column resizing
  const { isResizing: isResizingActive, handleMouseDown: handleBorderMouseDown } = useResize({
    direction: "horizontal",
    onResize: (delta) => {
      if (onResize) onResize(index, delta);
    },
    onResizeStart,
    onResizeEnd,
  });

  // Draggable setup
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `${cardId}-${block.id}`,
    data: { type: "block", block, cardId, rowId, index },
    disabled: readOnly,
  });

  const dragStyle = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 200 : isFocused ? 20 : undefined,
  };

  // Block click handler
  const handleBlockClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        readOnly ||
        target.closest(".ProseMirror") ||
        target.closest("[data-block-action-bar]") ||
        target.closest("[data-transform-menu]")
      ) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      setFocusedBlock(cardId, block.id);
    },
    [block.id, setFocusedBlock, readOnly, cardId]
  );

  // Click outside handler
  useEffect(() => {
    if (!isFocused) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        blockRef.current &&
        !blockRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest("[data-block-action-bar]") &&
        !(e.target as HTMLElement).closest("[data-transform-menu]")
      ) {
        setFocusedBlock(null, null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFocused, setFocusedBlock]);

  // Block actions
  const handleDuplicate = useCallback(() => {
    dispatch(duplicateBlock({ cardId, rowId, blockId: block.id }));
  }, [dispatch, cardId, rowId, block.id]);

  const handleDelete = useCallback(() => {
    if (onDeleteBlock) {
      onDeleteBlock(rowId, block.id);
    } else {
      dispatch(deleteBlock({ cardId, rowId, blockId: block.id }));
    }
    setFocusedBlock(null, null);
  }, [dispatch, cardId, rowId, block.id, setFocusedBlock, onDeleteBlock]);

  return (
    <div
      ref={(node) => {
        if (!readOnly) setNodeRef(node);
        blockRef.current = node;
      }}
      className="group/column relative h-full w-full min-w-0 rounded-xl transition-all"
      style={!readOnly ? dragStyle : {}}
      onMouseEnter={() => !readOnly && setIsHovered(true)}
      onMouseLeave={() => !readOnly && setIsHovered(false)}
      onClick={!readOnly ? handleBlockClick : undefined}
    >
      <div className="relative h-full w-full flex flex-col">
        {/* Resize Handle - Only shows between blocks */}
        {!readOnly && !isLastBlock && onResize && (
          <div
            className="absolute top-4 bottom-4 z-50 flex items-center justify-center cursor-col-resize touch-none"
            style={{ 
              left: "100%",
              width: "24px",
              transform: "translateX(-50%)",
              marginLeft: "2px"
            }}
            onMouseEnter={() => setIsBorderHovered(true)}
            onMouseLeave={() => setIsBorderHovered(false)}
            onMouseDown={handleBorderMouseDown}
          >
            {/* Visual Line */}
            <div 
              className={`w-[2px] h-full rounded-full transition-all duration-200 ${
                isBorderHovered || isResizingActive 
                  ? "opacity-100 bg-blue-500 shadow-[0_0_0_1px_rgba(59,130,246,0.3)]" 
                  : "opacity-0 group-hover/column:opacity-30 bg-gray-400"
              }`}
            />
          </div>
        )}

        {/* Column Handle - Minimal */}
        {!readOnly && (
          <div
            className={`absolute z-30 transition-all duration-200 ${
              isHovered && !isResizing ? "opacity-100" : "opacity-0 group-hover/column:opacity-100"
            }`}
            style={{
              top: "-2px",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <div
              {...attributes}
              {...listeners}
              className="flex items-center justify-center w-6 h-3 cursor-grab active:cursor-grabbing rounded-full transition-all"
              style={{
                backgroundColor: isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.8)",
                color: isDark ? "#000" : "#fff",
              }}
              role="button"
              aria-label={`Drag handle for block ${index + 1}`}
              aria-roledescription="Draggable block handle"
              onPointerDown={(e) => {
                handleStartRef.current = { x: e.clientX, y: e.clientY };
                wasDraggingRef.current = false;
                listeners?.onPointerDown?.(e);
              }}
              onPointerMove={() => {
                if (handleStartRef.current) {
                  wasDraggingRef.current = true;
                }
              }}
              onPointerUp={(e) => {
                if (!wasDraggingRef.current && handleStartRef.current) {
                  const dist = Math.sqrt(
                    Math.pow(e.clientX - handleStartRef.current.x, 2) +
                    Math.pow(e.clientY - handleStartRef.current.y, 2)
                  );
                  if (dist < 5) {
                    e.preventDefault();
                    e.stopPropagation();
                    setFocusedBlock(cardId, block.id);
                  }
                }
                handleStartRef.current = null;
              }}
            >
              <IconGripHorizontal size={10} />
            </div>
          </div>
        )}

        {/* Block Content */}
        <div
          className={`relative p-1 transition-all h-full w-full flex flex-col flex-1 min-w-0 rounded-xl ${
            isDragging && !readOnly ? "opacity-50" : ""
          }`}
          style={{
            outline: !readOnly && isFocused ? `2px solid ${theme.primary}` : "none",
            outlineOffset: "2px",
            overflow: "visible",
          }}
        >
          {/* Block Toolbar */}
          {!readOnly && (
            <BlockToolbar
              isVisible={isFocused}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          )}

          {/* Block Renderer */}
          <BlockRenderer
            block={block}
            onUpdate={(content: BlockContent) => onUpdate(block.id, content)}
            readOnly={readOnly}
            isStreaming={isStreamingCard}
          />
        </div>
      </div>
    </div>
  );
});
