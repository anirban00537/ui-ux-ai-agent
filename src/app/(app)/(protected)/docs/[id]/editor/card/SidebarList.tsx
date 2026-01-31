import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Card } from "@/store/slices/cardsSlice";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectTheme,
  selectActiveCardId,
  DEFAULT_THEME,
  setActiveCard,
  reorderCards,
} from "@/store/slices/cardsSlice";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableCardItem } from "./SortableCardItem";
import { CardCanvas } from "@/app/(app)/(protected)/docs/[id]/engine";
import { CARD_MAX_WIDTH } from "@/lib/constants";

interface SidebarListProps {
  cards: Card[];
  containerWidth: number;
  onUpdateBlock: (cardId: string, blockId: string, content: any) => void;
  onDeleteRow: (cardId: string, rowId: string) => void;
  onAddColumn: (cardId: string, rowId: string, afterBlockId: string) => void;
  onAddRowAtTop: (cardId: string) => void;
  onAddRowAtBottom: (cardId: string) => void;
  onUpdateColumnWidths: (
    cardId: string,
    rowId: string,
    columnWidths: number[]
  ) => void;
  onDeleteCard: (cardId: string) => void;
}

export const SidebarList: React.FC<SidebarListProps> = ({
  cards,
  containerWidth,
  onUpdateBlock,
  onDeleteRow,
  onAddColumn,
  onAddRowAtTop,
  onAddRowAtBottom,
  onUpdateColumnWidths,
  onDeleteCard: onDeleteCardProp,
}) => {
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";
  const activeCardId = useAppSelector(selectActiveCardId);
  const dispatch = useAppDispatch();

  // Measurements
  const availableWidth = Math.max(0, containerWidth - 48);
  const scale = availableWidth / CARD_MAX_WIDTH;
  const cardHeight = CARD_MAX_WIDTH * (9 / 16);
  const thumbnailHeight = cardHeight * scale;

  // Dnd Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Virtualizer - Spacing increased to 8px (matches mb-2)
  const rowVirtualizer = useVirtualizer({
    count: cards.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => thumbnailHeight + 8,
    overscan: 5,
  });

  // Derived Props for Card Render
  const renderCardProps = useMemo(
    () => ({
      onUpdateBlock,
      onDeleteRow,
      onAddColumn,
      onAddRowAtTop,
      onAddRowAtBottom,
      onUpdateColumnWidths,
    }),
    [
      onUpdateBlock,
      onDeleteRow,
      onAddColumn,
      onAddRowAtTop,
      onAddRowAtBottom,
      onUpdateColumnWidths,
    ]
  );

  // Scroll active card into view
  useEffect(() => {
    if (activeCardId && !activeDragId) {
      const activeIndex = cards.findIndex((c) => c.id === activeCardId);
      if (activeIndex !== -1) {
        setTimeout(() => {
          try {
            rowVirtualizer.scrollToIndex(activeIndex, {
              align: "center",
              behavior: "smooth",
            });
          } catch (e) {}
        }, 50);
      }
    }
  }, [activeCardId, activeDragId, cards, rowVirtualizer]);

  // Handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (over && active.id !== over.id) {
      const oldIndex = cards.findIndex((c) => c.id === active.id);
      const newIndex = cards.findIndex((c) => c.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        dispatch(reorderCards({ cardId: active.id as string, newIndex }));
      }
    }
  };

  const handleCardClick = useCallback(
    (cardId: string) => {
      dispatch(setActiveCard(cardId));
    },
    [dispatch]
  );

  const activeDragCard = useMemo(
    () => cards.find((c) => c.id === activeDragId),
    [cards, activeDragId]
  );

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: { opacity: "0.4" },
      },
    }),
  };

  return (
    <div
      ref={scrollContainerRef}
      className={`relative flex-1 overflow-y-auto pl-4 pr-3 pt-1 pb-4 ${
        isDark ? "custom-scrollbar-dark" : "custom-scrollbar-light"
      }`}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const card = cards[virtualRow.index];
              if (!card) return null;

              return (
                <div
                  key={card.id}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <SortableCardItem
                    card={card}
                    index={virtualRow.index}
                    isActive={card.id === activeCardId}
                    theme={theme}
                    isDark={isDark}
                    scale={scale}
                    cardHeight={cardHeight}
                    thumbnailHeight={thumbnailHeight}
                    containerWidth={availableWidth}
                    onCardClick={handleCardClick}
                    onDeleteCard={onDeleteCardProp}
                    cardCount={cards.length}
                    renderCardProps={renderCardProps}
                  />
                </div>
              );
            })}
          </div>
        </SortableContext>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeDragCard ? (
            <div
              className="opacity-90 cursor-grabbing"
              style={{ width: `${availableWidth}px` }}
            >
              <div
                className="relative overflow-hidden rounded-xl shadow-2xl ring-2 ring-primary ring-offset-2 ring-offset-transparent transform scale-105"
                style={{
                  height: `${thumbnailHeight}px`,
                  width: `${availableWidth}px`,
                  backgroundColor: theme.cardBackground,
                }}
              >
                <div
                  className="absolute top-0 left-0 pointer-events-none origin-top-left"
                  style={{
                    transform: `scale(${scale})`,
                    width: `${CARD_MAX_WIDTH}px`,
                    height: `${cardHeight}px`,
                  }}
                >
                  <CardCanvas
                    card={activeDragCard as any}
                    {...renderCardProps}
                    enableDragHints={false}
                    readOnly={true}
                  />
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
