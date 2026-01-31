import React, { memo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, SolidBoxContent } from "@/types/docs";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/cardsSlice";
import { createSolidBoxItem } from "../definitions/solid-box-block";
import { IconPlus, IconX } from "@tabler/icons-react";

interface SolidBoxBlockProps {
  block: Block;
  onUpdate: (content: any) => void;
  theme?: Theme;
  readOnly?: boolean;
}

export const SolidBoxBlock = memo(function SolidBoxBlock({
  block,
  onUpdate,
  theme: themeProp,
  readOnly = false,
}: SolidBoxBlockProps) {
  const reduxTheme = useAppSelector(selectTheme);
  const theme = themeProp || reduxTheme || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";

  const content = block.content as SolidBoxContent;
  const items = content.items || [];

  const handleItemUpdate = (index: number, field: "title" | "description", value: any) => {
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
    onUpdate({
      ...content,
      items: [...items, createSolidBoxItem()],
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
      <div 
        className="grid gap-3"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))"
        }}
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            className="relative group/box-card p-6 transition-all duration-500 overflow-hidden rounded-3xl"
            style={{
              backgroundColor: theme.cardBackground,
            }}
          >
            {/* Remove Button */}
            {!readOnly && (
                <button
                    onClick={() => handleRemoveItem(index)}
                    className="absolute top-4 right-4 z-30 opacity-0 group-hover/box-card:opacity-100 transition-all p-1.5 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-500"
                >
                    <IconX size={16} stroke={2.5} />
                </button>
            )}

            <div className="relative z-10">
              {/* Title Section */}
              <div className="mb-2">
                <ProseMirrorEditor
                  key={`${item.id}-title`}
                  blockId={`${item.id}-title`}
                  value={item.title}
                  onChange={(value) => handleItemUpdate(index, "title", value)}
                  placeholder="Focus Title"
                  className="text-xl font-bold tracking-tight"
                  theme={{
                      ...theme,
                      headingColor: theme.primary,
                  }}
                  readOnly={readOnly}
                />
              </div>

              {/* Description Section */}
              <div>
                <ProseMirrorEditor
                  key={`${item.id}-description`}
                  blockId={`${item.id}-description`}
                  value={item.description}
                  onChange={(value) => handleItemUpdate(index, "description", value)}
                  placeholder="Details..."
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
