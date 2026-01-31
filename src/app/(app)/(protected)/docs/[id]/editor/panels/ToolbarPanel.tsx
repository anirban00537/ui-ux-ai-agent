import React, { useState, useEffect } from "react";
import { IconPalette, IconBlocks, IconPhoto, IconLayoutGrid, IconX } from "@tabler/icons-react";
import { ThemeSelectorPanel } from "./ThemeSelectorPanel";
import { BlockLibraryPanel } from "./BlockLibraryPanel";
import { LayoutsPanel, type LayoutDefinition } from "./LayoutsPanel";
import { ImageLibraryPanel } from "./ImageLibraryPanel";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/cardsSlice";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/components/analytics/trackEvent";

interface ToolbarPanelProps {
  docId: string;
  onLayoutSelect?: (layout: LayoutDefinition) => void;
}

// Toolbar buttons with icons and labels
const TOOLBAR_ITEMS = [
  { id: "insert", icon: IconBlocks, label: "Insert" },
  { id: "layouts", icon: IconLayoutGrid, label: "Layouts" },
  { id: "theme", icon: IconPalette, label: "Theme" },
  { id: "images", icon: IconPhoto, label: "Images" },
];

export const ToolbarPanel: React.FC<ToolbarPanelProps> = ({
  docId,
  onLayoutSelect,
}) => {
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";
  const [activePanel, setActivePanel] = useState<string | null>(null);

  // Close panels when clicking outside
  useEffect(() => {
    if (activePanel) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (
          !target.closest('[data-floating-toolbar]') &&
          !target.closest('[data-toolbar-panel]')
        ) {
          setActivePanel(null);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [activePanel]);

  const handleTogglePanel = (panelId: string) => {
    const isOpening = activePanel !== panelId;
    if (isOpening) {
      trackEvent('toolbar_panel_open', 'engagement', panelId);
    }
    setActivePanel(prev => prev === panelId ? null : panelId);
  };

  return (
    <>
      {/* Toolbar - Bottom on mobile, Right side on desktop */}
      <div
        data-floating-toolbar
        className="fixed bottom-6 left-1/2 -translate-x-1/2 lg:bottom-auto lg:left-auto lg:right-6 lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0 z-[45]"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "flex lg:flex-col items-center gap-1 px-2 py-1.5 lg:p-1.5 rounded-2xl backdrop-blur-xl shadow-2xl border",
            isDark 
              ? "bg-[#1a1a1f]/95 border-white/10" 
              : "bg-white/95 border-black/10"
          )}
        >
          {TOOLBAR_ITEMS.map((item) => {
            const isActive = activePanel === item.id;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => handleTogglePanel(item.id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 px-3 py-2.5 lg:w-16 lg:py-3 rounded-xl text-[10px] font-medium transition-all shrink-0",
                  isActive 
                    ? "bg-primary text-white" 
                    : isDark
                      ? "text-white/70 hover:text-white hover:bg-white/10"
                      : "text-black/70 hover:text-black hover:bg-black/5"
                )}
              >
                <Icon size={18} stroke={1.5} className="lg:w-5 lg:h-5" />
                <span className="hidden xs:inline">{item.label}</span>
              </button>
            );
          })}
        </motion.div>
      </div>

      {/* Panels - Slide up on mobile, Slide from right on desktop */}
      <AnimatePresence>
        {activePanel && (
          <motion.div
            data-toolbar-panel
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 lg:bottom-auto lg:left-auto lg:right-28 lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0 z-[50]"
          >
            <div className="relative">
              {activePanel === "insert" && (
                <BlockLibraryPanel
                  isOpen={true}
                  onClose={() => setActivePanel(null)}
                />
              )}

              {activePanel === "layouts" && (
                <LayoutsPanel
                  isOpen={true}
                  onClose={() => setActivePanel(null)}
                  onLayoutSelect={onLayoutSelect}
                />
              )}

              {activePanel === "theme" && (
                <ThemeSelectorPanel
                  isOpen={true}
                  onClose={() => setActivePanel(null)}
                />
              )}

              {activePanel === "images" && (
                <ImageLibraryPanel
                  isOpen={true}
                  onClose={() => setActivePanel(null)}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
