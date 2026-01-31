import React from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { addRowWithColumnsAtIndex, selectActiveCardId, selectTheme, DEFAULT_THEME } from "@/store/slices/cardsSlice";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trackEvent } from "@/components/analytics/trackEvent";
import { BLOCK_TYPES } from "../blocks/definitions";
import {
  IconNumber,
  IconLayersIntersect,
  IconBoxModel,
  IconStar,
  IconLayoutSidebarLeftCollapse,
  IconLeaf,
  IconTimelineEvent,
  IconListNumbers,
  IconChartDonut,
} from "@tabler/icons-react";
import { LayoutOption } from "../block-ui/LayoutOption";
import { cn } from "@/lib/utils";

interface LayoutsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLayoutSelect?: (layout: LayoutDefinition) => void;
}


export interface LayoutDefinition {
  id: string;
  blockType: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  columnCount?: number;
}

const masterLayouts: LayoutDefinition[] = [
  {
    id: "simple-number-grid",
    blockType: BLOCK_TYPES.SIMPLE_NUMBER_CARD,
    icon: <IconNumber size={18} />,
    label: "Simple Number Grid",
    description: "Grid of minimalist number cards",
    columnCount: 1,
  },
  {
    id: "layered-steps",
    blockType: BLOCK_TYPES.LAYERED_NUMBER_BLOCK,
    icon: <IconLayersIntersect size={18} />,
    label: "Layered Steps",
    description: "Grid of high-depth numbered cards",
    columnCount: 1,
  },
  {
    id: "timeline-bento",
    blockType: BLOCK_TYPES.TIMELINE_BENTO_BLOCK,
    icon: <IconTimelineEvent size={18} />,
    label: "Timeline Bento",
    description: "Bento grid with timeline",
    columnCount: 1,
  },
  {
    id: "stacked-timeline",
    blockType: BLOCK_TYPES.STACKED_TIMELINE_BLOCK,
    icon: <IconLayersIntersect size={18} />,
    label: "Stacked Timeline",
    description: "Vertical stacked timeline",
    columnCount: 1,
  },
  {
    id: "leaf-grid",
    blockType: BLOCK_TYPES.LEAF_BLOCK,
    icon: <IconLeaf size={18} />,
    label: "Leaf Grid",
    description: "Internal grid of leaf cards",
    columnCount: 1,
  },
  {
    id: "side-accent-grid",
    blockType: BLOCK_TYPES.SIDELINE_CARD_BLOCK,
    icon: <IconLayoutSidebarLeftCollapse size={18} />,
    label: "Side Accent Grid",
    description: "Grid of elegant side-accent cards",
    columnCount: 1,
  },
  {
    id: "icon-grid",
    blockType: BLOCK_TYPES.SOLID_ICON_BOX_BLOCK,
    icon: <IconStar size={18} />,
    label: "Icon Grid",
    description: "Grid of featured icon cards",
    columnCount: 1,
  },
  {
    id: "focus-grid",
    blockType: BLOCK_TYPES.SOLID_BOX_BLOCK,
    icon: <IconBoxModel size={18} />,
    label: "Focus Grid",
    description: "Grid of clean focus cards",
    columnCount: 1,
  },
  {
    id: "connected-steps",
    blockType: BLOCK_TYPES.CONNECTED_STEPS_BLOCK,
    icon: <IconListNumbers size={18} />,
    label: "Connected Steps",
    description: "Vertical connected step list",
    columnCount: 1,
  },
  {
    id: "circle-stats",
    blockType: BLOCK_TYPES.CIRCLE_STATS_BLOCK,
    icon: <IconChartDonut size={18} />,
    label: "Circle Stats",
    description: "Circular progress indicators",
    columnCount: 1,
  },
];


export function LayoutsPanel({ isOpen, onClose, onLayoutSelect }: LayoutsPanelProps) {
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const activeCardId = useAppSelector(selectActiveCardId);
  const dispatch = useAppDispatch();
  const isDark = theme.themeType === "dark";

  const handleLayoutClick = (layout: LayoutDefinition) => {
    if (onLayoutSelect) {
      onLayoutSelect(layout);
      onClose();
      return;
    }

    if (!activeCardId) return;

    trackEvent('layout_select', 'engagement', layout.id);
    dispatch(
      addRowWithColumnsAtIndex({
        cardId: activeCardId,
        columnCount: layout.columnCount || 3,
        insertIndex: 999,
        blockType: layout.blockType,
      })
    );

    onClose();
  };

  const panelVariants = {
    hidden: {
      opacity: 0,
      y: 10,
      scale: 0.98,
      transition: { duration: 0.15 },
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.2 },
    },
    exit: {
      opacity: 0,
      y: 10,
      scale: 0.98,
      transition: { duration: 0.15 },
    },
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="layouts-panel"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={panelVariants}
          className="relative z-40"
        >
          <div className={cn(
            "relative w-[400px] max-h-[60vh] flex flex-col rounded-2xl overflow-hidden backdrop-blur-xl border shadow-2xl",
            isDark 
              ? "bg-[#1a1a1f]/95 border-white/10" 
              : "bg-white/95 border-black/10"
          )}>
            {/* Header */}
            <div className={cn(
              "relative px-4 py-3 flex items-center justify-between shrink-0 border-b",
              isDark ? "border-white/5" : "border-black/5"
            )}>
              <span className={cn(
                "text-sm font-semibold",
                isDark ? "text-white" : "text-black"
              )}>
                Add Layout
              </span>
              <button
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  isDark 
                    ? "text-white/40 hover:text-white hover:bg-white/10" 
                    : "text-black/40 hover:text-black hover:bg-black/5"
                )}
                onClick={onClose}
              >
                <X size={16} />
              </button>
            </div>

            {/* Layouts Grid */}
            <div className={cn(
              "relative flex-1 overflow-y-auto px-3 pb-3",
              isDark ? "custom-scrollbar-dark" : "custom-scrollbar-light"
            )}>
              <div className="space-y-5 pt-3">
                <div>
                  <h3 className={cn(
                    "text-[10px] uppercase tracking-wider font-semibold mb-2 px-1 font-mono",
                    isDark ? "text-white/30" : "text-black/30"
                  )}>
                    Master Layouts
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {masterLayouts.map((layout) => (
                      <div
                        key={layout.id}
                        onClick={() => handleLayoutClick(layout)}
                        className="cursor-pointer"
                      >
                        <LayoutOption
                          id={layout.id}
                          icon={layout.icon}
                          label={layout.label}
                          blockType={layout.blockType}
                          columnCount={layout.columnCount || 1}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
