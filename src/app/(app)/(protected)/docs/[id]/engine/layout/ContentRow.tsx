import React, { useState, useRef, useCallback, memo, useMemo, useEffect } from "react";
import { useDroppable, useDndMonitor } from "@dnd-kit/core";
import { BlockCell } from "@/app/(app)/(protected)/docs/[id]/engine/layout/BlockCell";
import type { Row } from "@/store/slices/cardsSlice";
import type { BlockContent } from "@/types/docs";
import { useAppSelector } from "@/store/hooks";
import {
  selectTheme,
  DEFAULT_THEME,
} from "@/store/slices/cardsSlice";
import { useEditorTheme } from "@/app/(app)/(protected)/docs/[id]/engine/theme/EditorThemeProvider";
import { getFontFamily } from "@/lib/fonts";
import { InsertionIndicator } from "@/app/(app)/(protected)/docs/[id]/engine/layout/InsertionIndicator";
import { IconTrash } from "@tabler/icons-react";
import { getBlockTypeLabel } from "@/app/(app)/(protected)/docs/[id]/editor/utils/blockTypeUtils";

// Wrapper to safely use useDndMonitor only when inside DndContext
const DragMonitorBridge: React.FC<{
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragCancel: () => void;
}> = ({ onDragStart, onDragEnd, onDragCancel }) => {
  useDndMonitor({
    onDragStart,
    onDragEnd,
    onDragCancel,
  });
  return null;
};

interface ContentRowProps {
  row: Row;
  cardId: string;
  rowIndex: number;
  totalRowsInCard: number;
  isDragging?: boolean;
  enableDragHints?: boolean;
  onUpdateBlock: (blockId: string, content: BlockContent) => void;
  onDeleteRow: (rowId: string) => void;
  onAddColumn: (rowId: string, afterBlockId: string) => void;
  onUpdateColumnWidths: (rowId: string, columnWidths: number[]) => void;
  onDeleteBlock?: (rowId: string, blockId: string) => void;
  rowCount: number;
  readOnly?: boolean;
  isStreaming?: boolean;
}

