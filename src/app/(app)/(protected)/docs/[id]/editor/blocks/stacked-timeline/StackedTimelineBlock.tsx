import React, { memo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type {
  Block,
  Theme,
  StackedTimelineContent,
} from "@/types/docs";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/cardsSlice";
import { createStackedTimelineItem } from "../definitions/stacked-timeline-block";
import { IconPlus, IconX } from "@tabler/icons-react";
import { getFontFamily } from "@/lib/fonts";

interface StackedTimelineBlockProps {
  block: Block;
  onUpdate: (content: any) => void;
  theme?: Theme;
  readOnly?: boolean;
}

export const StackedTimelineBlock = memo(function StackedTimelineBlock({
  block,
  onUpdate,
  theme: themeProp,
  readOnly = false,
}: StackedTimelineBlockProps) {
  const reduxTheme = useAppSelector(selectTheme);
  const theme = themeProp || reduxTheme || DEFAULT_THEME;

  const content = block.content as StackedTimelineContent;
  const items = content.items || [];

  const handleItemUpdate = (
    index: number,
    field: "title" | "description",
    value: string
  ) => {
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
    const newItem = createStackedTimelineItem();
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
      className="group relative w-full h-full py-4 pl-10 pr-4"
      style={{
        fontFamily: getFontFamily(theme.fontFamily || "Inter"),
      }}
    >
      {/* Fused List Container */}
      <div className="relative flex flex-col rounded-3xl overflow-visible">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="group/card relative p-6 transition-all duration-500 first:rounded-t-3xl last:rounded-b-3xl"
            style={{
              backgroundColor: theme.cardBackground,
              // Modern Divider
              borderBottom:
                index < items.length - 1
                  ? `1px solid ${theme.primary}20`
                  : "none",
            }}
          >
            {/* Number Badge - Half Out */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center text-lg font-black shadow-lg transition-transform duration-300 group-hover/card:scale-110 z-20 border-4"
              style={{
                background: theme.primary,
                color: theme.cardBackground,
                borderColor: theme.pageBackground, // Matches page bg to look "cut out"
                boxShadow: `0 4px 12px ${theme.primary}40`,
              }}
            >
              {index + 1}
            </div>

            {/* Remove Button */}
            {!readOnly && (
              <button
                onClick={() => handleRemoveItem(index)}
                className="absolute top-4 right-4 opacity-0 group-hover/card:opacity-100 transition-all p-1.5 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-500 z-10"
              >
                <IconX size={16} stroke={2.5} />
              </button>
            )}

            {/* Content - Shifted for visual balance */}
            <div className="pl-6 flex flex-col justify-center min-h-[3rem] space-y-1">
              <ProseMirrorEditor
                key={`${item.id}-title`}
                blockId={`${item.id}-title`}
                value={
                  typeof item.title === "string"
                    ? item.title
                    : JSON.stringify(item.title)
                }
                onChange={(value) => handleItemUpdate(index, "title", value)}
                placeholder="Item Title"
                readOnly={readOnly}
                theme={{
                  ...theme,
                  headingColor: theme.primary,
                }}
                className="text-xl font-bold tracking-tight"
              />
              <ProseMirrorEditor
                key={`${item.id}-description`}
                blockId={`${item.id}-description`}
                value={
                  typeof item.description === "string"
                    ? item.description
                    : JSON.stringify(item.description)
                }
                onChange={(value) =>
                  handleItemUpdate(index, "description", value)
                }
                placeholder="Description goes here..."
                readOnly={readOnly}
                theme={theme}
                className="text-base leading-relaxed opacity-60"
              />
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
