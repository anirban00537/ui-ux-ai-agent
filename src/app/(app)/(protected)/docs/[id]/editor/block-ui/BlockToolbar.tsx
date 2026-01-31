import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/cardsSlice";
import { IconTrash, IconCopy } from "@tabler/icons-react";
import { trackEvent } from "@/components/analytics/trackEvent";
import { cn } from "@/lib/utils";

interface BlockToolbarProps {
  isVisible: boolean;
  onDuplicate: () => void;
  onDelete: () => void;
}

export const BlockToolbar = memo(function BlockToolbar({
  isVisible,
  onDuplicate,
  onDelete,
}: BlockToolbarProps) {
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";

  const buttonClass = cn(
    "w-8 h-8 rounded-lg transition-all flex items-center justify-center",
    isDark 
      ? "text-white/60 hover:text-white hover:bg-white/10"
      : "text-black/50 hover:text-black hover:bg-black/5"
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2, ease: "circOut" }}
          className="absolute top-0 right-0 translate-x-[calc(100%+8px)] z-[100]"
          data-block-action-bar
        >
          <div
            className={cn(
              "flex flex-col items-center gap-1 p-1 rounded-xl shadow-2xl border backdrop-blur-xl",
              isDark 
                ? "bg-[#1a1a1f]/95 border-white/10" 
                : "bg-white/95 border-black/10"
            )}
          >
            {/* Duplicate */}
            <button
              onClick={() => {
                trackEvent('block_duplicate', 'engagement', 'toolbar');
                onDuplicate();
              }}
              className={buttonClass}
              title="Duplicate"
            >
              <IconCopy size={16} />
            </button>

            <div className={cn(
              "w-4 h-px mx-auto",
              isDark ? "bg-white/10" : "bg-black/10"
            )} />

            {/* Delete */}
            <button
              onClick={() => {
                trackEvent('block_delete', 'engagement', 'toolbar');
                onDelete();
              }}
              className={cn(buttonClass, "text-red-500 hover:text-red-400 hover:bg-red-500/10")}
              title="Delete"
            >
              <IconTrash size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
