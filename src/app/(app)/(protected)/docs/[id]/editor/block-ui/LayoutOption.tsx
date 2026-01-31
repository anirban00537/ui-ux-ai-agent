import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/cardsSlice";
import { cn } from "@/lib/utils";

interface LayoutOptionProps {
  id: string;
  blockType: string;
  icon: React.ReactNode;
  label: string;
  columnCount: number;
}

export const LayoutOption: React.FC<LayoutOptionProps> = ({
  id,
  blockType,
  icon,
  label,
  columnCount,
}) => {
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";
  
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data: { 
        type: "layout-option", 
        blockType, 
        columnCount,
      },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "flex flex-col items-center gap-1.5 p-3 rounded-xl cursor-grab active:cursor-grabbing transition-all",
        isDark ? "hover:bg-white/5" : "hover:bg-black/5"
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
          isDragging 
            ? "bg-primary/20 text-primary" 
            : isDark 
              ? "bg-white/5 text-white/60 hover:text-primary hover:bg-primary/10"
              : "bg-black/5 text-black/60 hover:text-primary hover:bg-primary/10"
        )}
      >
        {icon}
      </div>
      <span className={cn(
        "text-[11px] font-medium text-center leading-tight",
        isDark ? "text-white/60" : "text-black/60"
      )}>
        {label}
      </span>
    </div>
  );
};
