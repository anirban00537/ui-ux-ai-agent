import React, { memo } from "react";
import { useDroppable } from "@dnd-kit/core";

export const InsertDropZone = memo(function InsertDropZone({
  cardId,
  insertIndex,
  themePrimary,
  isActive,
}: {
  cardId: string;
  insertIndex: number;
  themePrimary: string;
  isActive: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `row-insert-${cardId}-${insertIndex}`,
    data: {
      type: "row-insert",
      cardId,
      insertIndex,
    },
  });

  if (!isActive) return null;

  return (
    <div
      ref={setNodeRef}
      className="relative h-4 -my-1.5 flex items-center justify-center z-20"
    >
      {/* Simple line - only visible when hovering */}
      {isOver && (
        <div
          className="absolute inset-x-0 h-[2px] rounded-full transition-opacity duration-100"
          style={{
            backgroundColor: themePrimary,
            boxShadow: `0 0 8px ${themePrimary}60`,
          }}
        />
      )}
    </div>
  );
});
