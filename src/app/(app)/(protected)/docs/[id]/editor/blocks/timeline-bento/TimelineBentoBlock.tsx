import React, { memo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, TimelineBentoContent } from "@/types/docs";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/cardsSlice";
import { createTimelineBentoItem } from "../definitions/timeline-bento-block";
import { IconPlus, IconX } from "@tabler/icons-react";

interface TimelineBentoBlockProps {
    block: Block;
    onUpdate: (content: any) => void;
    theme?: Theme;
    readOnly?: boolean;
}


export const TimelineBentoBlock = memo(function TimelineBentoBlock({
    block,
    onUpdate,
    theme: themeProp,
    readOnly = false,
}: TimelineBentoBlockProps) {
    const reduxTheme = useAppSelector(selectTheme);
    const theme = themeProp || reduxTheme || DEFAULT_THEME;
    const isDark = theme.themeType === "dark";

    const content = block.content as TimelineBentoContent;
    const items = content.items || [];
    
    // Use ref to always have the latest content to prevent stale closures
    const contentRef = React.useRef(content);
    React.useEffect(() => {
        contentRef.current = content;
    }, [content]);

    const handleItemUpdate = (index: number, field: "title" | "description", value: string) => {
        if (readOnly) return;
        
        // Get the latest content from ref to avoid stale closure
        const latestContent = contentRef.current;
        const latestItems = latestContent.items || [];
        
        const newItems = [...latestItems];
        newItems[index] = {
            ...newItems[index],
            [field]: value,
        };
        
        const updatedContent = {
            ...latestContent,
            items: newItems,
        };
        
        // Update the ref immediately
        contentRef.current = updatedContent;
        
        onUpdate(updatedContent);
    };

    const handleAddItem = () => {
        if (readOnly) return;
        const newItem = createTimelineBentoItem();
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
        <div className="group relative w-full h-full py-3">
            {/* Responsive Vertical Timeline Line */}
            <div
                className="absolute left-8 md:left-1/2 top-0 bottom-0 md:-translate-x-1/2"
                style={{
                    width: "2px",
                    background: `linear-gradient(180deg, transparent 0%, ${theme.primary} 15%, ${theme.primary} 85%, transparent 100%)`,
                    opacity: 0.5,
                }}
            />

            {/* Timeline Items */}
            <div className="relative space-y-3">
                {items.map((item, index) => {
                    const isLeft = index % 2 === 0;

                    return (
                        <div key={item.id} className="relative flex flex-col md:flex-row w-full items-start md:items-center">
                            {/* Left Side Container */}
                            <div className={`${isLeft ? 'w-full pl-20 pr-4 md:w-1/2 md:pl-0 md:pr-8 md:justify-end' : 'hidden md:flex md:w-1/2'} flex`}>
                                {isLeft && (
                                    <div className="w-full md:max-w-[90%]">
                                        <div
                                            className="relative group/timeline-card rounded-3xl p-6 transition-all duration-500"
                                            style={{
                                                backgroundColor: theme.cardBackground,
                                            }}
                                        >
                                            {/* Remove Button */}
                                            {!readOnly && (
                                                <button
                                                    onClick={() => handleRemoveItem(index)}
                                                    className="absolute top-4 right-4 z-30 opacity-0 group-hover/timeline-card:opacity-100 transition-all p-1.5 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-500"
                                                >
                                                    <IconX size={16} stroke={2.5} />
                                                </button>
                                            )}

                                            {/* Title Editor */}
                                            <div className="mb-2">
                                                <ProseMirrorEditor
                                                    key={`${item.id}-title-left-${index}`}
                                                    blockId={`${item.id}-title-left-${index}`}
                                                    value={item.title}
                                                    onChange={(value) => handleItemUpdate(index, "title", value)}
                                                    placeholder="Event"
                                                    readOnly={readOnly}
                                                    theme={{
                                                        ...theme,
                                                        headingColor: theme.primary,
                                                    }}
                                                    className="text-xl font-bold tracking-tight"
                                                />
                                            </div>

                                            {/* Description Editor */}
                                            <div>
                                                <ProseMirrorEditor
                                                    key={`${item.id}-description-left-${index}`}
                                                    blockId={`${item.id}-description-left-${index}`}
                                                    value={item.description}
                                                    onChange={(value) => handleItemUpdate(index, "description", value)}
                                                    placeholder="Details..."
                                                    readOnly={readOnly}
                                                    theme={theme}
                                                    className="text-base leading-relaxed opacity-60"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                             {/* Timeline Dot */}
                             <div
                                 className="absolute left-8 md:left-1/2 md:-translate-x-1/2 z-10 top-8 md:top-1/2 md:-translate-y-1/2"
                                 style={{
                                     width: "12px",
                                     height: "12px",
                                 }}
                             >
                                 <div
                                     className="w-full h-full rounded-full transition-transform duration-500"
                                     style={{
                                         backgroundColor: theme.primary,
                                     }}
                                 />
                             </div>

                            {/* Right Side Container */}
                            <div className={`${!isLeft ? 'w-full pl-20 pr-4 md:w-1/2 md:pl-8 md:justify-start' : 'hidden md:flex md:w-1/2'} flex`}>
                                {!isLeft && (
                                    <div className="w-full md:max-w-[90%]">
                                        <div
                                            className="relative group/timeline-card rounded-3xl p-6 transition-all duration-500"
                                            style={{
                                                backgroundColor: theme.cardBackground,
                                            }}
                                        >
                                            {/* Remove Button */}
                                            {!readOnly && (
                                                <button
                                                    onClick={() => handleRemoveItem(index)}
                                                    className="absolute top-4 right-4 z-30 opacity-0 group-hover/timeline-card:opacity-100 transition-all p-1.5 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-500"
                                                >
                                                    <IconX size={16} stroke={2.5} />
                                                </button>
                                            )}

                                            {/* Title Editor */}
                                            <div className="mb-2">
                                                <ProseMirrorEditor
                                                    key={`${item.id}-title-right-${index}`}
                                                    blockId={`${item.id}-title-right-${index}`}
                                                    value={item.title}
                                                    onChange={(value) => handleItemUpdate(index, "title", value)}
                                                    placeholder="Event"
                                                    readOnly={readOnly}
                                                    theme={{
                                                        ...theme,
                                                        headingColor: theme.primary,
                                                    }}
                                                    className="text-xl font-bold tracking-tight"
                                                />
                                            </div>

                                            {/* Description Editor */}
                                            <div>
                                                <ProseMirrorEditor
                                                    key={`${item.id}-description-right-${index}`}
                                                    blockId={`${item.id}-description-right-${index}`}
                                                    value={item.description}
                                                    onChange={(value) => handleItemUpdate(index, "description", value)}
                                                    placeholder="Details..."
                                                    readOnly={readOnly}
                                                    theme={theme}
                                                    className="text-base leading-relaxed opacity-60"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
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
                    title="Add event"
                >
                    <IconPlus size={16} stroke={2.5} />
                </button>
            )}
        </div>
    );
});
