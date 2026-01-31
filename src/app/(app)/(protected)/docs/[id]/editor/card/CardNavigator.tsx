import React, { useState, useEffect, useRef, useCallback } from "react";
import type { Card } from "@/store/slices/cardsSlice";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectTheme,
  selectActiveCardId,
  DEFAULT_THEME,
  setActiveCard,
  replaceCardWithLayout,
} from "@/store/slices/cardsSlice";
import {
  IconChevronRight,
  IconPlus,
} from "@tabler/icons-react";
import { CardLayoutSelector } from "./CardLayoutSelector";
import type { LayoutTemplate } from "@/types/docs";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarList } from "./SidebarList";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/components/analytics/trackEvent";

// --- Types ---

interface CardNavigatorProps {
  cards: Card[];
  onUpdateBlock: (cardId: string, blockId: string, content: any) => void;
  onDeleteRow: (cardId: string, rowId: string) => void;
  onAddColumn: (cardId: string, rowId: string, afterBlockId: string) => void;
  onAddRowAtTop: (cardId: string) => void;
  onAddRowAtBottom: (cardId: string) => void;
  onUpdateColumnWidths: (
    cardId: string,
    rowId: string,
    columnWidths: number[]
  ) => void;
  onAddCard: (afterCardId?: string) => void;
  onDeleteCard: (cardId: string) => void;
  isMobile?: boolean;
}

// --- Main Component ---

export const CardNavigator: React.FC<CardNavigatorProps> = ({
  cards,
  onUpdateBlock,
  onDeleteRow,
  onAddColumn,
  onAddRowAtTop,
  onAddRowAtBottom,
  onUpdateColumnWidths,
  onAddCard: onAddCardProp,
  onDeleteCard: onDeleteCardProp,
  isMobile = false,
}) => {
  // State
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
  const [pendingLayout, setPendingLayout] = useState<LayoutTemplate | null>(null);

  // Redux & Theme
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";
  const activeCardId = useAppSelector(selectActiveCardId);
  const dispatch = useAppDispatch();
  const previousActiveCardIdRef = useRef<string | null>(null);

  // Measurements
  const sidebarRef = useRef<HTMLDivElement>(null);
  const containerWidth = isMobile ? 240 : 180;

  // --- Effects ---

  // Handle pending layout application
  useEffect(() => {
    if (
      pendingLayout &&
      activeCardId &&
      activeCardId !== previousActiveCardIdRef.current
    ) {
      const rows = pendingLayout.data?.rows || [];
      const accent = pendingLayout.data?.accent;

      dispatch(replaceCardWithLayout({
        cardId: activeCardId,
        rows,
        accent
      }));
      setTimeout(() => setPendingLayout(null), 0);
    }
    previousActiveCardIdRef.current = activeCardId;
  }, [activeCardId, pendingLayout, dispatch]);

  // --- Handlers ---

  const handleAddCard = useCallback(() => {
    trackEvent('card_add_click', 'engagement', 'navigator');
    setIsLayoutModalOpen(true);
  }, []);

  const handleSelectLayout = useCallback((template: LayoutTemplate) => {
    setPendingLayout(template);
    onAddCardProp();
  }, [onAddCardProp]);

  const handleDeleteCard = useCallback((cardId: string) => {
    if (cards.length <= 1) return;
    trackEvent('card_delete_click', 'engagement', cardId);
    onDeleteCardProp(cardId);
  }, [onDeleteCardProp, cards.length]);

  return (
    <>
      <CardLayoutSelector
        isOpen={isLayoutModalOpen}
        onClose={() => setIsLayoutModalOpen(false)}
        onSelectLayout={handleSelectLayout}
      />

      <div className={cn(
        "relative h-full flex flex-col z-40 bg-transparent shrink-0",
        isMobile && "w-full"
      )}>
        <AnimatePresence mode="wait" initial={false}>
          {isCollapsed && !isMobile ? (
            <motion.div
              key="collapsed"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 60, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="h-full flex flex-col items-center pt-8 border-r overflow-hidden"
              style={{
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                backgroundColor: isDark ? "rgba(20, 20, 25, 0.5)" : "rgba(255, 255, 255, 0.5)",
              }}
            >
              <button
                onClick={() => {
                  trackEvent('navigator_expand', 'engagement', 'sidebar');
                  setIsCollapsed(false);
                }}
                className="p-3 rounded-xl transition-all hover:scale-105 hover:bg-black/5 dark:hover:bg-white/5"
              >
                <IconChevronRight size={20} style={{ color: theme.primary }} />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              ref={sidebarRef}
              initial={isMobile ? false : { width: 0, opacity: 0 }}
              animate={{ width: containerWidth, opacity: 1 }}
              exit={isMobile ? { opacity: 0 } : { width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={cn(
                "h-full relative flex flex-col overflow-hidden",
                !isMobile && "border-r"
              )}
              style={{
                backgroundColor: isDark ? "rgba(20, 20, 25, 0.85)" : "rgba(255, 255, 255, 0.85)",
                backdropFilter: isMobile ? "none" : "blur(20px)",
                borderRight: isMobile ? "none" : `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"}`,
              }}
            >
              <div
                className="relative flex items-center justify-between px-4 pt-5 pb-4 z-10 shrink-0"
                style={{ minWidth: containerWidth }}
              >
                <div className="flex flex-col">
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-0.5"
                    style={{ color: isDark ? "#fff" : "#000" }}
                  >
                    OUTLINE
                  </span>
                  <span className="text-xs font-semibold opacity-90" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>
                    {cards.length} {cards.length === 1 ? 'Card' : 'Cards'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handleAddCard}
                    className="p-2 rounded-xl transition-all hover:scale-105 hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 flex items-center justify-center"
                    title="Add card"
                  >
                    <IconPlus size={16} stroke={3}
                      style={{ color: isDark ? "#fff" : "#000" }}
                    />
                  </button>
                  {!isMobile && (
                    <button
                      onClick={() => {
                        trackEvent('navigator_collapse', 'engagement', 'sidebar');
                        setIsCollapsed(true);
                      }}
                      className="p-2 rounded-xl transition-all opacity-40 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10"
                      style={{ color: isDark ? "#fff" : "#000" }}
                      title="Collapse sidebar"
                    >
                      <IconChevronRight size={16} className="rotate-180" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col w-full h-full">
                <SidebarList
                  cards={cards}
                  containerWidth={containerWidth}
                  onUpdateBlock={onUpdateBlock}
                  onDeleteRow={onDeleteRow}
                  onAddColumn={onAddColumn}
                  onAddRowAtTop={onAddRowAtTop}
                  onAddRowAtBottom={onAddRowAtBottom}
                  onUpdateColumnWidths={onUpdateColumnWidths}
                  onDeleteCard={handleDeleteCard}
                />
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
