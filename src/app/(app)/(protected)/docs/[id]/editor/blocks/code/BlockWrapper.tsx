import React from "react";
import { IconSettings, IconPlus } from "@tabler/icons-react";
import type { Theme } from "@/types";

interface BlockWrapperProps {
  children: React.ReactNode;
  onEdit?: () => void;
  onAdd?: () => void;
  className?: string;
  hideEditButton?: boolean;
  theme?: Theme;
  customControls?: React.ReactNode;
  readOnly?: boolean;
}

export const BlockWrapper: React.FC<BlockWrapperProps> = ({
  children,
  onEdit,
  onAdd,
  className = "",
  hideEditButton = false,
  theme,
  customControls,
  readOnly = false,
}) => {
  const isDark = theme?.themeType === "dark";

  return (
    <div className={`relative w-full h-full min-w-0 ${className}`}>
      {/* Content */}
      {children}

      {/* Hover Controls - Minimal floating buttons (hidden in readOnly mode) */}
      {!readOnly && (
        <div className="absolute top-3 right-3 z-50 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto flex items-center gap-1.5">
          {customControls}
          
          {!hideEditButton && onAdd && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdd();
              }}
              className="p-1.5 rounded-lg transition-all hover:scale-105"
              style={{
                backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                color: theme?.primary || (isDark ? "#fff" : "#000"),
              }}
              title="Add Item"
            >
              <IconPlus size={14} stroke={2} />
            </button>
          )}
          
          {!hideEditButton && onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1.5 rounded-lg transition-all hover:scale-105"
              style={{
                backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                color: theme?.primary || (isDark ? "#fff" : "#000"),
              }}
              title="Edit Block"
            >
              <IconSettings size={14} stroke={2} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

