import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  useMemo,
} from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectCards } from "@/store/slices/cardsSlice";
import type { Block, Row, Card } from "@/types/docs";

interface BlockPosition {
  cardId: string;
  rowId: string;
  blockId: string;
  cardIndex: number;
  rowIndex: number;
  blockIndex: number;
}

interface BlockSelectionContextValue {
  focusedBlockId: string | null;
  focusedCardId: string | null;
  focusedPosition: BlockPosition | null;
  setFocusedBlock: (cardId: string | null, blockId: string | null) => void;
  navigateUp: () => void;
  navigateDown: () => void;
  navigateLeft: () => void;
  navigateRight: () => void;
  canNavigateUp: boolean;
  canNavigateDown: boolean;
  canNavigateLeft: boolean;
  canNavigateRight: boolean;
  getAllBlockPositions: () => BlockPosition[];
}

const BlockSelectionContext = createContext<BlockSelectionContextValue | null>(null);

// Default no-op context for components rendered outside the provider (e.g., mini previews)
const noOpContext: BlockSelectionContextValue = {
  focusedBlockId: null,
  focusedCardId: null,
  focusedPosition: null,
  setFocusedBlock: () => {},
  navigateUp: () => {},
  navigateDown: () => {},
  navigateLeft: () => {},
  navigateRight: () => {},
  canNavigateUp: false,
  canNavigateDown: false,
  canNavigateLeft: false,
  canNavigateRight: false,
  getAllBlockPositions: () => [],
};

export const useBlockFocus = () => {
  const context = useContext(BlockSelectionContext);
  // Return no-op context if used outside provider (e.g., in sidebar mini previews)
  if (!context) {
    return noOpContext;
  }
  return context;
};

interface BlockSelectionProviderProps {
  children: React.ReactNode;
  onNavigate?: (position: BlockPosition) => void;
}

