"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface UseDocModeProps {
  cardsCount: number;
  cards: Array<{ id: string }>;
  docId: string;
}

interface UseDocModeReturn {
  isPresenting: boolean;
  currentCardIndex: number;
  docContainerRef: React.RefObject<HTMLDivElement | null>;
  startDoc: () => void;
  stopDoc: () => void;
  goToNextCard: () => void;
  goToPrevCard: () => void;
  setCurrentCardIndex: React.Dispatch<React.SetStateAction<number>>;
}

/**
 * Custom hook to manage doc mode state and navigation.
 * Handles keyboard navigation, smart scrolling within cards, card transitions, and URL synchronization.
 */
export function useDocMode({
  cardsCount,
  cards,
  docId,
}: UseDocModeProps): UseDocModeReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isPresenting, setIsPresenting] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const docContainerRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);

  /**
   * Update URL with doc mode parameters
   */
  const updateUrl = useCallback(
    (cardIndex: number, isPresenting: boolean) => {
      if (isPresenting && cards[cardIndex]) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('mode', 'present');
        params.set('cardId', cards[cardIndex].id);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      } else {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('mode');
        params.delete('cardId');
        const newUrl = params.toString()
          ? `${pathname}?${params.toString()}`
          : pathname;
        router.replace(newUrl, { scroll: false });
      }
    },
    [router, pathname, searchParams, cards],
  );

  /**
   * Start doc mode and update URL
   */
  const startDoc = useCallback(() => {
    setIsPresenting(true);
    setCurrentCardIndex(0);
    if (cards[0]) {
      updateUrl(0, true);
    }
  }, [cards, updateUrl]);

  /**
   * Stop doc mode and clean URL
   */
  const stopDoc = useCallback(() => {
    setIsPresenting(false);
    updateUrl(0, false);
  }, [updateUrl]);

  /**
   * Navigate to next card and update URL
   */
  const goToNextCard = useCallback(() => {
    setCurrentCardIndex((prev) => {
      const nextIndex = Math.min(prev + 1, cardsCount - 1);
      if (isPresenting && cards[nextIndex]) {
        updateUrl(nextIndex, true);
      }
      return nextIndex;
    });
  }, [cardsCount, cards, isPresenting, updateUrl]);

  /**
   * Navigate to previous card and update URL
   */
  const goToPrevCard = useCallback(() => {
    setCurrentCardIndex((prev) => {
      const prevIndex = Math.max(prev - 1, 0);
      if (isPresenting && cards[prevIndex]) {
        updateUrl(prevIndex, true);
      }
      return prevIndex;
    });
  }, [cards, isPresenting, updateUrl]);

  /**
   * Initialize doc mode from URL parameters
   */
  useEffect(() => {
    if (isInitializedRef.current) return;
    if (cardsCount === 0 || cards.length === 0) return;

    const mode = searchParams.get('mode');
    const cardId = searchParams.get('cardId');

    if (mode === 'present' && cardId) {
      const cardIndex = cards.findIndex((card) => card.id === cardId);
      if (cardIndex !== -1) {
        setIsPresenting(true);
        setCurrentCardIndex(cardIndex);
        isInitializedRef.current = true;
      }
    }
  }, [searchParams, cards, cardsCount]);

  /**
   * Lock body scroll during doc
   */
  useEffect(() => {
    if (isPresenting) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isPresenting]);

  // Reset scroll position on card change
  useEffect(() => {
    if (docContainerRef.current) {
      docContainerRef.current.scrollTop = 0;
    }
  }, [currentCardIndex]);

  // Keyboard navigation for doc mode with smart scrolling
  useEffect(() => {
    if (!isPresenting) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const container = docContainerRef.current;
      if (!container) return;

      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        const nextIndex = Math.min(currentCardIndex + 1, cardsCount - 1);
        setCurrentCardIndex(nextIndex);
        if (cards[nextIndex]) {
          updateUrl(nextIndex, true);
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prevIndex = Math.max(currentCardIndex - 1, 0);
        setCurrentCardIndex(prevIndex);
        if (cards[prevIndex]) {
          updateUrl(prevIndex, true);
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        handleScrollDown(container);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        handleScrollUp(container);
      } else if (e.key === "Escape") {
        stopDoc();
      }
    };

    const handleScrollDown = (container: HTMLDivElement) => {
      const viewportHeight = window.innerHeight;
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const maxScroll = scrollHeight - viewportHeight;
      const remainingScroll = maxScroll - scrollTop;

      // If content fits in viewport OR we're truly at the bottom (less than 100px remaining), go to next card
      if (maxScroll <= 10 || remainingScroll < 100) {
        if (currentCardIndex < cardsCount - 1) {
          const nextIndex = currentCardIndex + 1;
          setCurrentCardIndex(nextIndex);
          if (cards[nextIndex]) {
            updateUrl(nextIndex, true);
          }
        }
        return;
      }

      // Scroll 90% of viewport height (keeping 10% overlap for context)
      const idealScrollAmount = Math.floor(viewportHeight * 0.9);

      // If scrolling down would leave less than 100px at the bottom, go to maxScroll
      const targetScroll =
        remainingScroll - idealScrollAmount < 100
          ? maxScroll
          : scrollTop + idealScrollAmount;

      container.scrollTo({
        top: targetScroll,
        behavior: "smooth",
      });
    };

    const handleScrollUp = (container: HTMLDivElement) => {
      const viewportHeight = window.innerHeight;
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const maxScroll = scrollHeight - viewportHeight;

      // If we're at the top (less than 100px scrolled), go to previous card
      if (maxScroll <= 10 || scrollTop < 100) {
        if (currentCardIndex > 0) {
          const prevIndex = currentCardIndex - 1;
          setCurrentCardIndex(prevIndex);
          if (cards[prevIndex]) {
            updateUrl(prevIndex, true);
          }
          // Scroll to bottom of previous card after transition
          setTimeout(() => {
            const newContainer = docContainerRef.current;
            if (newContainer) {
              const newMaxScroll =
                newContainer.scrollHeight - window.innerHeight;
              if (newMaxScroll > 10) {
                newContainer.scrollTo({
                  top: newMaxScroll,
                  behavior: "smooth",
                });
              }
            }
          }, 150);
        }
        return;
      }

      // Scroll 90% of viewport height (keeping 10% overlap for context)
      const idealScrollAmount = Math.floor(viewportHeight * 0.9);

      // If scrolling up would leave less than 100px at the top, just go to 0
      const targetScroll =
        scrollTop - idealScrollAmount < 100 ? 0 : scrollTop - idealScrollAmount;

      container.scrollTo({
        top: targetScroll,
        behavior: "smooth",
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPresenting, cardsCount, currentCardIndex, cards, updateUrl, stopDoc]);

  return {
    isPresenting,
    currentCardIndex,
    docContainerRef,
    startDoc,
    stopDoc,
    goToNextCard,
    goToPrevCard,
    setCurrentCardIndex,
  };
}
