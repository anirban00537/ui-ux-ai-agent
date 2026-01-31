import React, { memo } from "react";
import type { Theme } from "@/types";

interface CommonCardProps {
  theme: Theme;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
}

/**
 * CommonCard provides a standardized card container for various editor blocks.
 * It now uses the centralized CardFrame for consistent styling across the editor.
 */
export const CommonCard = memo(function CommonCard({
  theme,
  children,
  className = "",
  style = {},
  onMouseEnter,
  onMouseLeave,
  onClick,
}: CommonCardProps) {
  return (
      <div 
        className={`cursor-pointer h-full w-full min-h-0 min-w-0 overflow-hidden ${className}`} 
        style={style}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* Shine effect on hover - Block specific style */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ borderRadius: theme.cardBorderRadius || "12px" }}
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-700"
            style={{
              background: `linear-gradient(135deg, transparent 0%, ${theme.primary}03 50%, transparent 100%)`,
              transform: "translateX(-100%) group-hover/card:translateX(100%)",
            }}
          />
        </div>

        {/* Content */}
        {children}
      </div>
  );
});
