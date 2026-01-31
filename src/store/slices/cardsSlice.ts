import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";
import undoable, { excludeAction, StateWithHistory } from "redux-undo";
import type { RootState } from "@/store";
import {
  Block,
  BlockType,
  BlockContent,
  DocInfo,
  Row,
  Card,
  CardAccent,
  Theme,
  BLOCK_TYPES,
  MAX_BLOCKS_PER_ROW,
} from "@/types/docs";
import { BLOCK_DEFINITIONS } from "@/app/(app)/(protected)/docs/[id]/engine/registry/block-definitions";

import {
  createBlockInstance,
  createRow,
  createRowWithColumns,
  createCard,
} from "@/app/(app)/(protected)/docs/[id]/engine/registry/factories";
import {
  findCard,
  findRow,
  findBlock,
  recalculateWidths,
  ensureRowExists,
} from "../utils/sliceHelpers";

export interface CardsState {
  cards: Card[];
  activeCardId: string | null;
  theme: Theme;
  doc: DocInfo | null;
}

// --- Initial State ---
export const DEFAULT_THEME: Theme = {
  primary: "#2B0AFF",
  secondaryColors: ["#FF4D00", "#00C2FF"],
  headingColor: "#000000",
  bodyColor: "#272525",
  cardBackground: "#FFFFFF",
  pageBackground: "#F9FAFB",
  fontFamily: "Space Grotesk",
  themeType: "light",
  cardDesignPattern: "none",
  borderColor: "#2B0AFF15",
  cardBorderRadius: "12px",
  cardBoxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
  cardBorderWidth: "1px",
  cardBorderStyle: "solid",
  cardBackdropBlur: "0px",
  cardDesignPatternOpacity: 1,
  cardOpacity: 1,
};
const initialTheme: Theme = DEFAULT_THEME;

const initialState: CardsState = {
  cards: [],
  activeCardId: null,
  theme: initialTheme,
  doc: null,
};

