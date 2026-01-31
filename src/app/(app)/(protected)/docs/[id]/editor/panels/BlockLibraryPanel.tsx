import React from "react";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/cardsSlice";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BlockOption } from "../block-ui/BlockOption";
import { BLOCK_DEFINITIONS } from "@/app/(app)/(protected)/docs/[id]/engine";
import { cn } from "@/lib/utils";

interface BlockLibraryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LibraryItem {
  type: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  category: "Core" | "Callouts" | "Cards & Boxes" | "Interactive" | "Format" | "Data";
  initialContent?: any;
}

const generateLibraryItems = (): LibraryItem[] => {
  return Object.values(BLOCK_DEFINITIONS).flatMap((def) => {
    if (def.presets && def.presets.length > 0) {
      return def.presets.map((preset) => {
        const Icon = preset.icon || def.icon;
        return {
          type: def.type,
          icon: Icon ? <Icon size={18} /> : null,
          label: preset.label,
          description: preset.description,
          category: def.category,
          initialContent: preset.createContent(),
        };
      });
    }

    const Icon = def.icon;
    return [{
      type: def.type,
      icon: Icon ? <Icon size={18} /> : null,
      label: def.label,
      description: def.description,
      category: def.category,
      initialContent: def.createContent(),
    }];
  });
};

const blockDefinitions = generateLibraryItems();

export const BlockLibraryPanel: React.FC<BlockLibraryPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";

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
          key="blocks-panel"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={panelVariants}
          className="relative z-40"
        >
          <div
            className={cn(
              "relative w-[400px] max-h-[60vh] flex flex-col rounded-2xl overflow-hidden backdrop-blur-xl border shadow-2xl",
              isDark 
                ? "bg-[#1a1a1f]/95 border-white/10" 
                : "bg-white/95 border-black/10"
            )}
          >
            {/* Header */}
            <div className={cn(
              "relative px-4 py-3 flex items-center justify-between shrink-0 border-b",
              isDark ? "border-white/5" : "border-black/5"
            )}>
              <span className={cn(
                "text-sm font-semibold",
                isDark ? "text-white" : "text-black"
              )}>
                Insert Block
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

            {/* Blocks Grid */}
            <div className={cn(
              "relative flex-1 overflow-y-auto px-3 pb-3",
              isDark ? "custom-scrollbar-dark" : "custom-scrollbar-light"
            )}>
              <p className={cn(
                "text-[11px] font-medium my-3 px-1",
                isDark ? "text-white/40" : "text-black/40"
              )}>
                Drag to add to your slide
              </p>
              <div className="space-y-5">
                {Array.from(new Set(blockDefinitions.map(b => b.category))).map(category => (
                  <div key={category}>
                    <h3 className={cn(
                      "text-[10px] uppercase tracking-wider font-semibold mb-2 px-1 font-mono",
                      isDark ? "text-white/30" : "text-black/30"
                    )}>
                      {category}
                    </h3>
                    <div className="grid grid-cols-4 gap-1">
                      {blockDefinitions
                        .filter(b => b.category === category)
                        .map((block, index) => (
                          <BlockOption
                            key={`${block.type}-${index}`}
                            id={`block-option-${block.type}-${index}`}
                            blockType={block.type}
                            icon={block.icon}
                            label={block.label}
                            initialContent={block.initialContent}
                          />
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
