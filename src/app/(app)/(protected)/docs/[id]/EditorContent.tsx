"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  CardCanvas,
  CardNavigator,
  EditorHeader,
  DocView,
  EditorBackground,
  BlockSelectionProvider,
  ToolbarPanel,
  EditorThemeProvider,
  EditorDndProvider,
  useEditorTheme,
  ScalableCardContainer,
  CardActionBar,
  CardLayoutSelector,
} from "@/app/(app)/(protected)/docs/[id]/editor";
import { GoogleFontsLoader } from "@/components/GoogleFontsLoader";
import { LoadingOverlay } from "@/app/(app)/(protected)/docs/[id]/editor";
import { LoaderOverlay } from "@/components/ui";
import { useEditorPage } from "./hooks/useEditorPage";
import { useDocMode } from "./hooks/useDocMode";
import { useAppSelector } from "@/store/hooks";
import { selectDoc, selectActiveCardId } from "@/store/slices/cardsSlice";
import { useUndoRedoKeyboardShortcuts } from "@/app/(app)/(protected)/docs/[id]/hooks/useUndoRedo";
import DragOverlayWrapper from "./DragOverlayWrapper";
import { Card } from "@/store/slices/cardsSlice";
import { CARD_MAX_WIDTH } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { LayoutTemplate } from "@/types";

