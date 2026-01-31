import React, { memo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, LeafBlockContent } from "@/types/docs";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/cardsSlice";
import { createLeafItem } from "../definitions/leaf-block";
import { IconPlus, IconX } from "@tabler/icons-react";

interface LeafBlockProps {
    block: Block;
    onUpdate: (content: any) => void;
    theme?: Theme;
    readOnly?: boolean;
}

export const LeafBlock = memo(function LeafBlock({
    block,
    onUpdate,
    theme: themeProp,
    readOnly = false,
}: LeafBlockProps) {
    const reduxTheme = useAppSelector(selectTheme);
    const theme = themeProp || reduxTheme || DEFAULT_THEME;
    const isDark = theme.themeType === "dark";

    const content = block.content as LeafBlockContent;
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
        onUpdate({
            ...content,
            items: [...items, createLeafItem()],
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
                        className="relative group/leaf p-6 transition-all duration-500 overflow-hidden"
                        style={{
                            backgroundColor: theme.cardBackground,
                            // Leaf shape: rounded on top-left and bottom-right, sharp on others
                            borderRadius: "2rem 0.5rem 2rem 0.5rem",
                        }}
                    >
                        {/* Remove Button */}
                        {!readOnly && (
                            <button
                                onClick={() => handleRemoveItem(index)}
                                className="absolute top-4 right-4 z-30 opacity-0 group-hover/leaf:opacity-100 transition-all p-1.5 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-500"
                            >
                                <IconX size={16} stroke={2.5} />
                            </button>
                        )}

                        {/* Title Section */}
                        <div className="mb-2">
                            <ProseMirrorEditor
                                key={`${item.id}-title`}
                                blockId={`${item.id}-title`}
                                value={item.title}
                                onChange={(value) => handleItemUpdate(index, "title", value)}
                                placeholder="Leaf Title"
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
                                placeholder="Describe this leaf..."
                                className="text-base leading-relaxed opacity-60"
                                theme={theme}
                                readOnly={readOnly}
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
