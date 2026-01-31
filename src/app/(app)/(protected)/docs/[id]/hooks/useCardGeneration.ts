"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { setCards, Card } from "@/store/slices/cardsSlice";
import { fetchCreditBalance } from "@/store/slices/subscriptionSlice";
import { generateAndCreateCards } from "@/services/docs";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import { parse as parsePartialJson } from "partial-json";

interface CardGenerationProgress {
  current: number;
  total: number;
  stage?: string;
  message?: string;
  estimatedSeconds?: number;
}

interface UseCardGenerationParams {
  cardsRef: React.MutableRefObject<Card[]>;
}

/**
 * Hook for managing card generation from outlines.
 * Handles streaming card generation with progress tracking,
 * partial JSON parsing, and auto-scrolling.
 */
export function useCardGeneration({ cardsRef }: UseCardGenerationParams) {
  const dispatch = useAppDispatch();

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<CardGenerationProgress | null>(null);
  const [generationSpeed, setGenerationSpeed] = useState(0);

  const lastContentLengthRef = useRef(0);
  const lastUpdateTimestampRef = useRef(0);
  const lastDispatchTimeRef = useRef(0); // Track last Redux dispatch time
  const pendingUpdateRef = useRef<Card[] | null>(null); // Store pending updates
  
  useEffect(() => {
    lastUpdateTimestampRef.current = Date.now();
  }, []);

  // Decay speed effect
  useEffect(() => {
    if (!isGenerating) {
      setTimeout(() => setGenerationSpeed(0), 0);
      return;
    }
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastUpdateTimestampRef.current > 150) {
        setGenerationSpeed((prev) => Math.max(0, prev * 0.8));
      }
    }, 100);
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Flush pending updates when generation stops
  useEffect(() => {
    if (!isGenerating && pendingUpdateRef.current) {
      dispatch(setCards(pendingUpdateRef.current));
      pendingUpdateRef.current = null;
    }
  }, [isGenerating, dispatch]);

  // Periodic flush of pending updates during streaming
  useEffect(() => {
    if (!isGenerating) return;
    
    const flushInterval = setInterval(() => {
      if (pendingUpdateRef.current) {
        dispatch(setCards(pendingUpdateRef.current));
        lastDispatchTimeRef.current = Date.now();
        pendingUpdateRef.current = null;
      }
    }, 200); // Flush every 200ms if there are pending updates
    
    return () => clearInterval(flushInterval);
  }, [isGenerating, dispatch]);

  /**
   * Handles individual chunks from the streaming SSE
   */
  const handleGenerationChunk = useCallback(
    (chunk: any) => {
      if (chunk.type === "start") {
        setProgress({
          current: 0,
          total: chunk.totalCards || 0,
          message: "Starting generation...",
        });
        setGenerationSpeed(0);
        lastContentLengthRef.current = 0;
        lastUpdateTimestampRef.current = Date.now();
        // dispatch(setCards([])); // Don't clear cards to allow appending/resuming
      } else if (chunk.type === "card-start") {
        lastContentLengthRef.current = 0; // Reset for new card
        setProgress({
          current: chunk.cardNumber || 0,
          total: chunk.totalCards || progress?.total || 0,
          stage: chunk.stage,
          estimatedSeconds: chunk.estimatedSeconds,
          message: `Starting card ${chunk.cardNumber}...`,
        });
      } else if (chunk.type === "card-progress") {
        setProgress((prev) => ({
          current: chunk.cardNumber || prev?.current || 0,
          total: prev?.total || chunk.totalCards || 0,
          stage: chunk.stage,
          message: chunk.message || "Processing...",
          estimatedSeconds: prev?.estimatedSeconds,
        }));
      } else if (chunk.type === "card-streaming") {
        if (chunk.accumulatedText && chunk.cardNumber) {
          // Speed calc
          const now = Date.now();
          const deltaChars =
            chunk.accumulatedText.length - lastContentLengthRef.current;
          const timeDiff = now - lastUpdateTimestampRef.current;

          if (timeDiff > 0 && deltaChars >= 0) {
            const instantSpeed = (deltaChars / Math.max(timeDiff, 1)) * 1000;
            setGenerationSpeed((prev) => prev * 0.3 + instantSpeed * 0.7);
          }
          lastContentLengthRef.current = chunk.accumulatedText.length;
          lastUpdateTimestampRef.current = now;

          const cardIndex = chunk.cardNumber - 1;
          const currentCards = cardsRef.current;

          try {
            const partialData = parsePartialJson(chunk.accumulatedText);
            if (
              partialData &&
              partialData.rows &&
              Array.isArray(partialData.rows)
            ) {
              const validRows = partialData.rows.filter(
                (row: any) => row && (row.id || row.blocks)
              );

              if (validRows.length > 0) {
                // Use stable IDs during streaming to prevent React remounts
                // These will be replaced with real IDs when the card is saved
                const streamingCardId = chunk.cardId || `streaming-card-${chunk.cardNumber}`;
                
                const partialCard: Card = {
                  id: streamingCardId,
                  rows: validRows.map((row: any, rowIndex: number) => ({
                    id: row.id || `streaming-row-${chunk.cardNumber}-${rowIndex}`,
                    columnWidths: row.columnWidths,
                    blocks: (row.blocks || [])
                      .filter((block: any) => block && block.type)
                      .map((block: any, blockIndex: number) => ({
                        id: block.id || `streaming-block-${chunk.cardNumber}-${rowIndex}-${blockIndex}`,
                        type: block.type,
                        content: block.content || {},
                      })),
                  })),
                  accent: partialData.accent,
                  isStreaming: true,
                } as any;

                const newCards = [...currentCards];
                if (newCards[cardIndex]) {
                  newCards[cardIndex] = partialCard;
                } else {
                  newCards.push(partialCard);
                }
                
                // Throttle Redux updates to prevent excessive re-renders
                // Only dispatch every 150ms during streaming
                const now = Date.now();
                const timeSinceLastDispatch = now - lastDispatchTimeRef.current;
                
                if (timeSinceLastDispatch > 150) {
                  // Enough time has passed, dispatch immediately
                  dispatch(setCards(newCards));
                  lastDispatchTimeRef.current = now;
                  pendingUpdateRef.current = null;
                } else {
                  // Store the update to be dispatched later
                  pendingUpdateRef.current = newCards;
                }
              }
            }
          } catch {
            // Partial JSON might be mid-token, ignore parse errors
          }

          setProgress((prev) => ({
            ...prev!,
            message: `Building card ${chunk.cardNumber}... (${
              chunk.accumulatedText?.length || 0
            } chars)`,
          }));
        }
      } else if (chunk.type === "card" && chunk.data) {
        const card: Card = {
          id: chunk.cardId || nanoid(),
          rows: chunk.data.rows.map((row: any) => ({
            id: row.id || nanoid(),
            columnWidths: row.columnWidths,
            blocks: row.blocks.map((block: any) => ({
              id: block.id || nanoid(),
              type: block.type,
              content: block.content,
            })),
          })),
          accent: chunk.data.accent,
          isStreaming: false, // Explicitly mark as not streaming to enable image fetching
        };
        const currentCards = cardsRef.current;
        const cardIndex = chunk.cardNumber
          ? chunk.cardNumber - 1
          : currentCards.length;

        const newCards = [...currentCards];
        if (
          cardIndex < newCards.length &&
          newCards[cardIndex]?.id?.startsWith("streaming-")
        ) {
          newCards[cardIndex] = card;
          dispatch(setCards(newCards));
        } else {
          dispatch(setCards([...currentCards, card]));
        }
      } else if (chunk.type === "complete") {
        setIsGenerating(false);
        setProgress(null);
        toast.success("Document created successfully!");
        dispatch(fetchCreditBalance());
      } else if (chunk.type === "card-error") {
        toast.error(
          `Card ${chunk.cardNumber} failed: ${chunk.message || "Unknown error"}`
        );
      } else if (chunk.type === "error") {
        setIsGenerating(false);
        setProgress(null);
        toast.error(`Generation failed: ${chunk.message || "Unknown error"}`);
        dispatch(fetchCreditBalance());
      }
    },
    [dispatch, cardsRef, progress?.total]
  );

  const startGeneration = useCallback(
    (docIdParam: string) => {
      if (!docIdParam) return;
      setIsGenerating(true);
      generateAndCreateCards(docIdParam, handleGenerationChunk);
    },
    [handleGenerationChunk]
  );

  return {
    isGenerating,
    progress,
    generationSpeed,
    startGeneration,
    isPending: isGenerating,
  };
}