const EditorContent = ({ docId, outlineId }: { docId: string, outlineId: string | null }) => {
  const {
    cards,
    commandBus,
    handleUpdateBlock,
    handleDeleteRow,
    handleAddColumn,
    handleAddRowAtTop,
    handleAddRowAtBottom,
    handleUpdateColumnWidths,
    handleAddCard,
    handleDeleteCard,
    isLoadingDoc,
    isGeneratingCards,
    cardGenerationProgress,
    cardGenerationSpeed,
  } = useEditorPage({ docId, outlineId });

  const theme = useEditorTheme();
  const doc = useAppSelector(selectDoc);
  const activeCardId = useAppSelector(selectActiveCardId);
  const isDark = theme.themeType === "dark";
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Determine if we're in read-only mode
  // User can edit only if they are the owner of the document
  // If not the owner (even if logged in), they should be in read-only mode
  const isReadOnly = doc?.isOwner !== true;
  
  // Mobile UI States
  const [isMobileNavigatorOpen, setIsMobileNavigatorOpen] = useState(false);
  const [layoutSelectorCardId, setLayoutSelectorCardId] = useState<string | null>(null);
  const lastScrolledCardId = useRef<string | null>(null);

  useUndoRedoKeyboardShortcuts();

  const {
    isPresenting,
    currentCardIndex,
    docContainerRef,
    startDoc,
    stopDoc,
    goToNextCard,
    goToPrevCard,
  } = useDocMode({
    cardsCount: cards.length,
    cards: cards.filter((card: Card) => card && card.rows && Array.isArray(card.rows)),
    docId,
  });

  const handleOpenLayouts = (cardId: string) => {
    setLayoutSelectorCardId(cardId);
  };

  const handleLayoutSelect = (template: LayoutTemplate) => {
    if (layoutSelectorCardId) {
      handleAddCard(layoutSelectorCardId, {
        rows: template.data.rows,
        accent: template.data.accent,
      });
      setLayoutSelectorCardId(null);
    }
  };

  // Determine valid cards once to ensure consistency
  const validCards = useMemo(() => {
    return cards.filter(
      (card: Card) => card && card.rows && Array.isArray(card.rows)
    );
  }, [cards]);

  // Scroll to active card when it changes
  useEffect(() => {
    if (activeCardId && !isPresenting && !isGeneratingCards) {
      if (activeCardId !== lastScrolledCardId.current) {
        const cardElement = document.querySelector(`[data-card-id="${activeCardId}"]`);
        if (cardElement) {
          cardElement.scrollIntoView({ behavior: "smooth", block: "center" });
          lastScrolledCardId.current = activeCardId;
          setIsMobileNavigatorOpen(false);
        }
      }
    } else if (!activeCardId) {
      lastScrolledCardId.current = null;
    }
  }, [activeCardId, isPresenting, isGeneratingCards]);

  // Auto-scroll to bottom during content generation
  useEffect(() => {
    if (!isGeneratingCards || validCards.length === 0) return;
    
    const scrollToBottom = () => {
      const scrollElement = scrollContainerRef.current;
      if (scrollElement) {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: "auto",
        });
      }
    };
    
    scrollToBottom();
    const intervalId = setInterval(scrollToBottom, 200);
    
    return () => clearInterval(intervalId);
  }, [isGeneratingCards, validCards.length]);

  const showLoading = isLoadingDoc && !isGeneratingCards;

  if (showLoading) {
    return (
      <>
        <GoogleFontsLoader />
        <LoadingOverlay isGenerating={false} progress={null} />
      </>
    );
  }

  return (
    <>
      <GoogleFontsLoader />

      <DocView
        isPresenting={isPresenting}
        cards={cards}
        currentCardIndex={currentCardIndex}
        theme={theme}
        containerRef={docContainerRef}
        onPrevCard={goToPrevCard}
        onNextCard={goToNextCard}
        onClose={stopDoc}
        onUpdateBlock={handleUpdateBlock}
        onDeleteRow={handleDeleteRow}
        onAddColumn={handleAddColumn}
        onAddRowAtTop={handleAddRowAtTop}
        onAddRowAtBottom={handleAddRowAtBottom}
        onUpdateColumnWidths={handleUpdateColumnWidths}
      />

      <EditorHeader 
        onPresentClick={startDoc} 
        onMenuClick={() => setIsMobileNavigatorOpen(!isMobileNavigatorOpen)}
        isReadOnly={isReadOnly}
      />

      <div className="fixed inset-0 pt-14 flex overflow-hidden">
        <EditorBackground theme={theme} />

        {/* Desktop Sidebar */}
        {!isReadOnly && (
          <div className="hidden lg:flex h-full">
            <CardNavigator
              cards={cards.filter(
                (card: Card) => card && card.rows && Array.isArray(card.rows)
              )}
              onUpdateBlock={handleUpdateBlock}
              onDeleteRow={handleDeleteRow}
              onAddColumn={handleAddColumn}
              onAddRowAtTop={handleAddRowAtTop}
              onAddRowAtBottom={handleAddRowAtBottom}
              onUpdateColumnWidths={handleUpdateColumnWidths}
              onAddCard={handleAddCard}
              onDeleteCard={handleDeleteCard}
            />
          </div>
        )}

        {/* Mobile Sidebar Overlay */}
        {isMobileNavigatorOpen && (
          <div className="lg:hidden fixed inset-0 z-[100]">
            <div 
              onClick={() => setIsMobileNavigatorOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            />
            <div
              className="absolute top-0 left-0 bottom-0 w-[240px] bg-white dark:bg-[#121216] shadow-2xl transition-transform"
            >
              <div className="h-full w-full overflow-hidden">
                 <CardNavigator
                    cards={cards.filter(
                      (card: Card) => card && card.rows && Array.isArray(card.rows)
                    )}
                    onUpdateBlock={handleUpdateBlock}
                    onDeleteRow={handleDeleteRow}
                    onAddColumn={handleAddColumn}
                    onAddRowAtTop={handleAddRowAtTop}
                    onAddRowAtBottom={handleAddRowAtBottom}
                    onUpdateColumnWidths={handleUpdateColumnWidths}
                    onAddCard={handleAddCard}
                    onDeleteCard={handleDeleteCard}
                    isMobile={true}
                  />
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-hidden relative flex flex-col">
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto w-full relative">
            <div className="w-full max-w-[1400px] mx-auto px-4 lg:pr-28 py-8 flex flex-col items-center min-h-full">
              {isReadOnly ? (
                // Read-only view - no editing capabilities
                <div className="flex flex-col w-full items-center gap-6 pb-32">
                  {validCards.map((card, index) => (
                    <div
                      key={card.id}
                      data-card-id={card.id}
                      data-card-index={index}
                      className="w-full max-w-full relative"
                    >
                      <div
                        className="absolute -left-10 top-0 text-xs font-bold opacity-30 select-none hidden xl:block"
                        style={{ color: theme.bodyColor }}
                      >
                        {index + 1}
                      </div>

                      <ScalableCardContainer>
                        <CardCanvas
                          card={card}
                          onUpdateBlock={() => {}}
                          onDeleteRow={() => {}}
                          onAddColumn={() => {}}
                          onAddRowAtTop={() => {}}
                          onAddRowAtBottom={() => {}}
                          onUpdateColumnWidths={() => {}}
                          readOnly={true}
                        />
                      </ScalableCardContainer>
                    </div>
                  ))}
                </div>
              ) : (
                // Full editing mode
                <EditorDndProvider cards={cards} commandBus={commandBus}>
                  <BlockSelectionProvider>
                    <ToolbarPanel docId={docId} />

                    <div className="flex flex-col w-full items-center gap-1 pb-32">
                      {validCards.map((card, index) => (
                        <div
                          key={card.id}
                          data-card-id={card.id}
                          data-card-index={index}
                          className="w-full flex flex-col items-center"
                        >
                          <div className="w-full max-w-full relative">
                            <div
                              className="absolute -left-10 top-0 text-xs font-bold opacity-30 select-none hidden xl:block"
                              style={{ color: theme.bodyColor }}
                            >
                              {index + 1}
                            </div>

                            <ScalableCardContainer>
                              <CardCanvas
                                card={card}
                                onUpdateBlock={handleUpdateBlock}
                                onDeleteRow={handleDeleteRow}
                                onAddColumn={handleAddColumn}
                                onAddRowAtTop={handleAddRowAtTop}
                                onAddRowAtBottom={handleAddRowAtBottom}
                                onUpdateColumnWidths={handleUpdateColumnWidths}
                              />
                            </ScalableCardContainer>
                          </div>

                          {/* Action bar */}
                          <div className="h-[64px] flex items-center justify-center w-full my-2">
                            <CardActionBar
                              onAddBlank={() => handleAddCard(card.id)}
                              onAddTemplate={() => handleOpenLayouts(card.id)}
                              onAddAI={() => {}}
                              className="w-[200px]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </BlockSelectionProvider>

                  <DragOverlayWrapper />
                </EditorDndProvider>
              )}
            </div>
          </div>
        </div>
      </div>

      <LoaderOverlay
        isLoading={isGeneratingCards}
        progress={cardGenerationProgress}
        theme={theme}
        mode={isDark ? "dark" : "light"}
        streamSpeed={cardGenerationSpeed}
      />

      <CardLayoutSelector
        isOpen={!!layoutSelectorCardId}
        onClose={() => setLayoutSelectorCardId(null)}
        onSelectLayout={handleLayoutSelect}
      />
    </>
  );
};

export default EditorContent;