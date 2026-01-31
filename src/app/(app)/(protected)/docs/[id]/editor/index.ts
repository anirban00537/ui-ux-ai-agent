// Export all editor components

// Core
export { EditorHeader } from "./core/EditorHeader";
export { EditorBackground } from "./core/EditorBackground";

// Engine - Core Architecture
export {
  // Providers
  EditorThemeProvider,
  useEditorTheme,
  EditorDndProvider,
  useEditorDndContext,
  // Selection
  BlockSelectionProvider,
  useBlockFocus,
  // Layout
  CardCanvas,
  ContentRow,
  BlockCell,
  InsertionIndicator,
  DragPreview,
  // Renderer
  BlockRenderer,
  BlockErrorBoundary,
  // Registry
  BLOCK_DEFINITIONS,
  createBlockInstance,
  createRow,
  createRowWithColumns,
  createCard,
  // Hooks
  useResize,
  // Types
  type BlockDefinition,
  type BlockRendererProps,
} from "@/app/(app)/(protected)/docs/[id]/engine";

// Card UI
export { CardNavigator } from "./card/CardNavigator";
export { CardToolbar } from "./card/CardToolbar";
export { CardOptions } from "./card/CardOptions";
export { CardLayoutSelector } from "./card/CardLayoutSelector";
export { CardActionBar } from "./card/CardActionBar";
export { ScalableCardContainer } from "./card/ScalableCardContainer";

// Block UI
export { BlockToolbar } from "./block-ui/BlockToolbar";
export { BlockTypeSelector } from "./block-ui/BlockTypeSelector";
export { BlockOption } from "./block-ui/BlockOption";
export { LayoutOption } from "./block-ui/LayoutOption";

// Panels
export { ToolbarPanel } from "./panels/ToolbarPanel";
export { BlockLibraryPanel } from "./panels/BlockLibraryPanel";
export { ImageLibraryPanel } from "./panels/ImageLibraryPanel";
export { ThemeSelectorPanel } from "./panels/ThemeSelectorPanel";
export { ImagePickerModal } from "./panels/ImagePickerModal";

// Doc
export { DocView } from "./doc/DocView";

// UI
export { LoadingOverlay } from "./ui/LoadingOverlay";

// Utils
export { getBlockTypeIcon, getBlockTypeLabel } from "./utils/blockTypeUtils";

// Block Components
export { ProseMirrorBlock } from "./blocks/prosemirror/ProseMirrorBlock";
export { SimpleNumberCardBlock } from "./blocks/simple-number-card/SimpleNumberCardBlock";
