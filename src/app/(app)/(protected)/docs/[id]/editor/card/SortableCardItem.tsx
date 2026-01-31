import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconGripVertical,
  IconTrash,
} from "@tabler/icons-react";
import { CARD_MAX_WIDTH } from "@/lib/constants";
import { CardCanvas } from "@/app/(app)/(protected)/docs/[id]/engine";
import type { Card } from "@/store/slices/cardsSlice";

interface SortableCardItemProps {
  card: Card;
  index: number;
  isActive: boolean;
  theme: any;
  isDark: boolean;
  scale: number;
  cardHeight: number;
  thumbnailHeight: number;
  containerWidth: number;
  onCardClick: (id: string) => void;
  onDeleteCard: (id: string) => void;
  cardCount: number;
  renderCardProps: any;
}

export const SortableCardItem = ({
  card,
  index,
  isActive,
  theme,
  isDark,
  scale,
  cardHeight,
  thumbnailHeight,
  containerWidth,
  onCardClick,
  onDeleteCard,
  cardCount,
  renderCardProps,
}: SortableCardItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 999 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative mb-2 group touch-none px-1"
    >
      <div
        onClick={() => onCardClick(card.id)}
        className="relative cursor-pointer transition-transform duration-200"
      >
        {/* Card Preview Container */}
        <div
          className="relative rounded-xl bg-white shadow-sm transition-all duration-200 hover:shadow-md mx-auto"
          style={{
            height: `${thumbnailHeight}px`,
            width: `${containerWidth}px`,
            outline: isActive ? `2px solid ${theme.primary}` : "2px solid transparent",
            outlineOffset: "2px",
            backgroundColor: theme.cardBackground,
            overflow: "hidden",
          }}
        >
          {/* Scaled CardContainer */}
          <div
            className="absolute top-0 left-0 pointer-events-none origin-top-left"
            style={{
              transform: `scale(${scale})`,
              width: `${CARD_MAX_WIDTH}px`,
              height: `${cardHeight}px`,
            }}
          >
            <CardCanvas card={card as any} {...renderCardProps} enableDragHints={false} readOnly={true} />
          </div>

          {/* Hover Overlay with Controls */}
          <div
            className={`absolute inset-0 flex items-center justify-center gap-2 transition-opacity duration-200
              ${isDragging ? "opacity-0" : "opacity-0 group-hover:opacity-100"}
            `}
            style={{
              background: isDark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.4)",
              backdropFilter: "blur(2px)",
            }}
          >
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="p-2 rounded-lg cursor-grab active:cursor-grabbing hover:scale-105 transition-transform shadow-sm"
              style={{
                backgroundColor: theme.primary,
                color: "#ffffff",
              }}
              title="Drag to reorder"
            >
              <IconGripVertical size={16} />
            </div>

            {/* Delete Button */}
            {cardCount > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card selection
                  onDeleteCard(card.id);
                }}
                className="p-2 rounded-lg hover:scale-105 transition-transform shadow-sm bg-red-500 text-white"
                title="Delete card"
              >
                <IconTrash size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Card Number Badge */}
        <div
          className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm z-10"
          style={{
            backgroundColor: isActive ? theme.primary : (isDark ? "rgba(30,30,40,0.9)" : "rgba(255,255,255,0.9)"),
            color: isActive ? "#ffffff" : (isDark ? "#ffffff" : "#000000"),
            backdropFilter: "blur(4px)",
          }}
        >
          {index + 1}
        </div>
      </div>
    </div>
  );
};
