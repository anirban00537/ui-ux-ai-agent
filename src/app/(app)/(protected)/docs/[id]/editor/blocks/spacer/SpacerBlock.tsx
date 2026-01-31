import React, { memo } from "react";
import type { Block, Theme } from "@/types";
import { type SpacerContent } from "@/types"; // spacer";

interface SpacerBlockProps {
  block: Block;
  onUpdate: (content: SpacerContent) => void;
  theme: Theme;
  readOnly?: boolean;
}

export const SpacerBlock = memo(function SpacerBlock({
  block,
  onUpdate,
  theme,
  readOnly = false,
}: SpacerBlockProps) {
  const content = block.content as SpacerContent;
  const { height } = content;
  const [isResizing, setIsResizing] = React.useState(false);

  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent) => {
      if (readOnly) return;
      e.preventDefault();
      setIsResizing(true);
      const startY = e.clientY;
      const startHeight = height;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const delta = moveEvent.clientY - startY;
        const newHeight = Math.max(16, Math.min(600, startHeight + delta));
        onUpdate({ ...content, height: newHeight });
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [height, content, onUpdate, readOnly]
  );

  // In readOnly mode, just show the spacer without any interactive elements
  if (readOnly) {
    return (
      <div
        className="w-full"
        style={{ height }}
      />
    );
  }

  return (
    <div
      className="w-full relative group transition-colors"
      style={{ 
        height,
        backgroundColor: isResizing ? `${theme.primary}05` : "transparent"
      }}
    >
      {/* Visual indicator */}
      <div 
        className={`absolute inset-0 flex items-center justify-center rounded-xl transition-opacity ${
          isResizing ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        style={{
          border: `2px dashed ${isResizing ? theme.primary : `${theme.primary}30`}`,
        }}
      >
        <span
          className="text-[10px] font-medium select-none pointer-events-none px-2 py-1 rounded-md"
          style={{
            backgroundColor: `${theme.primary}10`,
            color: theme.primary,
          }}
        >
          {height}px
        </span>
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute bottom-0 left-0 right-0 h-4 cursor-ns-resize z-20 flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-b-xl"
        title="Drag to resize"
      >
        <div
          className="w-8 h-1 rounded-full mb-1.5"
          style={{ backgroundColor: `${theme.primary}40` }}
        />
      </div>
    </div>
  );
});
