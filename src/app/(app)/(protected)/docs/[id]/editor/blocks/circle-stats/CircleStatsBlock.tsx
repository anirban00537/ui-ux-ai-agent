import React, { memo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, CircleStatsContent } from "@/types/docs";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/cardsSlice";
import { createCircleStatsItem } from "../definitions/circle-stats-block";
import { IconPlus, IconX } from "@tabler/icons-react";
import { getFontFamily } from "@/lib/fonts";
import { ProgressCircle } from "./ProgressCircle";

interface CircleStatsBlockProps {
  block: Block;
  onUpdate: (content: any) => void;
  theme?: Theme;
  readOnly?: boolean;
}

export const CircleStatsBlock = memo(function CircleStatsBlock({
  block,
  onUpdate,
  theme: themeProp,
  readOnly = false,
}: CircleStatsBlockProps) {
  const reduxTheme = useAppSelector(selectTheme);
  const theme = themeProp || reduxTheme || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";

  const content = block.content as CircleStatsContent;
  const items = content.items || [];

  const handleItemUpdate = (index: number, field: "title" | "description" | "value" | "suffix", value: any) => {
    if (readOnly) return;
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    onUpdate({
      ...content,
      items: newItems,
    });
  };

  const handleAddItem = () => {
    if (readOnly) return;
    const newItem = createCircleStatsItem(50);
    onUpdate({
      ...content,
      items: [...items, newItem],
    });
  };

  const handleRemoveItem = (index: number) => {
    if (readOnly) return;
    const newItems = items.filter((_, i) => i !== index);
    onUpdate({
      ...content,
      items: newItems,
    });
  };

  return (
    <div 
      className="group relative w-full h-full py-3"
      style={{
        fontFamily: getFontFamily(theme.fontFamily || "Inter"),
      }}
    >
      <style jsx global>{`
        .no-spinner::-webkit-inner-spin-button, 
        .no-spinner::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        .no-spinner {
          -moz-appearance: textfield;
        }
      `}</style>
      <div className="flex flex-wrap justify-center items-start gap-3">
        {items.map((item, index) => (
          <div key={item.id} className="relative group/item flex flex-col items-center min-w-[200px] flex-1 text-center p-6 rounded-3xl transition-all duration-500"
               style={{ backgroundColor: theme.cardBackground }}>
             
             {/* Progress Circle Container */}
             <div className="relative mb-4">
                <ProgressCircle value={item.value} theme={theme} />
                
                {/* Center Value Input */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="pointer-events-auto flex items-baseline">
                         <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.value}
                            onChange={(e) => {
                                let val = parseInt(e.target.value);
                                if (isNaN(val)) val = 0;
                                if (val > 100) val = 100;
                                if (val < 0) val = 0;
                                handleItemUpdate(index, "value", val);
                            }}
                            className="w-20 text-center bg-transparent border-none outline-none font-bold text-4xl p-0 no-spinner"
                            style={{ color: theme.headingColor || (isDark ? "#fff" : "#000") }}
                         />
                    </div>
                </div>

                {/* Remove Button */}
                {!readOnly && (
                    <button
                        onClick={() => handleRemoveItem(index)}
                        className="absolute top-0 right-0 opacity-0 group-hover/item:opacity-100 transition-all p-1.5 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-500"
                    >
                        <IconX size={16} stroke={2.5} />
                    </button>
                )}
             </div>

             {/* Title */}
             <div className="mb-2 w-full">
                <ProseMirrorEditor
                    key={`${item.id}-title`}
                    blockId={`${item.id}-title`}
                    value={item.title}
                    onChange={(value) => handleItemUpdate(index, "title", value)}
                    placeholder="Stat Title"
                    readOnly={readOnly}
                    theme={{
                        ...theme,
                        headingColor: theme.primary,
                    }}
                    className="text-xl font-bold tracking-tight text-center"
                />
             </div>

             {/* Description */}
             <div className="w-full">
                <ProseMirrorEditor
                    key={`${item.id}-description`}
                    blockId={`${item.id}-description`}
                    value={item.description}
                    onChange={(value) => handleItemUpdate(index, "description", value)}
                    placeholder="Description"
                    readOnly={readOnly}
                    theme={theme}
                    className="text-base opacity-60 leading-relaxed text-center"
                />
             </div>
          </div>
        ))}

        {/* Add Button - Corner positioned, icon only */}
        {!readOnly && (
          <button
            onClick={handleAddItem}
            className="absolute bottom-3 right-3 z-30 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg"
            style={{
              backgroundColor: theme.primary,
              color: theme.cardBackground,
            }}
            title="Add stat"
          >
            <IconPlus size={16} stroke={2.5} />
          </button>
        )}
      </div>
    </div>
  );
});
