"use client";

import React from "react";
import { motion } from "framer-motion";
import { Theme, Block } from "@/store/slices/cardsSlice";
import { getBlockTypeIcon, getBlockTypeLabel } from "@/app/(app)/(protected)/docs/[id]/editor/utils/blockTypeUtils";

interface DragPreviewProps {
  block?: Block | null;
  blockType?: string | null;
  theme: Theme;
}

export const DragPreview: React.FC<DragPreviewProps> = ({
  block,
  blockType,
  theme,
}) => {
  const isDark = theme.themeType === "dark";
  const type = block?.type || blockType || "prosemirror";

  if (!block && !blockType) return null;

  return (
    <motion.div
      initial={{ scale: block ? 0.95 : 0.9, opacity: block ? 0.8 : 0 }}
      animate={{ scale: 1, opacity: 0.95 }}
      className="rounded-lg overflow-hidden"
      style={{
        backgroundColor: isDark
          ? "rgba(30, 30, 35, 0.95)"
          : "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(12px)",
        maxWidth: block ? "280px" : undefined,
      }}
    >
      <div className="px-3 py-2.5 flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center"
          style={{
            backgroundColor: `${theme.primary}15`,
            color: theme.primary,
          }}
        >
          {getBlockTypeIcon(type)}
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="text-sm font-medium"
            style={{ color: isDark ? "#e5e7eb" : "#1f2937" }}
          >
            {getBlockTypeLabel(type)}
          </div>
        </div>
      </div>
      {/* Subtle accent line */}
      <div
        className="h-0.5 w-full"
        style={{ backgroundColor: theme.primary }}
      />
    </motion.div>
  );
};

