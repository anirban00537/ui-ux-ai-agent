import React, { useState, useRef, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/cardsSlice";
import { ButtonBlockContent } from "@/types/docs/schemas/blocks";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  IconLink, 
  IconAlignLeft, 
  IconAlignCenter, 
  IconAlignRight,
  IconSquare,
  IconSquareCheck,
  IconTrash
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { BlockRendererProps } from "@/app/(app)/(protected)/docs/[id]/engine";

export const ButtonBlock: React.FC<BlockRendererProps> = ({
  block,
  onUpdate,
  readOnly,
}) => {
  const content = block.content as ButtonBlockContent;
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";
  const [isOpen, setIsOpen] = useState(false);
  
  // Local state for immediate feedback
  const [text, setText] = useState(content.text);
  const [link, setLink] = useState(content.link || "");

  useEffect(() => {
    setText(content.text);
    setLink(content.link || "");
  }, [content.text, content.link]);

  const handleUpdate = (updates: Partial<ButtonBlockContent>) => {
    onUpdate({
      ...content,
      ...updates,
      type: "button-block",
    });
  };

  const getButtonStyle = () => {
    const baseStyle = {
      padding: "6px 16px",
      borderRadius: "8px",
      fontWeight: 500,
      fontSize: "14px",
      transition: "all 0.2s ease",
      cursor: readOnly ? "default" : "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      textDecoration: "none",
    };

    if (content.style === "outline") {
      return {
        ...baseStyle,
        backgroundColor: "transparent",
        color: theme.primary,
        border: `2px solid ${theme.primary}`,
      };
    }

    return {
      ...baseStyle,
      backgroundColor: theme.primary,
      color: "#ffffff",
      border: "2px solid transparent",
    };
  };

  const alignmentClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  if (readOnly) {
    return (
      <div className={`w-full flex ${alignmentClasses[content.alignment] || "justify-center"}`}>
        <a 
          href={content.link || "#"} 
          target="_blank" 
          rel="noopener noreferrer"
          style={getButtonStyle()}
          onClick={(e) => !content.link && e.preventDefault()}
        >
          {content.text}
        </a>
      </div>
    );
  }

  return (
    <div className={`w-full flex ${alignmentClasses[content.alignment] || "justify-center"} py-2`}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative group">
            <input
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                handleUpdate({ text: e.target.value });
              }}
              className="outline-none bg-transparent min-w-[120px] text-center"
              style={getButtonStyle()}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl flex flex-col gap-3"
          sideOffset={8}
        >
          {/* Link Input */}
          <div className="flex items-center gap-2 px-2 py-1.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <input 
              className="flex-1 bg-transparent text-sm outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
              placeholder="Paste a link, then hit enter"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleUpdate({ link: link });
                  e.currentTarget.blur();
                }
              }}
              onBlur={() => handleUpdate({ link: link })}
            />
          </div>

          <div className="flex items-center justify-between">
            {/* Style Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 font-medium">Style</span>
              <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-md p-1 gap-1">
                <button
                  onClick={() => handleUpdate({ style: "filled" })}
                  className={cn(
                    "p-1 rounded hover:bg-white dark:hover:bg-zinc-700 transition-colors",
                    content.style === "filled" && "bg-white dark:bg-zinc-700 shadow-sm text-blue-600"
                  )}
                >
                  <div className="w-4 h-3 bg-current rounded-sm border border-current opacity-80" />
                </button>
                <button
                  onClick={() => handleUpdate({ style: "outline" })}
                  className={cn(
                    "p-1 rounded hover:bg-white dark:hover:bg-zinc-700 transition-colors",
                    content.style === "outline" && "bg-white dark:bg-zinc-700 shadow-sm text-blue-600"
                  )}
                >
                  <div className="w-4 h-3 rounded-sm border-2 border-current opacity-80" />
                </button>
              </div>
            </div>

            {/* Alignment */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => handleUpdate({ alignment: "left" })}
                  className={cn("p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800", content.alignment === "left" && "text-blue-600 bg-zinc-50 dark:bg-zinc-800")}
                >
                  <IconAlignLeft size={16} />
                </button>
                <button 
                  onClick={() => handleUpdate({ alignment: "center" })}
                  className={cn("p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800", content.alignment === "center" && "text-blue-600 bg-zinc-50 dark:bg-zinc-800")}
                >
                  <IconAlignCenter size={16} />
                </button>
                <button 
                  onClick={() => handleUpdate({ alignment: "right" })}
                  className={cn("p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800", content.alignment === "right" && "text-blue-600 bg-zinc-50 dark:bg-zinc-800")}
                >
                  <IconAlignRight size={16} />
                </button>
              </div>
            </div>
          </div>

           {/* Color Selector */}
           <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 font-medium">Color</span>
             <button className="flex items-center gap-2 px-2 py-1 rounded-full border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              <div className="w-4 h-4 rounded bg-pink-500" />
              <span className="text-xs font-medium">Default</span>
            </button>
          </div>

          <div className="h-px w-full bg-zinc-100 dark:bg-zinc-800 my-1" />

          {/* Delete Button */}
           <button 
            className="flex items-center justify-center gap-2 w-full py-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-sm transition-colors"
            onClick={() => {
              // The delete action is typically handled by the parent or a separate toolbar, 
              // but for this specific "popover" design, it might invoke a delete callback if available.
              // Since BlockRendererProps doesn't expose a delete method directly, we might need to skip this or mock it.
              // For now, let's leave it as visual or implement if we have a way.
              // Actually, we can't easily self-delete from here without a prop.
            }}
           >
            <IconTrash size={14} />
            Delete
          </button>

        </PopoverContent>
      </Popover>
    </div>
  );
};