// --- Slice ---
const cardsSlice = createSlice({
  name: "cards",
  initialState,
  reducers: {
    // Card actions
    setActiveCard: (state, action: PayloadAction<string>) => {
      state.activeCardId = action.payload;
    },
    addCard: (
      state,
      action: PayloadAction<{
        afterCardId?: string;
        id?: string;
        card?: { rows: Row[]; accent?: CardAccent };
      }>
    ) => {
      let newCard: Card;

      if (action.payload.card) {
        newCard = {
          id: action.payload.id || nanoid(),
          rows: action.payload.card.rows,
          accent: action.payload.card.accent,
        };
      } else {
        newCard = createCard();
        if (action.payload.id) {
          newCard.id = action.payload.id;
        }
      }

      if (action.payload.afterCardId) {
        const index = state.cards.findIndex(
          (c) => c.id === action.payload.afterCardId
        );
        state.cards.splice(index + 1, 0, newCard);
      } else {
        state.cards.push(newCard);
      }
      state.activeCardId = newCard.id;
    },
    deleteCard: (state, action: PayloadAction<string>) => {
      if (state.cards.length <= 1) return;
      const index = state.cards.findIndex((c) => c.id === action.payload);
      state.cards = state.cards.filter((c) => c.id !== action.payload);
      if (state.activeCardId === action.payload) {
        state.activeCardId = state.cards[Math.max(0, index - 1)]?.id || null;
      }
    },
    duplicateCard: (state, action: PayloadAction<string>) => {
      const card = state.cards.find((c) => c.id === action.payload);
      if (!card) return;
      const duplicated: Card = JSON.parse(JSON.stringify(card));
      duplicated.id = nanoid();
      duplicated.rows.forEach((row) => {
        row.id = nanoid();
        // Preserve column widths if they exist, otherwise initialize to equal fractional units
        if (!row.columnWidths && row.blocks.length > 0) {
          row.columnWidths = row.blocks.map(() => 1);
        }
        row.blocks.forEach((block) => {
          block.id = nanoid();
        });
      });
      const index = state.cards.findIndex((c) => c.id === action.payload);
      state.cards.splice(index + 1, 0, duplicated);
      state.activeCardId = duplicated.id;
    },
    reorderCards: (
      state,
      action: PayloadAction<{ cardId: string; newIndex: number }>
    ) => {
      const { cardId, newIndex } = action.payload;
      const oldIndex = state.cards.findIndex((c) => c.id === cardId);
      if (oldIndex === -1) return;
      const [removed] = state.cards.splice(oldIndex, 1);
      state.cards.splice(newIndex, 0, removed);
    },
    setCards: (state, action: PayloadAction<Card[]>) => {
      state.cards = action.payload;
      if (!state.cards.find((c) => c.id === state.activeCardId)) {
        state.activeCardId = state.cards[0]?.id || null;
      }
    },
    updateCardId: (
      state,
      action: PayloadAction<{ oldId: string; newId: string }>
    ) => {
      const { oldId, newId } = action.payload;
      const cardIndex = state.cards.findIndex((c) => c.id === oldId);
      if (cardIndex !== -1) {
        state.cards[cardIndex].id = newId;
        // Update activeCardId if it was the old ID
        if (state.activeCardId === oldId) {
          state.activeCardId = newId;
        }
      }
    },
    replaceCardWithServerData: (
      state,
      action: PayloadAction<{ clientId: string; serverCard: Card }>
    ) => {
      const { clientId, serverCard } = action.payload;
      const cardIndex = state.cards.findIndex((c) => c.id === clientId);
      if (cardIndex !== -1) {
        const currentCard = state.cards[cardIndex];

        // Preserve normalized content if server data has empty blocks
        // Check if server card has empty blocks but current card has valid content
        const serverHasEmptyBlocks = serverCard.rows.some((row) =>
          row.blocks.some(
            (block) =>
              !block.content ||
              (typeof block.content === "object" &&
                Object.keys(block.content).length === 0)
          )
        );
        const currentHasValidContent = currentCard.rows.some((row) =>
          row.blocks.some(
            (block) =>
              block.content &&
              (typeof block.content === "string" ||
                (typeof block.content === "object" &&
                  "type" in block.content &&
                  block.content.type === "doc"))
          )
        );

        if (serverHasEmptyBlocks && currentHasValidContent) {
          // Preserve current card's rows (with normalized content) and accent if present
          // but update ID and other metadata from server
          state.cards[cardIndex] = {
            ...serverCard,
            rows: currentCard.rows, // Keep the normalized rows
            accent: currentCard.accent || serverCard.accent, // Preserve current accent if it exists, otherwise use server's
          };
        } else {
          // Replace the client-side card with server-side card
          // But preserve accent if current card has one and server doesn't
          if (currentCard.accent && !serverCard.accent) {
            state.cards[cardIndex] = {
              ...serverCard,
              accent: currentCard.accent,
            };
          } else {
            state.cards[cardIndex] = serverCard;
          }
        }
        // Update activeCardId if it was the client ID
        if (state.activeCardId === clientId) {
          state.activeCardId = serverCard.id;
        }
      }
    },

    // Row actions (within active card)
    updateBlockContent: (
      state,
      action: PayloadAction<{ cardId: string; blockId: string; content: any }>
    ) => {
      const { cardId, blockId, content } = action.payload;
      const card = state.cards.find((c) => c.id === cardId);
      if (!card) return;
      for (const row of card.rows) {
        const block = row.blocks.find((b) => b.id === blockId);
        if (block) {
          block.content = content;
          break;
        }
      }
    },
    addBlockToRow: (
      state,
      action: PayloadAction<{
        cardId: string;
        rowId: string;
        afterBlockId?: string;
        insertIndex?: number;
        blockType?: string;
        initialContent?: any;
      }>
    ) => {
      const {
        cardId,
        rowId,
        afterBlockId,
        insertIndex,
        blockType,
        initialContent,
      } = action.payload;
      const card = findCard(state, cardId);
      const row = findRow(card, rowId);
      if (!row || !card) return;

      // If row already has 3 blocks, create a new row below it with the same block type
      if (row.blocks.length >= MAX_BLOCKS_PER_ROW) {
        const newBlock = createBlockInstance(blockType as any, initialContent);
        const newRow = createRow([newBlock]);
        const rowIndex = card.rows.findIndex((r) => r.id === rowId);
        card.rows.splice(rowIndex + 1, 0, newRow);
        return;
      }

      const newBlock = createBlockInstance(blockType as any, initialContent);

      if (typeof insertIndex === "number") {
        // Explicit index insertion
        const targetIndex = Math.max(
          0,
          Math.min(insertIndex, row.blocks.length)
        );
        row.blocks.splice(targetIndex, 0, newBlock);
      } else if (afterBlockId) {
        const index = row.blocks.findIndex((b) => b.id === afterBlockId);
        if (index !== -1) {
          row.blocks.splice(index + 1, 0, newBlock);
        } else {
          // If afterBlockId not found, append to end
          row.blocks.push(newBlock);
        }
      } else {
        // No positioning specified, append to end
        row.blocks.push(newBlock);
      }

      // Recalculate column widths to be equal (fractional units for CSS Grid)
      row.columnWidths = row.blocks.map(() => 1);
    },
    addRow: (
      state,
      action: PayloadAction<{
        cardId: string;
        insertAt: "top" | "bottom" | number;
        columnCount?: number;
        blockType?: string;
        initialContent?: any;
      }>
    ) => {
      const {
        cardId,
        insertAt,
        columnCount = 1,
        blockType,
        initialContent,
      } = action.payload;
      const card = findCard(state, cardId);
      if (!card) return;

      const newRow = createRowWithColumns(
        columnCount,
        blockType as any,
        initialContent
      );

      if (insertAt === "top") {
        card.rows.unshift(newRow);
      } else if (insertAt === "bottom") {
        card.rows.push(newRow);
      } else if (typeof insertAt === "number") {
        const targetIndex = Math.max(0, Math.min(insertAt, card.rows.length));
        card.rows.splice(targetIndex, 0, newRow);
      }
    },
    // Keep backward compatible aliases
    addRowToCard: (
      state,
      action: PayloadAction<{ cardId: string; afterRowId: string }>
    ) => {
      const { cardId, afterRowId } = action.payload;
      const card = findCard(state, cardId);
      if (!card) return;
      const index = card.rows.findIndex((r) => r.id === afterRowId);
      card.rows.splice(index + 1, 0, createRow());
    },
    addRowWithColumns: (
      state,
      action: PayloadAction<{
        cardId: string;
        columnCount: number;
        blockType?: string;
      }>
    ) => {
      const { cardId, columnCount, blockType } = action.payload;
      const card = findCard(state, cardId);
      if (!card) return;
      card.rows.push(createRowWithColumns(columnCount, blockType as any));
    },
    addRowWithColumnsAtIndex: (
      state,
      action: PayloadAction<{
        cardId: string;
        columnCount: number;
        insertIndex: number;
        blockType?: string;
        initialContent?: any;
      }>
    ) => {
      const { cardId, columnCount, insertIndex, blockType, initialContent } =
        action.payload;
      const card = findCard(state, cardId);
      if (!card) return;
      const newRow = createRowWithColumns(
        columnCount,
        blockType as any,
        initialContent
      );
      const targetIndex = Math.max(0, Math.min(insertIndex, card.rows.length));
      card.rows.splice(targetIndex, 0, newRow);
    },
    addRowAtTop: (
      state,
      action: PayloadAction<{ cardId: string; columnCount?: number }>
    ) => {
      const { cardId, columnCount = 1 } = action.payload;
      const card = findCard(state, cardId);
      if (!card) return;
      card.rows.unshift(createRowWithColumns(columnCount));
    },
    deleteRow: (
      state,
      action: PayloadAction<{ cardId: string; rowId: string }>
    ) => {
      const { cardId, rowId } = action.payload;
      const card = findCard(state, cardId);
      if (!card || card.rows.length <= 1) return;
      card.rows = card.rows.filter((r) => r.id !== rowId);
    },
    setCardRows: (
      state,
      action: PayloadAction<{ cardId: string; rows: Row[] }>
    ) => {
      const card = findCard(state, action.payload.cardId);
      if (card) {
        card.rows = action.payload.rows;
      }
    },
    replaceCardWithLayout: (
      state,
      action: PayloadAction<{
        cardId: string;
        rows: Row[];
        accent?: CardAccent;
      }>
    ) => {
      const card = findCard(state, action.payload.cardId);
      if (card) {
        // Normalize block content when applying layout
        // Generate new IDs for rows and blocks to avoid conflicts
        const normalizedRows = action.payload.rows.map((row) => ({
          ...row,
          id: row.id || nanoid(), // Ensure row has an ID
          blocks: row.blocks.map((block) => {
            // Generate new block ID to avoid conflicts with existing blocks
            const newBlockId = nanoid();
            const blockDef = BLOCK_DEFINITIONS[block.type as BlockType];
            if (blockDef && blockDef.normalizeContent) {
              const normalized = blockDef.normalizeContent(block.content);
              return {
                ...block,
                id: newBlockId, // Use new ID
                content: normalized,
              };
            }
            return {
              ...block,
              id: newBlockId, // Use new ID even if not normalized
            };
          }),
        }));

        card.rows = normalizedRows;
        // Apply accent if provided by template
        if (action.payload.accent) {
          card.accent = action.payload.accent;
        }
        state.activeCardId = card.id;
      }
    },
    repositionBlock: (
      state,
      action: PayloadAction<{
        cardId: string;
        sourceRowId: string;
        blockId: string;
        target: {
          rowId?: string;
          insertIndex?: number;
          createNewRow?: boolean;
          targetBlockId?: string;
        };
      }>
    ) => {
      const { cardId, sourceRowId, blockId, target } = action.payload;
      const card = findCard(state, cardId);
      if (!card) return;

      const sourceRow = findRow(card, sourceRowId);
      if (!sourceRow) return;

      const blockIndex = sourceRow.blocks.findIndex((b) => b.id === blockId);
      if (blockIndex === -1) return;

      // 1. Extract block and its width
      const [movedBlock] = sourceRow.blocks.splice(blockIndex, 1);
      let movedWidth = 1;
      if (
        sourceRow.columnWidths &&
        sourceRow.columnWidths.length > blockIndex
      ) {
        [movedWidth] = sourceRow.columnWidths.splice(blockIndex, 1);
      }

      // Cleanup source row widths if it still has blocks
      if (sourceRow.blocks.length > 0) {
        // If we didn't have widths or they got out of sync, reset them
        if (
          !sourceRow.columnWidths ||
          sourceRow.columnWidths.length !== sourceRow.blocks.length
        ) {
          recalculateWidths(sourceRow);
        }
      }

      // 2. Handle Target
      if (target.createNewRow) {
        const newRow = createRow([movedBlock]);
        let insertIndex = target.insertIndex ?? card.rows.length;

        // Clean up source row if empty before inserting new one to avoid index shifts
        if (sourceRow.blocks.length === 0) {
          const sourceRowIndex = card.rows.findIndex(
            (r) => r.id === sourceRowId
          );
          card.rows.splice(sourceRowIndex, 1);
          if (sourceRowIndex < insertIndex) {
            insertIndex = Math.max(0, insertIndex - 1);
          }
        }

        const finalInsertIndex = Math.max(
          0,
          Math.min(insertIndex, card.rows.length)
        );
        card.rows.splice(finalInsertIndex, 0, newRow);
      } else if (target.rowId) {
        const targetRow = findRow(card, target.rowId);
        if (!targetRow) {
          // Fallback or error: if target row not found, put it back or handle gracefully
          sourceRow.blocks.splice(blockIndex, 0, movedBlock);
          recalculateWidths(sourceRow);
          return;
        }

        let finalInsertIndex: number;
        if (typeof target.insertIndex === "number") {
          finalInsertIndex = Math.max(
            0,
            Math.min(target.insertIndex, targetRow.blocks.length)
          );
        } else if (target.targetBlockId) {
          const idx = targetRow.blocks.findIndex(
            (b) => b.id === target.targetBlockId
          );
          finalInsertIndex = idx === -1 ? targetRow.blocks.length : idx;
        } else {
          finalInsertIndex = targetRow.blocks.length;
        }

        targetRow.blocks.splice(finalInsertIndex, 0, movedBlock);

        // Handle widths for target row
        if (!targetRow.columnWidths) {
          recalculateWidths(targetRow);
        } else {
          targetRow.columnWidths.splice(finalInsertIndex, 0, movedWidth);
        }

        // Clean up empty rows
        card.rows = card.rows.filter((r) => r.blocks.length > 0);
        ensureRowExists(card, createRow);
      }

      // Ensure some row exists
      ensureRowExists(card, createRow);
    },

    // Legacy move actions (can be deprecated eventually)
    moveBlock: (
      state,
      action: PayloadAction<{
        cardId: string;
        sourceRowId: string;
        targetRowId: string;
        blockId: string;
        targetBlockId?: string;
      }>
    ) => {
      const { cardId, sourceRowId, targetRowId, blockId, targetBlockId } =
        action.payload;
      const card = findCard(state, cardId);
      if (!card) return;

      const sourceRow = findRow(card, sourceRowId);
      const targetRow = findRow(card, targetRowId);
      if (!sourceRow || !targetRow) return;

      const blockIndex = sourceRow.blocks.findIndex((b) => b.id === blockId);
      if (blockIndex === -1) return;

      // Extract
      const [movedBlock] = sourceRow.blocks.splice(blockIndex, 1);

      // Target index
      let targetIndex = targetRow.blocks.length;
      if (targetBlockId) {
        const idx = targetRow.blocks.findIndex((b) => b.id === targetBlockId);
        if (idx !== -1) {
          targetIndex =
            sourceRowId === targetRowId && blockIndex < idx ? idx - 1 : idx;
        }
      }

      targetRow.blocks.splice(targetIndex, 0, movedBlock);

      // Recalculate
      recalculateWidths(sourceRow);
      recalculateWidths(targetRow);

      // Clean up
      card.rows = card.rows.filter((r) => r.blocks.length > 0);
      ensureRowExists(card, createRow);
    },
    setTheme: (state, action: PayloadAction<Partial<Theme>>) => {
      state.theme = { ...state.theme, ...action.payload };
    },
    resetTheme: (state) => {
      state.theme = initialTheme;
    },
    setDoc: (state, action: PayloadAction<DocInfo>) => {
      state.doc = action.payload;
    },
    updateDocTitle: (state, action: PayloadAction<string>) => {
      if (state.doc) {
        state.doc.title = action.payload;
      }
    },
    reorderBlocksInRow: (
      state,
      action: PayloadAction<{
        cardId: string;
        rowId: string;
        oldIndex: number;
        newIndex: number;
      }>
    ) => {
      const { cardId, rowId, oldIndex, newIndex } = action.payload;
      const card = findCard(state, cardId);
      if (!card) return;
      const row = findRow(card, rowId);
      if (!row) return;

      if (oldIndex < 0 || oldIndex >= row.blocks.length) return;
      if (newIndex < 0 || newIndex > row.blocks.length) return;
      if (oldIndex === newIndex) return;

      const [movedBlock] = row.blocks.splice(oldIndex, 1);
      let movedWidth = 1;
      if (row.columnWidths && row.columnWidths.length > oldIndex) {
        [movedWidth] = row.columnWidths.splice(oldIndex, 1);
      }

      const adjustedNewIndex = oldIndex < newIndex ? newIndex - 1 : newIndex;
      const finalIndex = Math.max(
        0,
        Math.min(adjustedNewIndex, row.blocks.length)
      );

      row.blocks.splice(finalIndex, 0, movedBlock);

      if (row.columnWidths) {
        row.columnWidths.splice(finalIndex, 0, movedWidth);
      } else {
        recalculateWidths(row);
      }
    },
    updateColumnWidths: (
      state,
      action: PayloadAction<{
        cardId: string;
        rowId: string;
        columnWidths: number[];
      }>
    ) => {
      const { cardId, rowId, columnWidths } = action.payload;
      const card = findCard(state, cardId);
      if (!card) return;
      const row = findRow(card, rowId);
      if (row) {
        row.columnWidths = columnWidths;
      }
    },

    // Block actions
    duplicateBlock: (
      state,
      action: PayloadAction<{
        cardId: string;
        rowId: string;
        blockId: string;
      }>
    ) => {
      const { cardId, rowId, blockId } = action.payload;
      const card = findCard(state, cardId);
      if (!card) return;
      const row = findRow(card, rowId);
      if (!row) return;

      const blockIndex = row.blocks.findIndex((b) => b.id === blockId);
      if (blockIndex === -1) return;

      const originalBlock = row.blocks[blockIndex];
      const duplicatedBlock: Block = JSON.parse(JSON.stringify(originalBlock));
      duplicatedBlock.id = nanoid();

      row.blocks.splice(blockIndex + 1, 0, duplicatedBlock);
      recalculateWidths(row);
    },

    deleteBlock: (
      state,
      action: PayloadAction<{
        cardId: string;
        rowId: string;
        blockId: string;
      }>
    ) => {
      const { cardId, rowId, blockId } = action.payload;
      const card = findCard(state, cardId);
      if (!card) return;
      const row = findRow(card, rowId);
      if (!row) return;

      row.blocks = row.blocks.filter((b) => b.id !== blockId);
      recalculateWidths(row);

      card.rows = card.rows.filter((r) => r.blocks.length > 0);
      ensureRowExists(card, createRow);
    },

    transformBlock: (
      state,
      action: PayloadAction<{
        cardId: string;
        rowId: string;
        blockId: string;
        newType: BlockType;
      }>
    ) => {
      const { cardId, rowId, blockId, newType } = action.payload;
      const card = findCard(state, cardId);
      if (!card) return;
      const row = findRow(card, rowId);
      const block = findBlock(row, blockId);
      if (!block) return;

      block.type = newType;
      const definition =
        BLOCK_DEFINITIONS[newType] ||
        BLOCK_DEFINITIONS[BLOCK_TYPES.PROSEMIRROR];
      block.content = definition.createContent();
    },
    moveBlockToNewRow: (
      state,
      action: PayloadAction<{
        cardId: string;
        sourceRowId: string;
        blockId: string;
        insertIndex: number;
      }>
    ) => {
      const { cardId, sourceRowId, blockId, insertIndex } = action.payload;
      const card = findCard(state, cardId);
      if (!card) return;

      const sourceRow = findRow(card, sourceRowId);
      if (!sourceRow) return;

      const blockIndex = sourceRow.blocks.findIndex((b) => b.id === blockId);
      if (blockIndex === -1) return;

      const [movedBlock] = sourceRow.blocks.splice(blockIndex, 1);
      recalculateWidths(sourceRow);

      let targetIndex = Math.max(0, Math.min(insertIndex, card.rows.length));

      // Clean up source row if empty
      if (sourceRow.blocks.length === 0) {
        const sourceRowIndex = card.rows.findIndex(
          (r) => r.id === sourceRowId
        );
        card.rows.splice(sourceRowIndex, 1);
        if (sourceRowIndex < targetIndex) {
          targetIndex = Math.max(0, targetIndex - 1);
        }
      }

      const newRow = createRow([movedBlock]);
      card.rows.splice(targetIndex, 0, newRow);
      ensureRowExists(card, createRow);
    },

    // Card Accent actions
    toggleCardAccent: (state, action: PayloadAction<{ cardId: string }>) => {
      const card = findCard(state, action.payload.cardId);
      if (!card) return;

      if (card.accent) {
        delete card.accent;
      } else {
        card.accent = {
          position: "left",
          size: 40,
          imageUrl: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop",
        };
      }
    },
    updateCardAccent: (
      state,
      action: PayloadAction<{
        cardId: string;
        update: {
          imageUrl?: string;
          imageQuery?: string;
          position?: "left" | "right" | "top" | "bottom" | "background";
        };
      }>
    ) => {
      const card = findCard(state, action.payload.cardId);
      if (!card || !card.accent) return;

      card.accent = { ...card.accent, ...action.payload.update };
    },
    setCardAccentSize: (
      state,
      action: PayloadAction<{ cardId: string; size: number }>
    ) => {
      const card = findCard(state, action.payload.cardId);
      if (!card || !card.accent) return;

      card.accent.size = Math.max(5, Math.min(100, action.payload.size));
    },
  },
});

