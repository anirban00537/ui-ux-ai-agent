import { useState, useRef, useCallback } from "react";

interface UseResizeOptions {
  direction: "horizontal" | "vertical";
  onResize: (delta: number) => void;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
}

export const useResize = ({
  direction,
  onResize,
  onResizeStart,
  onResizeEnd,
}: UseResizeOptions) => {
  const [isResizing, setIsResizing] = useState(false);
  const lastPosRef = useRef<number>(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setIsResizing(true);
      if (onResizeStart) onResizeStart();

      const pos = direction === "horizontal" ? e.clientX : e.clientY;
      lastPosRef.current = pos;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const currentPos =
          direction === "horizontal" ? moveEvent.clientX : moveEvent.clientY;
        const delta = currentPos - lastPosRef.current;
        lastPosRef.current = currentPos;
        onResize(delta);
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        setIsResizing(false);
        if (onResizeEnd) onResizeEnd();
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [direction, onResize, onResizeStart, onResizeEnd]
  );

  return { isResizing, handleMouseDown };
};
