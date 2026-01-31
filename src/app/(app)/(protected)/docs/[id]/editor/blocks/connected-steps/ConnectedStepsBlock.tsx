import React, { memo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, ConnectedStepsContent } from "@/types/docs";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/cardsSlice";
import { createConnectedStepItem } from "../definitions/connected-steps-block";
import { IconPlus, IconX } from "@tabler/icons-react";
import { getFontFamily } from "@/lib/fonts";

interface ConnectedStepsBlockProps {
  block: Block;
  onUpdate: (content: any) => void;
  theme?: Theme;
  readOnly?: boolean;
}

export const ConnectedStepsBlock = memo(function ConnectedStepsBlock({
  block,
  onUpdate,
  theme: themeProp,
  readOnly = false,
}: ConnectedStepsBlockProps) {
  const reduxTheme = useAppSelector(selectTheme);
  const theme = themeProp || reduxTheme || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";

  // Cast content to our new type
  // Note: We need to ensure the type definition exists in types/doc.ts or locally extended
  // For now, we assume the content matches the structure we defined.
  const content = block.content as ConnectedStepsContent;
  const items = content.items || [];

  const handleItemUpdate = (index: number, field: "title" | "description", value: string) => {
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
    const lastIndex = items.length > 0 ? items.length : 0;
    const newItem = createConnectedStepItem(lastIndex);
    onUpdate({
      ...content,
      items: [...items, newItem],
    });
  };

  const handleRemoveItem = (index: number) => {
    if (readOnly) return;
    const newItems = items.filter((_: any, i: number) => i !== index);
    onUpdate({
      ...content,
      items: newItems,
    });
  };

  return (
    <div 
      className="group relative w-full h-full p-3"
      style={{
        fontFamily: getFontFamily(theme.fontFamily || "Inter"),
      }}
    >
      {/* Container for the timeline */}
      <div className="relative w-full mx-auto">
        
        {/* Continuous Vertical Line Background */}
        <div 
            className="absolute left-3 top-6 bottom-6 w-0.5 opacity-30"
            style={{ 
                background: theme.primary,
            }} 
        />

        {items.map((item: any, index: number) => (
          <div key={item.id} className="relative flex gap-3 mb-3 last:mb-0 group/item">
             {/* Left Column: Number Node */}
             <div className="relative z-10 flex-shrink-0">
                <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shadow-lg transition-transform duration-300 group-hover/item:scale-110"
                    style={{
                        backgroundColor: theme.primary,
                        color: theme.cardBackground,
                        boxShadow: `0 4px 12px ${theme.primary}40`,
                    }}
                >
                    {index + 1}
                </div>
             </div>

             {/* Right Column: Content */}
             <div 
                className="flex-1 pt-1 min-w-0 pb-3 last:pb-0"
             >
                <div className="relative">
                    {/* Remove Button */}
                    {!readOnly && (
                        <button
                            onClick={() => handleRemoveItem(index)}
                            className="absolute right-0 top-0 opacity-0 group-hover/item:opacity-100 transition-all p-1.5 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-500"
                        >
                            <IconX size={16} stroke={2.5} />
                        </button>
                    )}

                    {/* Title */}
                    <div className="mb-2 pr-8">
                        <ProseMirrorEditor
                            key={`${item.id}-title`}
                            blockId={`${item.id}-title`}
                            value={item.title}
                            onChange={(value) => handleItemUpdate(index, "title", value)}
                            placeholder="Step Title"
                            readOnly={readOnly}
                            theme={{
                                ...theme,
                                headingColor: theme.primary,
                            }}
                            className="text-xl font-bold tracking-tight"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <ProseMirrorEditor
                            key={`${item.id}-description`}
                            blockId={`${item.id}-description`}
                            value={item.description}
                            onChange={(value) => handleItemUpdate(index, "description", value)}
                            placeholder="Add details about this step..."
                            readOnly={readOnly}
                            theme={theme}
                            className="text-base opacity-60 leading-relaxed"
                        />
                    </div>
                </div>
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
                title="Add step"
            >
                <IconPlus size={16} stroke={2.5} />
            </button>
        )}

      </div>
    </div>
  );
});