export const {
  setActiveCard,
  addCard,
  deleteCard,
  duplicateCard,
  reorderCards,
  setCards,
  updateCardId,
  replaceCardWithServerData,
  updateBlockContent,
  addBlockToRow,
  addRow,
  addRowToCard,
  deleteRow,
  addRowWithColumns,
  addRowWithColumnsAtIndex,
  addRowAtTop,
  setCardRows,
  replaceCardWithLayout,
  repositionBlock,
  moveBlock,
  moveBlockToNewRow,
  reorderBlocksInRow,
  updateColumnWidths,
  duplicateBlock,
  deleteBlock,
  transformBlock,
  setTheme,
  resetTheme,
  setDoc,
  updateDocTitle,
  toggleCardAccent,
  updateCardAccent,
  setCardAccentSize,
} = cardsSlice.actions;

export type { Block, Row, Card, Theme, DocInfo, CardAccent };

const undoableCardsReducer = undoable(cardsSlice.reducer, {
  limit: 50,
  filter: excludeAction([
    "cards/setActiveCard",
    "cards/setTheme",
    "cards/resetTheme",
    "cards/setDoc",
    "cards/updateDocTitle",
    "cards/setCards",
    "cards/replaceCardWithServerData",
  ]),
  groupBy: (action) => {
    if (action.type === "cards/updateBlockContent") {
      const payload = action.payload as { blockId: string };
      return `updateBlockContent-${payload.blockId}`;
    }
    return null;
  },
  syncFilter: true,
});

export default undoableCardsReducer;

export type UndoableCardsState = StateWithHistory<CardsState>;

export const selectCardsState = (state: RootState) => state.cards.present;
export const selectCards = (state: RootState) => state.cards.present.cards;
export const selectActiveCardId = (state: RootState) =>
  state.cards.present.activeCardId;
export const selectActiveCard = (state: RootState) =>
  state.cards.present.cards.find(
    (c) => c.id === state.cards.present.activeCardId
  ) || null;
export const selectTheme = (state: RootState) => state.cards.present.theme;
export const selectDoc = (state: RootState) =>
  state.cards.present.doc;

export const selectCanUndo = (state: RootState) => state.cards.past.length > 0;
export const selectCanRedo = (state: RootState) =>
  state.cards.future.length > 0;
