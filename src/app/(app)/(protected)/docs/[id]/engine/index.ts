// Engine - Core Layout & Rendering System
// This module contains the core architecture for the editor

// DnD System
export { EditorDndProvider, useEditorDndContext } from "./dnd/EditorDndProvider";

// Theme System
export { EditorThemeProvider, useEditorTheme } from "./theme/EditorThemeProvider";

// Selection System
export { BlockSelectionProvider, useBlockFocus } from "./selection/BlockSelectionContext";

// Renderer
export { BlockRenderer } from "./renderer/BlockRenderer";
export { BlockErrorBoundary } from "./renderer/BlockErrorBoundary";

// Layout Components
export { CardCanvas } from "./layout/CardCanvas";
export { ContentRow } from "./layout/ContentRow";
export { BlockCell } from "./layout/BlockCell";
export { InsertionIndicator } from "./layout/InsertionIndicator";
export { DragPreview } from "./layout/DragPreview";

// Registry
export { BLOCK_DEFINITIONS, type BlockDefinition } from "./registry/block-definitions";
export { createBlockInstance, createRow, createRowWithColumns, createCard } from "./registry/factories";

// Hooks
export { useResize } from "./hooks/useResize";

// Types
export * from "./types";
export type { BlockRendererProps } from "./types";