export const BlockSelectionProvider: React.FC<BlockSelectionProviderProps> = ({
  children,
  onNavigate,
}) => {
  const cards = useAppSelector(selectCards);
  const [focusedCardId, setFocusedCardId] = useState<string | null>(null);
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);

  // Build a flat list of all block positions for navigation
  const getAllBlockPositions = useCallback((): BlockPosition[] => {
    const positions: BlockPosition[] = [];
    cards.forEach((card, cardIndex) => {
      card.rows.forEach((row, rowIndex) => {
        row.blocks.forEach((block, blockIndex) => {
          positions.push({
            cardId: card.id,
            rowId: row.id,
            blockId: block.id,
            cardIndex,
            rowIndex,
            blockIndex,
          });
        });
      });
    });
    return positions;
  }, [cards]);

  // Get current focused position
  const focusedPosition = useMemo((): BlockPosition | null => {
    if (!focusedBlockId || !focusedCardId) return null;
    const positions = getAllBlockPositions();
    return positions.find((p) => p.blockId === focusedBlockId && p.cardId === focusedCardId) || null;
  }, [focusedBlockId, focusedCardId, getAllBlockPositions]);

  // Navigation capabilities
  const navigationState = useMemo(() => {
    if (!focusedPosition) {
      return {
        canNavigateUp: false,
        canNavigateDown: false,
        canNavigateLeft: false,
        canNavigateRight: false,
      };
    }

    const { cardIndex, rowIndex, blockIndex } = focusedPosition;
    const card = cards[cardIndex];
    const row = card?.rows[rowIndex];

    return {
      canNavigateUp: rowIndex > 0 || cardIndex > 0,
      canNavigateDown:
        rowIndex < (card?.rows.length || 0) - 1 ||
        cardIndex < cards.length - 1,
      canNavigateLeft: blockIndex > 0,
      canNavigateRight: blockIndex < (row?.blocks.length || 0) - 1,
    };
  }, [focusedPosition, cards]);

  const setFocusedBlock = useCallback((cardId: string | null, blockId: string | null) => {
    setFocusedCardId(cardId);
    setFocusedBlockId(blockId);
  }, []);

  // Navigate to adjacent block in same row (left/right)
  const navigateLeft = useCallback(() => {
    if (!focusedPosition || !navigationState.canNavigateLeft) return;
    const { cardIndex, rowIndex, blockIndex } = focusedPosition;
    const card = cards[cardIndex];
    const row = card?.rows[rowIndex];
    if (row && blockIndex > 0) {
      const newBlock = row.blocks[blockIndex - 1];
      setFocusedBlockId(newBlock.id);
      onNavigate?.({
        ...focusedPosition,
        blockId: newBlock.id,
        blockIndex: blockIndex - 1,
      });
    }
  }, [focusedPosition, navigationState.canNavigateLeft, cards, onNavigate]);

  const navigateRight = useCallback(() => {
    if (!focusedPosition || !navigationState.canNavigateRight) return;
    const { cardIndex, rowIndex, blockIndex } = focusedPosition;
    const card = cards[cardIndex];
    const row = card?.rows[rowIndex];
    if (row && blockIndex < row.blocks.length - 1) {
      const newBlock = row.blocks[blockIndex + 1];
      setFocusedBlockId(newBlock.id);
      onNavigate?.({
        ...focusedPosition,
        blockId: newBlock.id,
        blockIndex: blockIndex + 1,
      });
    }
  }, [focusedPosition, navigationState.canNavigateRight, cards, onNavigate]);

  // Navigate to block in adjacent row (up/down)
  const navigateUp = useCallback(() => {
    if (!focusedPosition || !navigationState.canNavigateUp) return;
    const { cardIndex, rowIndex, blockIndex } = focusedPosition;

    let newCardIndex = cardIndex;
    let newRowIndex = rowIndex - 1;

    // Move to previous card if at first row
    if (newRowIndex < 0) {
      if (cardIndex > 0) {
        newCardIndex = cardIndex - 1;
        newRowIndex = cards[newCardIndex].rows.length - 1;
      } else {
        return;
      }
    }

    const newCard = cards[newCardIndex];
    const newRow = newCard?.rows[newRowIndex];
    if (newRow) {
      // Try to maintain same block index, or use last block in row
      const newBlockIndex = Math.min(blockIndex, newRow.blocks.length - 1);
      const newBlock = newRow.blocks[newBlockIndex];
      setFocusedBlockId(newBlock.id);
      onNavigate?.({
        cardId: newCard.id,
        rowId: newRow.id,
        blockId: newBlock.id,
        cardIndex: newCardIndex,
        rowIndex: newRowIndex,
        blockIndex: newBlockIndex,
      });
    }
  }, [focusedPosition, navigationState.canNavigateUp, cards, onNavigate]);

  const navigateDown = useCallback(() => {
    if (!focusedPosition || !navigationState.canNavigateDown) return;
    const { cardIndex, rowIndex, blockIndex } = focusedPosition;
    const card = cards[cardIndex];

    let newCardIndex = cardIndex;
    let newRowIndex = rowIndex + 1;

    // Move to next card if at last row
    if (newRowIndex >= card.rows.length) {
      if (cardIndex < cards.length - 1) {
        newCardIndex = cardIndex + 1;
        newRowIndex = 0;
      } else {
        return;
      }
    }

    const newCard = cards[newCardIndex];
    const newRow = newCard?.rows[newRowIndex];
    if (newRow) {
      // Try to maintain same block index, or use last block in row
      const newBlockIndex = Math.min(blockIndex, newRow.blocks.length - 1);
      const newBlock = newRow.blocks[newBlockIndex];
      setFocusedBlockId(newBlock.id);
      onNavigate?.({
        cardId: newCard.id,
        rowId: newRow.id,
        blockId: newBlock.id,
        cardIndex: newCardIndex,
        rowIndex: newRowIndex,
        blockIndex: newBlockIndex,
      });
    }
  }, [focusedPosition, navigationState.canNavigateDown, cards, onNavigate]);

  // Global keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle navigation when a block is focused and not in an input/editor
      if (!focusedBlockId) return;
      
      const target = e.target as HTMLElement;
      const isInEditor =
        target.closest(".ProseMirror") ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;
      
      if (isInEditor) return;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          navigateUp();
          break;
        case "ArrowDown":
          e.preventDefault();
          navigateDown();
          break;
        case "ArrowLeft":
          e.preventDefault();
          navigateLeft();
          break;
        case "ArrowRight":
          e.preventDefault();
          navigateRight();
          break;
        case "Escape":
          setFocusedBlockId(null);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [focusedBlockId, navigateUp, navigateDown, navigateLeft, navigateRight]);

  const value = useMemo<BlockSelectionContextValue>(
    () => ({
      focusedCardId,
      focusedBlockId,
      focusedPosition,
      setFocusedBlock,
      navigateUp,
      navigateDown,
      navigateLeft,
      navigateRight,
      ...navigationState,
      getAllBlockPositions,
    }),
    [
      focusedCardId,
      focusedBlockId,
      focusedPosition,
      setFocusedBlock,
      navigateUp,
      navigateDown,
      navigateLeft,
      navigateRight,
      navigationState,
      getAllBlockPositions,
    ]
  );

  return (
    <BlockSelectionContext.Provider value={value}>
      {children}
    </BlockSelectionContext.Provider>
  );
};

