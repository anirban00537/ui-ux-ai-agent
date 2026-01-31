import { useState, useCallback } from "react";
import {
  DragStartEvent,
  DragEndEvent,
  closestCenter,
  pointerWithin,
  rectIntersection,
  CollisionDetection,
} from "@dnd-kit/core";
import {
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { Block, BlockContent, Row, CardAccent, Theme } from "@/types";
import { DEFAULT_THEME } from "@/store/slices/cardsSlice";
import { createRow, createBlockInstance } from "@/app/(app)/(protected)/docs/[id]/engine/registry/factories";
import { toast } from "sonner";
import { 
  layoutsService, 
  type LayoutTemplate,
  type LayoutData,
  type CreateLayoutPayload,
  type UpdateLayoutPayload
} from "@/services/layouts";
import { 
  useCreateLayout, 
  useUpdateLayout 
} from "@/hooks/use-layouts";

// Re-export query-related items for backward compatibility
export { 
  useLayouts, 
  useLayout, 
  useDeleteLayout,
  layoutKeys 
} from "@/hooks/use-layouts";

// ============================================================================
// LAYOUT EDITOR HOOK
// ============================================================================

export interface LayoutMetadata {
  id?: string;
  name: string;
  description: string;
  thumbnail?: string;
  tags: string[];
  type: "admin" | "user";
  icon?: string;
}

interface UseLayoutEditorReturn {
  // State
  layoutData: LayoutData;
  layoutMetadata: LayoutMetadata;
  theme: Theme;
  isLoading: boolean;
  isSaving: boolean;

  // Drag and Drop
  sensors: ReturnType<typeof useSensors>;
  activeBlock: Block | null;
  isBlockDragging: boolean;
  draggingBlockType: string | null;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  customCollisionDetection: CollisionDetection;

  // Layout Operations
  handleUpdateBlock: (cardId: string, blockId: string, content: BlockContent) => void;
  handleDeleteRow: (cardId: string, rowId: string) => void;
  handleAddColumn: (cardId: string, rowId: string, afterBlockId: string) => void;
  handleAddRowAtTop: (cardId: string) => void;
  handleAddRowAtBottom: (cardId: string) => void;
  handleAddLayoutRow: (columnCount: number, blockType: string) => void;
  handleDeleteBlock: (cardId: string, rowId: string, blockId: string) => void;
  handleUpdateColumnWidths: (cardId: string, rowId: string, columnWidths: number[]) => void;
  handleUpdateAccent: (cardId: string, accent: CardAccent | undefined) => void;

  // Metadata & Persistence
  handleUpdateMetadata: (updates: Partial<LayoutMetadata>) => void;
  handleSaveLayout: () => Promise<void>;
  handleLoadLayout: (layoutId: string) => Promise<void>;
  handleResetLayout: () => void;
}

const DEFAULT_METADATA: LayoutMetadata = {
  name: "Untitled Layout",
  description: "",
  tags: [],
  type: "admin",
  icon: "IconLayout",
};

export function useLayoutEditor(): UseLayoutEditorReturn {
  // State
  const [layoutData, setLayoutData] = useState<LayoutData>({
    rows: [createRow()],
  });
  const [layoutMetadata, setLayoutMetadata] = useState<LayoutMetadata>(DEFAULT_METADATA);
  const [theme] = useState<Theme>(DEFAULT_THEME);
  const [isLoading, setIsLoading] = useState(false);

  // TanStack Query mutations
  const createLayoutMutation = useCreateLayout();
  const updateLayoutMutation = useUpdateLayout();

  const isSaving = createLayoutMutation.isPending || updateLayoutMutation.isPending;

  // Drag and Drop State
  const [activeBlock, setActiveBlock] = useState<Block | null>(null);
  const [isBlockDragging, setIsBlockDragging] = useState(false);
  const [draggingBlockType, setDraggingBlockType] = useState<string | null>(null);

  // Drag and Drop Sensors
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 6 },
    }),
    useSensor(KeyboardSensor)
  );

  // Custom Collision Detection
  const customCollisionDetection: CollisionDetection = useCallback((args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) return pointerCollisions;

    const rectCollisions = rectIntersection(args);
    if (rectCollisions.length > 0) return rectCollisions;

    return closestCenter(args);
  }, []);

  // Drag Handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;

    if (active.data.current?.type === "block") {
      setActiveBlock(active.data.current.block);
      setIsBlockDragging(false);
    } else if (active.data.current?.type === "block-option") {
      setIsBlockDragging(true);
      setDraggingBlockType(active.data.current.blockType);
    } else if (active.data.current?.type === "layout-option") {
      setIsBlockDragging(true);
      setDraggingBlockType(active.data.current.blockType);
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over) {
        setActiveBlock(null);
        setIsBlockDragging(false);
        setDraggingBlockType(null);
        return;
      }

      // Handle block type drag (from toolbar)
      if (active.data.current?.type === "block-option") {
        const blockType = active.data.current.blockType;
        const initialContent = active.data.current.initialContent;

        if (over.data.current?.type === "row-insert") {
          const { insertIndex } = over.data.current;
          const newBlock = createBlockInstance(blockType as any, initialContent);
          const newRow = createRow([newBlock]);

          setLayoutData((prev: LayoutData) => {
            const newRows = [...prev.rows];
            newRows.splice(insertIndex, 0, newRow);
            return { ...prev, rows: newRows };
          });
        } else if (over.data.current?.type === "row") {
          // Dropping onto an existing row - add block to that row
          const { rowId, insertIndex } = over.data.current;
          const newBlock = createBlockInstance(blockType as any, initialContent);

          setLayoutData((prev: LayoutData) => {
            const newRows = prev.rows.map((row: Row) => {
              if (row.id === rowId) {
                const newBlocks = [...row.blocks];
                const idx = insertIndex ?? row.blocks.length;
                newBlocks.splice(idx, 0, newBlock);
                return {
                  ...row,
                  blocks: newBlocks,
                  columnWidths: newBlocks.map(() => 1),
                };
              }
              return row;
            });
            return { ...prev, rows: newRows };
          });
        }
      }

      // Handle layout drag (from layouts panel - creates row with multiple columns)
      if (active.data.current?.type === "layout-option") {
        const blockType = active.data.current.blockType;
        const columnCount = active.data.current.columnCount || 1;

        if (over.data.current?.type === "row-insert") {
          const { insertIndex } = over.data.current;
          // Create multiple blocks for the layout
          const newBlocks = Array(columnCount).fill(null).map(() => createBlockInstance(blockType as any));
          const newRow: Row = {
            id: crypto.randomUUID(),
            blocks: newBlocks,
            columnWidths: Array(columnCount).fill(1),
          };

          setLayoutData((prev: LayoutData) => {
            const newRows = [...prev.rows];
            newRows.splice(insertIndex, 0, newRow);
            return { ...prev, rows: newRows };
          });
        } else if (over.data.current?.type === "row") {
          // Dropping layout onto existing row - append all blocks
          const { rowId, insertIndex } = over.data.current;
          const newBlocks = Array(columnCount).fill(null).map(() => createBlockInstance(blockType as any));

          setLayoutData((prev: LayoutData) => {
            const newRows = prev.rows.map((row: Row) => {
              if (row.id === rowId) {
                const updatedBlocks = [...row.blocks];
                const idx = insertIndex ?? row.blocks.length;
                updatedBlocks.splice(idx, 0, ...newBlocks);
                return {
                  ...row,
                  blocks: updatedBlocks,
                  columnWidths: updatedBlocks.map(() => 1),
                };
              }
              return row;
            });
            return { ...prev, rows: newRows };
          });
        }
      }

      // Handle block move within layout
      if (active.data.current?.type === "block") {
        const sourceRowId = active.data.current.rowId;
        const blockId = active.data.current.block.id;

        if (over.data.current?.type === "row-insert") {
          const { insertIndex } = over.data.current;

          setLayoutData((prev: LayoutData) => {
            const newRows = [...prev.rows];
            let movedBlock: Block | null = null;

            // Remove from source
            newRows.forEach((row: Row) => {
              if (row.id === sourceRowId) {
                const blockIndex = row.blocks.findIndex((b: Block) => b.id === blockId);
                if (blockIndex !== -1) {
                  [movedBlock] = row.blocks.splice(blockIndex, 1);
                  row.columnWidths = row.blocks.map(() => 1);
                }
              }
            });

            // Add to new row
            if (movedBlock) {
              const newRow = createRow([movedBlock]);
              newRows.splice(insertIndex, 0, newRow);
            }

            // Clean up empty rows
            const filteredRows = newRows.filter((r: Row) => r.blocks.length > 0);
            return {
              ...prev,
              rows: filteredRows.length > 0 ? filteredRows : [createRow()],
            };
          });
        } else if (over.data.current?.type === "row") {
          const targetRowId = over.data.current.rowId;
          const targetInsertIndex = over.data.current.insertIndex;

          setLayoutData((prev: LayoutData) => {
            const newRows = [...prev.rows];
            let movedBlock: Block | null = null;

            // Remove from source
            newRows.forEach((row: Row) => {
              if (row.id === sourceRowId) {
                const blockIndex = row.blocks.findIndex((b: Block) => b.id === blockId);
                if (blockIndex !== -1) {
                  [movedBlock] = row.blocks.splice(blockIndex, 1);
                  row.columnWidths = row.blocks.map(() => 1);
                }
              }
            });

            // Add to target row at specified index
            if (movedBlock) {
              newRows.forEach((row) => {
                if (row.id === targetRowId) {
                  const idx = targetInsertIndex ?? row.blocks.length;
                  row.blocks.splice(idx, 0, movedBlock!);
                  row.columnWidths = row.blocks.map(() => 1);
                }
              });
            }

            // Clean up empty rows
            const filteredRows = newRows.filter((r) => r.blocks.length > 0);
            return {
              ...prev,
              rows: filteredRows.length > 0 ? filteredRows : [createRow()],
            };
          });
        }
      }

      setActiveBlock(null);
      setIsBlockDragging(false);
      setDraggingBlockType(null);
    },
    []
  );

  // Layout Operations
  const handleUpdateBlock = useCallback(
    (cardId: string, blockId: string, content: BlockContent) => {
      setLayoutData((prev: LayoutData) => {
        const newRows = prev.rows.map((row: Row) => ({
          ...row,
          blocks: row.blocks.map((block: Block) =>
            block.id === blockId ? { ...block, content } : block
          ),
        }));
        return { ...prev, rows: newRows };
      });
    },
    []
  );

  const handleDeleteRow = useCallback((cardId: string, rowId: string) => {
    setLayoutData((prev: LayoutData) => {
      const newRows = prev.rows.filter((r: Row) => r.id !== rowId);
      return {
        ...prev,
        rows: newRows.length > 0 ? newRows : [createRow()],
      };
    });
  }, []);

  const handleAddColumn = useCallback(
    (cardId: string, rowId: string, afterBlockId: string) => {
      setLayoutData((prev: LayoutData) => {
        const newRows = prev.rows.map((row: Row) => {
          if (row.id === rowId) {
            const blockIndex = row.blocks.findIndex((b: Block) => b.id === afterBlockId);
            const newBlock = createBlockInstance("prosemirror");
            const newBlocks = [...row.blocks];
            newBlocks.splice(blockIndex + 1, 0, newBlock);

            return {
              ...row,
              blocks: newBlocks,
              columnWidths: newBlocks.map(() => 1),
            };
          }
          return row;
        });
        return { ...prev, rows: newRows };
      });
    },
    []
  );

  const handleAddRowAtTop = useCallback((cardId: string) => {
    setLayoutData((prev: LayoutData) => ({
      ...prev,
      rows: [createRow(), ...prev.rows],
    }));
  }, []);

  const handleAddRowAtBottom = useCallback((cardId: string) => {
    setLayoutData((prev: LayoutData) => ({
      ...prev,
      rows: [...prev.rows, createRow()],
    }));
  }, []);

  const handleUpdateColumnWidths = useCallback(
    (cardId: string, rowId: string, columnWidths: number[]) => {
      setLayoutData((prev: LayoutData) => {
        const newRows = prev.rows.map((row: Row) =>
          row.id === rowId ? { ...row, columnWidths } : row
        );
        return { ...prev, rows: newRows };
      });
    },
    []
  );

  const handleDeleteBlock = useCallback(
    (cardId: string, rowId: string, blockId: string) => {
      setLayoutData((prev: LayoutData) => {
        const newRows = prev.rows.map((row: Row) => {
          if (row.id === rowId) {
            const newBlocks = row.blocks.filter((b: Block) => b.id !== blockId);
            return {
              ...row,
              blocks: newBlocks,
              columnWidths: newBlocks.map(() => 1),
            };
          }
          return row;
        });
        // Remove empty rows
        const filteredRows = newRows.filter((r: Row) => r.blocks.length > 0);
        return {
          ...prev,
          rows: filteredRows.length > 0 ? filteredRows : [createRow()],
        };
      });
    },
    []
  );

  // Accent Operations
  const handleUpdateAccent = useCallback((cardId: string, accent: CardAccent | undefined) => {
    setLayoutData((prev: LayoutData) => ({ ...prev, accent }));
  }, []);

  // Metadata Operations
  const handleUpdateMetadata = useCallback((updates: Partial<LayoutMetadata>) => {
    setLayoutMetadata((prev) => ({ ...prev, ...updates }));
  }, []);

  // Persistence Operations using TanStack Query
  const handleSaveLayout = useCallback(async () => {
    try {
      const payload = {
        name: layoutMetadata.name,
        description: layoutMetadata.description,
        tags: layoutMetadata.tags,
        type: layoutMetadata.type,
        data: layoutData,
      };

      if (layoutMetadata.id) {
        // Update existing layout
        const result = await updateLayoutMutation.mutateAsync({
          id: layoutMetadata.id,
          ...payload,
        });
        // ID stays the same
      } else {
        // Create new layout
        const result = await createLayoutMutation.mutateAsync(payload);
        // Update metadata with new ID
        if (result?.data?.id) {
          setLayoutMetadata((prev) => ({ ...prev, id: result.data.id }));
        }
      }
    } catch (error) {
      // Error handling is done in the mutation hooks
      console.error("Save layout error:", error);
    }
  }, [layoutData, layoutMetadata, createLayoutMutation, updateLayoutMutation]);

  const handleLoadLayout = useCallback(async (layoutId: string) => {
    setIsLoading(true);
    try {
      const result = await layoutsService.getLayout(layoutId);

      // Extract layout from wrapped response
      const layout = result?.data || result;

      if (layout && layout.id) {
        setLayoutData(layout.data as LayoutData);
        setLayoutMetadata({
          id: layout.id,
          name: layout.name,
          description: layout.description || "",
          tags: layout.tags || [],
          type: (layout.type as "admin" | "user") || "admin",
          thumbnail: layout.thumbnail,
          icon: layout.data?.icon || "IconLayout",
        });
        toast.success("Layout loaded successfully!");
      } else {
        toast.error("Failed to load layout");
      }
    } catch (error) {
      console.error("Error loading layout:", error);
      toast.error("Error loading layout");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleResetLayout = useCallback(() => {
    if (confirm("Are you sure you want to reset the layout? All changes will be lost.")) {
      setLayoutData({ rows: [createRow()] });
      setLayoutMetadata(DEFAULT_METADATA);
      toast.info("Layout reset");
    }
  }, []);

  const handleAddLayoutRow = useCallback((columnCount: number, blockType: string) => {
    setLayoutData((prev: LayoutData) => {
      const newBlocks = Array(columnCount).fill(null).map(() => createBlockInstance(blockType as any));
      
      const newRow: Row = {
        id: crypto.randomUUID(),
        blocks: newBlocks,
        columnWidths: Array(columnCount).fill(1),
      };

      return {
        ...prev,
        rows: [...prev.rows, newRow],
      };
    });
  }, []);

  return {
    layoutData,
    layoutMetadata,
    theme,
    isLoading,
    isSaving,
    sensors,
    activeBlock,
    isBlockDragging,
    draggingBlockType,
    handleDragStart,
    handleDragEnd,
    customCollisionDetection,
    handleUpdateBlock,
    handleDeleteRow,
    handleAddColumn,
    handleAddRowAtTop,
    handleAddRowAtBottom,
    handleAddLayoutRow,
    handleDeleteBlock,
    handleUpdateColumnWidths,
    handleUpdateAccent,
    handleUpdateMetadata,
    handleSaveLayout,
    handleLoadLayout,
    handleResetLayout,
  };
}
