"use client";

import { useEffect, useMemo, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  DEFAULT_THEME,
  selectActiveCardId,
  selectCards,
  selectTheme,
  setDoc,
  setCards,
  setTheme,
} from "@/store/slices/cardsSlice";
import { convertApiCardToRedux } from "@/lib/editor/adapters";
import { createEditorCommandBus } from "@/lib/editor/commands";
import { useDoc } from "@/hooks/use-docs";
import { useEditorDnd } from "./useEditorDnd";
import { useCardGeneration } from "./useCardGeneration";
import { setDocIdForSync } from "@/store/middleware/cardSyncMiddleware";
import { useCardActions } from "./useCardActions";
import { detectRowBlockType } from "@/app/(app)/(protected)/docs/[id]/editor/blocks/utils";

interface UseEditorPageParams {
  docId: string | null;
  outlineId?: string | null;
}

export const useEditorPage = ({ docId }: UseEditorPageParams) => {
  const dispatch = useAppDispatch();

  const cards = useAppSelector(selectCards);
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const activeCardId = useAppSelector(selectActiveCardId);
  const cardsRef = useRef(cards);

  useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);

  // --- Sub-Hooks (The Logic Layers) ---
  const { data: docResponse, isLoading: isLoadingDoc } = useDoc(docId);

  // 1. Generation Logic
  const { isGenerating, progress, startGeneration, generationSpeed } =
    useCardGeneration({
      cardsRef,
    });

  // 2. Sync Logic (Middleware-based auto-save)
  // Set docId for the middleware to enable syncing
  useEffect(() => {
    setDocIdForSync(docId);
    return () => {
      // Cleanup: disable syncing when leaving the page
      setDocIdForSync(null);
    };
  }, [docId]);

  // 4. Card Actions (Add/Delete)
  const { handleAddCard, handleDeleteCard } = useCardActions(docId);

  const commandBus = useMemo(
    () => createEditorCommandBus(dispatch),
    [dispatch]
  );

  // 3. Interaction Logic (DnD)
  const dnd = useEditorDnd({ cards: cards, commandBus });

  // --- Initialization Logic ---
  const hasLoaded = useRef(false);

  // Load doc from DB
  useEffect(() => {
    if (docResponse?.success && docResponse.data && !hasLoaded.current) {
      const apiCards = docResponse.data.cards || [];

      // Only load cards that have actual data (rows). Cards with only outline data
      // will be added later when generation completes
      const cardsWithData = apiCards.filter(
        (c: any) =>
          c.data?.rows && Array.isArray(c.data.rows) && c.data.rows.length > 0
      );

      const reduxCards = [...cardsWithData]
        .sort((a: any, b: any) => a.order - b.order)
        .map(convertApiCardToRedux);

      dispatch(setCards(reduxCards));
      if (docResponse.data.globalTheme) {
        dispatch(setTheme(docResponse.data.globalTheme as any));
      }
      dispatch(setDoc(docResponse.data as any));

      hasLoaded.current = true;
    }
  }, [docResponse, dispatch]);

  // Track if we've already triggered generation to prevent re-triggering
  const hasTriggeredGeneration = useRef(false);
  const lastDocIdRef = useRef<string | null>(null);

  // Reset trigger flag when docId changes (new doc loaded)
  useEffect(() => {
    if (docId !== lastDocIdRef.current) {
      hasTriggeredGeneration.current = false;
      lastDocIdRef.current = docId;
    }
  }, [docId]);

  // Auto-trigger card generation when cards with outline data appear
  useEffect(() => {
    if (!docResponse?.success || !docResponse.data || !docId || isGenerating)
      return;

    // First check: If Redux already has cards with actual row data,
    // generation has already completed - don't re-trigger
    const reduxHasCardsWithData = cards.some(
      (c) => c.rows && Array.isArray(c.rows) && c.rows.length > 0
    );
    
    if (reduxHasCardsWithData) {
      hasTriggeredGeneration.current = false;
      return;
    }

    const apiCards = docResponse.data.cards || [];
    const hasCardsWithOutlineButNoData = apiCards.some(
      (c: any) =>
        c.outline && (!c.data || !c.data.rows || c.data.rows.length === 0)
    );
    const hasCardsWithData = apiCards.some(
      (c: any) => c.data && c.data.rows && c.data.rows.length > 0
    );
    const outlineCompleted = docResponse.data.outlineStatus === "completed";

    // If API cards have data, generation is complete - reset flag and don't trigger
    if (hasCardsWithData) {
      hasTriggeredGeneration.current = false;
      return;
    }

    // Only trigger if we haven't already triggered and conditions are met
    if (
      hasCardsWithOutlineButNoData &&
      outlineCompleted &&
      !hasTriggeredGeneration.current
    ) {
      hasTriggeredGeneration.current = true;
      startGeneration(docId);
    }
  }, [docResponse, docId, isGenerating, startGeneration, cards]);

  // --- Action Handlers ---
  const handleUpdateBlock = (cardId: string, blockId: string, content: any) =>
    commandBus.updateBlock({ cardId, blockId, content });

  const handleDeleteRow = (cardId: string, rowId: string) =>
    commandBus.deleteRow({ cardId, rowId });

  const handleAddColumn = (
    cardId: string,
    rowId: string,
    afterBlockId: string
  ) => {
    const card = cards.find((c) => c.id === cardId);
    const row = card?.rows.find((r) => r.id === rowId);
    const blockType = row ? detectRowBlockType(row) : undefined;
    commandBus.addBlockAfter({ cardId, rowId, afterBlockId, blockType });
  };

  const handleAddRowAtTop = (cardId: string) =>
    commandBus.addRowAtTop({ cardId, columnCount: 1 });

  const handleAddRowAtBottom = (cardId: string) =>
    commandBus.addRowWithColumns({
      cardId,
      columnCount: 1,
      blockType: "prosemirror",
    });

  const handleUpdateColumnWidths = (
    cardId: string,
    rowId: string,
    columnWidths: number[]
  ) => commandBus.updateColumnWidths({ cardId, rowId, columnWidths });

  const handleAddCardAtOrder = (afterCardId?: string, initialData?: any) =>
    handleAddCard(afterCardId, initialData);

  return {
    // state
    cards,
    theme,
    activeCardId,
    isGeneratingCards: isGenerating,
    cardGenerationProgress: progress,
    cardGenerationSpeed: generationSpeed,
    isLoadingDoc,
    docId,

    // dnd
    ...dnd,

    // actions
    handleUpdateBlock,
    handleDeleteRow,
    handleAddColumn,
    handleAddRowAtTop,
    handleAddRowAtBottom,
    handleUpdateColumnWidths,
    handleAddCard: handleAddCardAtOrder,
    handleDeleteCard: handleDeleteCard,

    // internals
    commandBus,
  };
};
