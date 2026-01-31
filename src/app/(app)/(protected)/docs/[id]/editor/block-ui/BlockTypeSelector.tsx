import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/cardsSlice";
import { BLOCK_TYPES } from "@/types/docs";
import {
  IconFileText,
  IconHash,
  IconMessageCircle,
  IconTarget,
  IconQuote,
  IconTimeline,
  IconCheck,
} from "@tabler/icons-react";
import type { BlockType } from "@/types/docs";
import { trackEvent } from "@/components/analytics/trackEvent";

interface BlockTypeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: BlockType) => void;
  currentType: BlockType | string;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}

const blockTypeOptions = [
  {
    type: BLOCK_TYPES.PROSEMIRROR,
    icon: IconFileText,
    label: "Text",
  },
];


export const BlockTypeSelector: React.FC<BlockTypeSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentType,
  anchorRef,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose, anchorRef]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.12 }}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 z-50"
          data-transform-menu
        >
          <div
            className="w-44 rounded-xl overflow-hidden py-1"
            style={{
              backgroundColor: isDark ? "rgba(30,30,35,0.98)" : "rgba(255,255,255,0.98)",
              backdropFilter: "blur(16px)",
            }}
          >
            {blockTypeOptions.map((option) => {
              const isActive = option.type === currentType;
              const Icon = option.icon;

              return (
                <button
                  key={option.type}
                  onClick={() => {
                    trackEvent('block_type_change', 'engagement', option.type);
                    onSelect(option.type);
                  }}
                  disabled={isActive}
                  className="w-full px-3 py-2 flex items-center gap-2.5 transition-colors text-left"
                  style={{
                    backgroundColor: isActive
                      ? `${theme.primary}15`
                      : "transparent",
                    color: isDark ? "#e5e7eb" : "#374151",
                    cursor: isActive ? "default" : "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = isDark
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.04)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center"
                    style={{
                      backgroundColor: isActive
                        ? theme.primary
                        : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"),
                      color: isActive
                        ? "#fff"
                        : (isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)"),
                    }}
                  >
                    <Icon size={14} />
                  </div>

                  <span
                    className="flex-1 text-sm"
                    style={{
                      color: isDark ? "#e5e7eb" : "#1f2937",
                      fontWeight: isActive ? 500 : 400,
                    }}
                  >
                    {option.label}
                  </span>

                  {isActive && (
                    <IconCheck size={14} style={{ color: theme.primary }} />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

