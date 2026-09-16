# SlideCard Architecture

This doc explains how a `SlideCard` is composed, how drag/drop, resizing, and theming interact, and where to improve next.

## High-Level Structure

```
slidesSlice (Redux state: slides, rows, blocks, widths, theme)
        │
        ▼
  SlideCard (per slide)
    ├─ DragStateBridge (tracks global drag to show hints)
    ├─ InsertDropZone (top + between rows + bottom)
    └─ DroppableRow (per row)
         ├─ DropIndicator (shows insertion line)
         └─ ResizableColumn (per block)
              └─ DraggableBlock
                   ├─ BlockActionBar
                   └─ BlockRenderer (renders the concrete block type)
```

### Box Architecture (visual map)

```
┌──────────────────────────────────────────────────────────────────┐
│                           SlideCard                              │  (themed card shell)                          ← DragStateBridge (drag hints)         InsertDropZone (top)
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                       DroppableRow #1                      │  │
│  │  (insertIndex calc, grid widths, row menu, drop indicator) │  │
│  │  ┌──────────────┬──────────────┬──────────────┐           │  │
│  │  │ ResizableCol │ ResizableCol │ ResizableCol │           │  │   up to 3
│  │  │  (drag+resize│  (drag+resize│  (drag+resize│           │  │
│  │  │   shell)     │   shell)     │   shell)     │           │  │
│  │  └───────┬──────┴───────┬──────┴───────┬──────┘           │  │
│  │          │              │              │                  │  │
│  │   ┌──────▼──────┐ ┌─────▼───────┐ ┌────▼────────┐         │  │
│  │   │DraggableBlock│ │DraggableBlock│ │DraggableBlock│      │  │
│  │   │ (content)    │ │ (content)    │ │ (content)    │      │  │
│  │   │  ├ ActionBar │ │  ├ ActionBar │ │  ├ ActionBar │      │  │
│  │   │  └ Renderer  │ │  └ Renderer  │ │  └ Renderer  │      │  │
│  │   └──────────────┘ └──────────────┘ └──────────────┘      │  │
│  └────────────────────────────────────────────────────────────┘  │
│              InsertDropZone (between rows)                       │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                       DroppableRow #2                      │  │
│  │                ...same structure as above...               │  │
│  └────────────────────────────────────────────────────────────┘  │
│              InsertDropZone (bottom)                            │
└──────────────────────────────────────────────────────────────────┘

Legend:
- SlideCard: themed container, hover affordances, row add buttons.
- InsertDropZone: droppable targets for adding rows between/around.
- DroppableRow: computes insertIndex for block drops; owns grid widths; shows drop indicator.
- ResizableCol: drag handle + column resize handle; bounds widths; hosts a block.
- DraggableBlock: block payload; exposes ActionBar (duplicate/delete/transform/move) and Renderer (CTA, gallery, text, etc.).
```

## Component Roles

- `SlideCard`

  - Presents one slide with themed card styling and hover-only row controls.
  - Wraps rows with `InsertDropZone` droppables so toolbar blocks can add rows anywhere.
  - Delegates all mutations to callbacks from parent (which likely dispatch `slidesSlice` actions / command bus).

- `DroppableRow`

  - Creates a row-level droppable area (`id: row-drop-${slideId}-${row.id}`) and calculates `insertIndex` based on cursor position to allow precise insertion within a row.
  - Manages row-local column widths (`gridTemplateColumns`) with fractional units and persists via `onUpdateColumnWidths`.
  - Shows row menu (delete), hover borders, and the vertical `DropIndicator` while dragging.

- `ResizableColumn`

  - Wraps a single block, providing both drag handle (via `useDraggable`) and resize handle between columns.
  - Translates horizontal mouse movement into fractional width adjustments, enforcing a 10% minimum width per column before persisting through `onResizeEnd`.
  - Hosts the menu (delete column) and the embedded `DraggableBlock` content.

- `DraggableBlock`

  - Renders the block content via `BlockRenderer` and exposes action bar for duplicate/delete/transform/move.
  - Handles focus management (`BlockFocusContext`) and drag state for reordering within a row.
  - Dispatches `slidesSlice` actions (duplicate, delete, transform, reorder) directly.

- `useEditorDnd`

  - Configures dnd-kit sensors and custom collision detection that prefers row-insert zones, then rows, then closest center.
  - Drag start/end orchestrates two modes: dragging a block type from the toolbar (adds rows/blocks) vs. dragging an existing block (moves/reorders across rows).

- `slidesSlice`
  - Owns canonical slide/row/block data plus theme.
  - Provides reducers for block CRUD, row add/delete, column width persistence, and block reorder/move across rows.

## Interaction Flows

### Adding rows/blocks from toolbar drag

1. User drags a block type (data `type: block-option`).
2. `useEditorDnd.handleDragEnd` checks drop target:
   - `row-insert` droppable (`InsertDropZone`) → `commandBus.addRowWithColumnsAtIndex`.
   - `row` droppable (`DroppableRow`) with `insertIndex` → `commandBus.addBlockAfter` at that index.

### Moving an existing block

1. `DraggableBlock` (or `ResizableColumn` handle) emits drag with data `{ type: "block", block, slideId, rowId, index }`.
2. `useEditorDnd.handleDragEnd` locates source row/index from current slides.
3. Drop targets:
   - `row-insert` → `commandBus.moveBlockToNewRow`.
   - `row` → if same row, `commandBus.reorderBlocksInRow`; else `commandBus.moveBlock` with target index derived from `insertIndex`.

### Resizing columns

1. User drags the inter-column handle in `ResizableColumn`.
2. `DroppableRow` receives `onResize(index, deltaX)`; converts pixels to fractional units relative to container width.
3. Widths are clamped so no column drops below 10% of total width; updates persisted on mouseup via `onUpdateColumnWidths`.

### Theming & Styling

- `selectTheme` provides palette and font; `getFontFamily` applies typography.
- Hover/drag states adjust borders, shadows, and translucency to show affordances without clutter.

## Improvement Ideas

- **Row menu extensibility**: add duplicate row, move up/down, and layout presets to speed slide structuring.
- **Cross-row block moves**: provide UI affordance (keyboard shortcuts or buttons) alongside drag to improve accessibility.
- **Focus/selection clarity**: add keyboard focus rings and ARIA live hints on drag/drop to aid screen readers.
- **Undo/redo integration**: ensure drag/resizes dispatch command objects that can be undone/redone reliably (likely via `commandBus`).
- **Column width persistence**: debounce `onResize` persistence and store widths in percentages for easier server serialization.
- **Max columns rule**: surface a visual hint when `MAX_COLUMNS` is reached instead of silent disable; allow configurable max.
- **Performance**: memoize heavy subtrees (`DroppableRow`, `ResizableColumn`) with stable props to reduce re-render on hover/drag.
- **Testing**: add interaction tests for drop indicator accuracy and resize constraints to avoid regressions.

## Quick Mental Model

- Data lives in Redux (`slidesSlice`).
- `SlideCard` renders that data into nested droppables/draggables.
- `useEditorDnd` decides what a drop means and calls `commandBus`/dispatch.
- Visual affordances (hover, outlines, drop lines) are local UI state; mutations are centralized.

Use this map when adding new block types, changing drop logic, or enhancing row/column controls.
