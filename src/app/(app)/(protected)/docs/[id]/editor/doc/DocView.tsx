"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconChevronLeft, IconChevronRight, IconX } from "@tabler/icons-react";
import { Theme, Card } from "@/store/slices/cardsSlice";
import { trackEvent } from "@/components/analytics/trackEvent";
import { CardCanvas } from "..";

interface DocViewProps {
  isPresenting: boolean;
  cards: Card[];
  currentCardIndex: number;
  theme: Theme;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onPrevCard: () => void;
  onNextCard: () => void;
  onClose: () => void;
  onUpdateBlock: (cardId: string, blockId: string, content: any) => void;
  onDeleteRow: (cardId: string, rowId: string) => void;
  onAddColumn: (cardId: string, rowId: string, afterBlockId: string) => void;
  onAddRowAtTop: (cardId: string) => void;
  onAddRowAtBottom: (cardId: string) => void;
  onUpdateColumnWidths: (cardId: string, rowId: string, columnWidths: number[]) => void;
}

export const DocView: React.FC<DocViewProps> = ({
  isPresenting,
  cards,
  currentCardIndex,
  theme,
  containerRef,
  onPrevCard,
  onNextCard,
  onClose,
  onUpdateBlock,
  onDeleteRow,
  onAddColumn,
  onAddRowAtTop,
  onAddRowAtBottom,
  onUpdateColumnWidths,
}) => {
  const isDark = theme.themeType === "dark";

  return (
    <AnimatePresence>
      {isPresenting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          ref={containerRef}
          className={`doc-mode fixed inset-0 z-[100] overflow-y-auto ${
            isDark ? "custom-scrollbar-dark" : "custom-scrollbar-light"
          }`}
          style={{
            backgroundColor: theme.pageBackground,
          }}
        >
          {/* === MESH GRADIENT === */}
          {/* Primary blob - Top Left */}
          <div
            className="fixed -z-10 pointer-events-none"
            style={{
              width: "60vw",
              height: "60vh",
              top: "-20%",
              left: "-10%",
              background: `radial-gradient(circle at center, ${theme.primary}${isDark ? '12' : '08'} 0%, ${theme.primary}${isDark ? '05' : '03'} 40%, transparent 70%)`,
              filter: "blur(80px)",
              transform: "rotate(-15deg)",
            }}
          />
          
          {/* Secondary Color 1 blob - Top Right */}
          <div
            className="fixed -z-10 pointer-events-none"
            style={{
              width: "50vw",
              height: "50vh",
              top: "-15%",
              right: "-15%",
              background: `radial-gradient(circle at center, ${theme.secondaryColors?.[0] || theme.primary}${isDark ? '10' : '06'} 0%, ${theme.primary}${isDark ? '04' : '02'} 50%, transparent 70%)`,
              filter: "blur(100px)",
              transform: "rotate(20deg)",
            }}
          />
          
          {/* Secondary Color 2 accent - Left Center */}
          <div
            className="fixed -z-10 pointer-events-none"
            style={{
              width: "40vw",
              height: "70vh",
              top: "20%",
              left: "-15%",
              background: `radial-gradient(ellipse at center, ${theme.secondaryColors?.[1] || theme.primary}${isDark ? '10' : '06'} 0%, transparent 70%)`,
              filter: "blur(90px)",
            }}
          />
          
          {/* Primary glow - Right Center */}
          <div
            className="fixed -z-10 pointer-events-none"
            style={{
              width: "45vw",
              height: "60vh",
              top: "30%",
              right: "-10%",
              background: `radial-gradient(ellipse at center, ${theme.primary}${isDark ? '08' : '05'} 0%, ${theme.secondaryColors?.[0] || theme.primary}${isDark ? '03' : '02'} 50%, transparent 70%)`,
              filter: "blur(110px)",
              transform: "rotate(-10deg)",
            }}
          />
          
          {/* Primary blob - Bottom Left */}
          <div
            className="fixed -z-10 pointer-events-none"
            style={{
              width: "55vw",
              height: "55vh",
              bottom: "-20%",
              left: "-10%",
              background: `radial-gradient(circle at center, ${theme.primary}${isDark ? '12' : '08'} 0%, ${theme.secondaryColors?.[1] || theme.primary}${isDark ? '04' : '02'} 50%, transparent 70%)`,
              filter: "blur(100px)",
              transform: "rotate(25deg)",
            }}
          />
          
          {/* Secondary Color 1 accent - Bottom Right */}
          <div
            className="fixed -z-10 pointer-events-none"
            style={{
              width: "50vw",
              height: "50vh",
              bottom: "-15%",
              right: "-10%",
              background: `radial-gradient(circle at center, ${theme.secondaryColors?.[0] || theme.primary}${isDark ? '08' : '05'} 0%, ${theme.secondaryColors?.[1] || theme.primary}${isDark ? '04' : '02'} 40%, transparent 70%)`,
              filter: "blur(90px)",
              transform: "rotate(-20deg)",
            }}
          />
          
          {/* Primary center glow */}
          <div
            className="fixed -z-10 pointer-events-none"
            style={{
              width: "35vw",
              height: "35vh",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: `radial-gradient(circle at center, ${theme.primary}${isDark ? '06' : '04'} 0%, transparent 70%)`,
              filter: "blur(80px)",
            }}
          />

          {/* Subtle noise texture overlay */}
          <div
            className="fixed inset-0 -z-10 pointer-events-none opacity-[0.02]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundSize: "256px 256px",
            }}
          />

          {/* Minimal Navigation Controls */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-50">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl"
              style={{
                backgroundColor: isDark ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.9)",
              }}
            >
              <button
                onClick={() => {
                  trackEvent('doc_present_prev', 'engagement', `slide_${currentCardIndex}`);
                  onPrevCard();
                }}
                disabled={currentCardIndex === 0}
                className="p-1.5 rounded-full transition-all disabled:opacity-30"
                style={{ color: isDark ? "#fff" : "#000" }}
              >
                <IconChevronLeft size={18} />
              </button>

              <span
                className="text-sm font-medium tabular-nums min-w-[3rem] text-center"
                style={{ color: isDark ? "#fff" : "#000" }}
              >
                {currentCardIndex + 1} / {cards.length}
              </span>

              <button
                onClick={() => {
                  trackEvent('doc_present_next', 'engagement', `slide_${currentCardIndex}`);
                  onNextCard();
                }}
                disabled={currentCardIndex === cards.length - 1}
                className="p-1.5 rounded-full transition-all disabled:opacity-30"
                style={{ color: isDark ? "#fff" : "#000" }}
              >
                <IconChevronRight size={18} />
              </button>

              <div
                className="w-px h-4 mx-1"
                style={{ backgroundColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)" }}
              />

              <button
                onClick={() => {
                  trackEvent('doc_present_close', 'engagement', 'viewer');
                  onClose();
                }}
                className="p-1.5 rounded-full transition-all hover:opacity-70"
                style={{ color: isDark ? "#fff" : "#000" }}
              >
                <IconX size={18} />
              </button>
            </motion.div>
          </div>

          {/* Current Card - Full Width with Flexible Height */}
          <div
            className="min-h-screen w-full flex flex-col"
            style={{ fontFamily: `${theme.fontFamily}, sans-serif` }}
          >
            <AnimatePresence mode="wait">
              {cards[currentCardIndex] && (
                <motion.div
                  key={currentCardIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full min-h-screen"
                >
                  <CardCanvas
                    card={cards[currentCardIndex]}
                    onUpdateBlock={onUpdateBlock}
                    onDeleteRow={onDeleteRow}
                    onAddColumn={onAddColumn}
                    onAddRowAtTop={onAddRowAtTop}
                    onAddRowAtBottom={onAddRowAtBottom}
                    onUpdateColumnWidths={onUpdateColumnWidths}
                    enableDragHints={false}
                    readOnly={true}
                    fullWidth={true}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