export const ContentRow = memo(function ContentRow({
  row,
  cardId,
  rowIndex,
  totalRowsInCard,
  isDragging = false,
  enableDragHints = true,
  onUpdateBlock,
  onDeleteRow,
  onAddColumn,
  onUpdateColumnWidths,
  onDeleteBlock,
  rowCount,
  readOnly = false,
  isStreaming = false,
}: ContentRowProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnyDragActive, setIsAnyDragActive] = useState(false);
  const [dropIndicator, setDropIndicator] = useState<{
    index: number;
    leftPercent: number;
  } | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  
  // Initialize widths
  const [localWidths, setLocalWidths] = useState<number[]>(
    row.columnWidths && row.columnWidths.length === (row.blocks?.length || 0)
      ? row.columnWidths
      : Array(row.blocks?.length || 0).fill(1)
  );
  
  // Keep tracks of widths without triggering effects during drag
  const latestWidthsRef = useRef<number[]>(localWidths);

  // Sync state when row blocks change or external updates happen
  useEffect(() => {
    if (!isResizing) {
      const newWidths =
        row.columnWidths && row.columnWidths.length === (row.blocks?.length || 0)
          ? row.columnWidths
          : Array(row.blocks?.length || 0).fill(1);
      
      setLocalWidths(newWidths);
      latestWidthsRef.current = newWidths;
    }
  }, [row.columnWidths, row.blocks?.length, isResizing]);

  const rowContainerRef = useRef<HTMLDivElement>(null);
  const theme = useEditorTheme();
  const isDark = theme.themeType === "dark";

  const { setNodeRef, isOver } = useDroppable({
    id: `row-drop-${cardId}-${row.id}`,
    data: {
      type: "row",
      rowId: row.id,
      cardId,
      insertIndex: dropIndicator?.index ?? (row.blocks?.length || 0),
    },
    disabled: readOnly,
  });

  const canAddColumn = true; // Still allow calling the action, it handles row splitting

  // Use localWidths for rendering
  const gridTemplateColumns = useMemo(
    () => localWidths.map((w) => `${w}fr`).join(" "),
    [localWidths]
  );
  
  // Stabilize callbacks to BlockCell
  const handleUpdateBlock = useCallback((blockId: string, content: BlockContent) => {
    onUpdateBlock(blockId, content);
  }, [onUpdateBlock]);

  const handleAddColumn = useCallback((rowId: string, afterBlockId: string) => {
    onAddColumn(rowId, afterBlockId);
  }, [onAddColumn]);

  const handleResizeStart = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    // Commit the final widths to Redux
    if (latestWidthsRef.current) {
      onUpdateColumnWidths(row.id, latestWidthsRef.current);
    }
  }, [onUpdateColumnWidths, row.id]);

  const handleResize = useCallback(
    (index: number, deltaX: number) => {
      if (!rowContainerRef.current) return;
      const containerWidth = rowContainerRef.current.offsetWidth;
      const totalFr = latestWidthsRef.current.reduce((sum, w) => sum + w, 0);
      
      // Convert pixel delta to Fr delta
      const deltaFr = (deltaX / containerWidth) * totalFr;

      // Update the two adjacent columns
      setLocalWidths((prev) => {
        const next = [...prev];
        const leftWidth = next[index];
        const rightWidth = next[index + 1];

        // Limits for min width (e.g. 0.2fr)
        const MIN_WIDTH = 0.2;

        if (leftWidth + deltaFr < MIN_WIDTH) {
           return prev; // Too small
        }
        if (rightWidth - deltaFr < MIN_WIDTH) {
           return prev; // Too small
        }
        
        next[index] = leftWidth + deltaFr;
        next[index + 1] = rightWidth - deltaFr;
        
        latestWidthsRef.current = next;
        return next;
      });
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
      if ((!isOver && !isAnyDragActive) || !rowContainerRef.current || isResizing) {
        if (!isOver && !isAnyDragActive) setDropIndicator(null);
        return;
      }

      const rect = rowContainerRef.current.getBoundingClientRect();
      if (e.clientY < rect.top - 50 || e.clientY > rect.bottom + 50) {
        setDropIndicator(null);
        return;
      }

      const mouseX = e.clientX;
      const relativeX = mouseX - rect.left;

      const blockCount = row.blocks?.length || 0;
      if (blockCount === 0) {
        setDropIndicator({ index: 0, leftPercent: 50 });
        return;
      }
      
      // Calculate boundaries based on current widths
      const totalFr = localWidths.reduce((sum, w) => sum + w, 0);
      const boundaries: number[] = [0];
      let currentX = 0;
      
      for (let i = 0; i < blockCount; i++) {
        const widthPercent = localWidths[i] / totalFr;
        currentX += widthPercent * rect.width;
        boundaries.push(currentX);
      }

      // Find closest boundary
      let closestIndex = 0;
      let minDistance = Infinity;

      boundaries.forEach((boundary, index) => {
        const dist = Math.abs(relativeX - boundary);
        if (dist < minDistance) {
          minDistance = dist;
          closestIndex = index;
        }
      });

      const leftPercent = (boundaries[closestIndex] / rect.width) * 100;

      setDropIndicator({
        index: closestIndex,
        leftPercent: Math.min(100, Math.max(0, leftPercent)),
      });
    },
    [isOver, isAnyDragActive, row.blocks?.length, localWidths, isResizing]
  );

  useEffect(() => {
    if (!isAnyDragActive) {
      setDropIndicator(null);
      return;
    }

    const onGlobalMove = (e: MouseEvent) => handleMouseMove(e);
    window.addEventListener("mousemove", onGlobalMove);
    return () => window.removeEventListener("mousemove", onGlobalMove);
  }, [isAnyDragActive, handleMouseMove]);

  return (
    <div className="group/row relative flex">
      {enableDragHints && !readOnly && (
        <DragMonitorBridge
          onDragStart={() => setIsAnyDragActive(true)}
          onDragEnd={() => {
            setIsAnyDragActive(false);
            setDropIndicator(null);
          }}
          onDragCancel={() => {
            setIsAnyDragActive(false);
            setDropIndicator(null);
          }}
        />
      )}
      
      {/* Row Menu Handle */}
      {!readOnly && (
        <div className="relative flex items-center px-1 z-20">
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-lg flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              title="Row options"
              aria-label="Row options menu"
              aria-haspopup="true"
              aria-expanded={isMenuOpen}
            >
              <svg width="3" height="12" viewBox="0 0 3 12" fill="currentColor">
                <circle cx="1.5" cy="1.5" r="1.5" />
                <circle cx="1.5" cy="6" r="1.5" />
                <circle cx="1.5" cy="10.5" r="1.5" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div
                  className="absolute left-full top-0 ml-2 rounded-xl p-1 z-40 min-w-[140px] shadow-xl border origin-top-left animate-in fade-in zoom-in-95 duration-100"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(30,30,35,0.95)"
                      : "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(12px)",
                    borderColor: isDark
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.1)",
                  }}
                >
                  <button
                    onClick={() => {
                      onDeleteRow(row.id);
                      setIsMenuOpen(false);
                    }}
                    disabled={rowCount <= 1}
                    className="w-full px-3 py-2 text-left text-sm font-medium flex items-center gap-2.5 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                    style={{ color: "#ef4444" }}
                    aria-label="Delete row"
                  >
                    <IconTrash size={16} stroke={2} />
                    Delete Row
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Row Content */}
      <div
        ref={(node) => {
          setNodeRef(node);
          rowContainerRef.current = node;
        }}
        className="group/row flex-1 grid gap-1 transition-all items-stretch rounded-xl relative max-w-full"
        style={{
          gridTemplateColumns,
          fontFamily: getFontFamily(theme.fontFamily || "Inter"),
          backgroundColor: isOver ? `${theme.primary}08` : "transparent",
          overflow: "visible",
        }}
      >
        {(row.blocks || []).map((block, index) => (
          <BlockCell
            key={block.id}
            block={block}
            cardId={cardId}
            rowId={row.id}
            index={index}
            totalBlocksInRow={row.blocks?.length || 0}
            rowIndex={rowIndex}
            totalRowsInCard={totalRowsInCard}
            onUpdate={handleUpdateBlock}
            onAddColumn={handleAddColumn}
            isLastBlock={index === (row.blocks?.length || 0) - 1}
            canAddColumn={canAddColumn}
            readOnly={readOnly}
            isStreaming={isStreaming}
            onDeleteBlock={onDeleteBlock}
            // Resize props
            onResize={handleResize}
            isResizing={isResizing}
            onResizeStart={handleResizeStart}
            onResizeEnd={handleResizeEnd}
          />
        ))}

        {/* The Blue Drop Indicator Line */}
        {isAnyDragActive && dropIndicator && (
          <InsertionIndicator
            isVisible={true}
            orientation="vertical"
            position={`${dropIndicator.leftPercent}%`}
          />
        )}
      </div>
    </div>
  );
});
