import React, { memo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, LayeredNumberContent } from "@/types/docs";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/cardsSlice";
import { createLayeredNumberItem } from "../definitions/layered-number-block";
import { IconPlus, IconX } from "@tabler/icons-react";

interface LayeredNumberBlockProps {
  block: Block;
  onUpdate: (content: any) => void;
  theme?: Theme;
  readOnly?: boolean;
}

export const LayeredNumberBlock = memo(function LayeredNumberBlock({
  block,
  onUpdate,
  theme: themeProp,
  readOnly = false,
}: LayeredNumberBlockProps) {
  const reduxTheme = useAppSelector(selectTheme);
  const theme = themeProp || reduxTheme || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";

  const content = block.content as LayeredNumberContent;
  const items = content.items || [];

  const handleItemUpdate = (index: number, field: "number" | "title" | "description", value: any) => {
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
    const lastNumber = items.length > 0 ? items[items.length - 1].number : 0;
    onUpdate({
      ...content,
      items: [...items, createLayeredNumberItem(lastNumber + 1)],
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
    <div className="group relative w-full h-full p-3">
        <style dangerouslySetInnerHTML={{ __html: `
          .no-spinner::-webkit-outer-spin-button,
          .no-spinner::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          .no-spinner {
            -moz-appearance: textfield;
          }
        `}} />

      <div 
        className="grid gap-3"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))"
        }}
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            className="relative group/layered p-6 transition-all duration-500 overflow-hidden rounded-3xl"
            style={{
              backgroundColor: theme.cardBackground,
            }}
          >
            {/* Remove Button */}
            {!readOnly && (
                <button
                    onClick={() => handleRemoveItem(index)}
                    className="absolute top-4 right-4 z-30 opacity-0 group-hover/layered:opacity-100 transition-all p-1.5 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-500"
                >
                    <IconX size={16} stroke={2.5} />
                </button>
            )}

            <div className="relative z-10 flex flex-col h-full">
              {/* Number Badge */}
              <div className="mb-4">
                <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shadow-lg transition-transform duration-300 group-hover/layered:scale-110"
                    style={{
                        backgroundColor: theme.primary,
                        color: theme.cardBackground,
                        boxShadow: `0 4px 12px ${theme.primary}40`,
                    }}
                >
                    <input 
                        type="number"
                        value={item.number}
                        onChange={(e) => handleItemUpdate(index, "number", parseInt(e.target.value, 10) || 0)}
                        disabled={readOnly}
                        className="bg-transparent text-center w-full h-full outline-none no-spinner font-black"
                        style={{ color: theme.cardBackground }}
                    />
                </div>
              </div>

              {/* Title Section */}
              <div className="mb-2">
                <ProseMirrorEditor
                  key={`${item.id}-title`}
                  blockId={`${item.id}-title`}
                  value={item.title}
                  onChange={(value) => handleItemUpdate(index, "title", value)}
                  placeholder="Core Step"
                  className="text-xl font-bold tracking-tight"
                  theme={{
                      ...theme,
                      headingColor: theme.primary,
                  }}
                  readOnly={readOnly}
                />
              </div>

              {/* Description Section */}
              <div className="flex-1">
                <ProseMirrorEditor
                  key={`${item.id}-description`}
                  blockId={`${item.id}-description`}
                  value={item.description}
                  onChange={(value) => handleItemUpdate(index, "description", value)}
                  placeholder="Explain the step..."
                  className="text-base leading-relaxed opacity-60"
                  theme={theme}
                  readOnly={readOnly}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Button - Corner positioned, icon only */}
      {!readOnly && (
        <button
          onClick={handleAddItem}
          className="absolute bottom-3 right-3 z-30 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg"
          style={{
            backgroundColor: theme.primary,
            color: theme.cardBackground,
          }}
          title="Add item"
        >
          <IconPlus size={16} stroke={2.5} />
        </button>
      )}
    </div>
  );
});
