import React from "react";
import { Plus, LayoutGrid, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEditorTheme } from "@/app/(app)/(protected)/docs/[id]/editor";

interface CardActionBarProps {
  onAddBlank: () => void;
  onAddTemplate: () => void;
  onAddAI?: () => void;
  className?: string;
  disabled?: boolean;
}

export const CardActionBar: React.FC<CardActionBarProps> = ({
  onAddBlank,
  onAddTemplate,
  onAddAI,
  className,
  disabled = false,
}) => {
  const theme = useEditorTheme();
  const isDark = theme.themeType === "dark";

  const buttonClass = cn(
    "flex items-center justify-center p-2 transition-all duration-200",
    "hover:scale-110 active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
    isDark
      ? "text-white/60 hover:text-white hover:bg-white/10"
      : "text-black/60 hover:text-black hover:bg-black/5"
  );

  return (
    <div
      className={cn(
        "group/action-bar relative flex items-center justify-center py-2 transition-opacity duration-300",
        className
      )}
    >
      {/* Button Group */}
      <div
        className={cn(
          "relative flex items-center gap-1 p-1.5 rounded-full shadow-sm border backdrop-blur-md",
          isDark
            ? "bg-[#1e1e24] border-white/10 shadow-black/20"
            : "bg-white border-black/5 shadow-black/5"
        )}
      >
        <button
          onClick={onAddBlank}
          disabled={disabled}
          className={cn(buttonClass, "rounded-full")}
          title="Add Blank Card"
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>

        <div className={cn("w-px h-4 mx-0.5", isDark ? "bg-white/10" : "bg-black/10")} />

        <button
          onClick={onAddTemplate}
          disabled={disabled}
          className={cn(buttonClass, "rounded-full")}
          title="Choose Layout"
        >
          <LayoutGrid size={18} strokeWidth={2.5} />
        </button>

        <div className={cn("w-px h-4 mx-0.5", isDark ? "bg-white/10" : "bg-black/10")} />

        {/* <button
          onClick={onAddAI}
          disabled={true} // Disabled as per requirements
          className={cn(buttonClass, "rounded-full text-blue-500 hover:text-blue-400")}
          title="Create with AI (Coming Soon)"
        >
          <Sparkles size={18} strokeWidth={2.5} className="text-blue-500" />
        </button> */}
      </div>
    </div>
  );
};
