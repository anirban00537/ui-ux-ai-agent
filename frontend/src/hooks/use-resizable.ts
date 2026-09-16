"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface UseResizableProps {
  side?: "left" | "right";
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
}

export function useResizable({
  side = "right",
  defaultWidth = 350,
  minWidth = 250,
  maxWidth = 800,
}: UseResizableProps) {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      startX.current = e.clientX;
      startWidth.current = width;
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
    },
    [width]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;
      const deltaX =
        side === "left"
          ? e.clientX - startX.current
          : startX.current - e.clientX;
      const newWidth = Math.max(
        minWidth,
        Math.min(maxWidth, startWidth.current + deltaX)
      );
      setWidth(newWidth);
    },
    [isResizing, side, minWidth, maxWidth]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return {
    width,
    isResizing,
    sidebarRef,
    handleMouseDown,
  };
}
