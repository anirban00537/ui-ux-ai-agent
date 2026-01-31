import { memo } from "react";
import { useDndMonitor } from "@dnd-kit/core";

export const DragStateBridge = memo(function DragStateBridge({
  onDragChange,
}: {
  onDragChange: (dragging: boolean) => void;
}) {
  useDndMonitor({
    onDragStart: () => onDragChange(true),
    onDragEnd: () => onDragChange(false),
    onDragCancel: () => onDragChange(false),
  });
  return null;
});
