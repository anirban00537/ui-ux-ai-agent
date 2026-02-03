"use client";

import React, { useRef, useEffect } from "react";
import { 
  Trash2, 
  Copy, 
  Check, 
  RotateCcw, 
  Monitor, 
  GripVertical, 
  Sparkles, 
  X, 
  Code, 
  MoreHorizontal,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FrameToolbarProps {
  title?: string;
  isCopied: boolean;
  onCopy?: () => void;
  onDelete?: () => void;
  onRegenerate?: () => void;
  onViewCode: () => void;
  onUpdate?: (prompt: string) => void;
  showUpdateInput: boolean;
  setShowUpdateInput: (show: boolean) => void;
}

export function FrameToolbar({
  title,
  isCopied,
  onCopy,
  onDelete,
  onRegenerate,
  onViewCode,
  onUpdate,
  showUpdateInput,
  setShowUpdateInput
}: FrameToolbarProps) {
  const updateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showUpdateInput) {
      updateInputRef.current?.focus();
    }
  }, [showUpdateInput]);

  const handleUpdateSubmit = () => {
    const val = updateInputRef.current?.value.trim();
    if (val && onUpdate) {
      onUpdate(val);
      setShowUpdateInput(false);
    }
  };

  return (
    <div 
      className={cn(
        "absolute -top-16 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 p-1.5 rounded-2xl border bg-background/80 backdrop-blur-xl shadow-2xl transition-all duration-300 drag-target cursor-grab active:cursor-grabbing",
        showUpdateInput ? "border-primary/50 ring-4 ring-primary/10 w-fit" : "border-border"
      )}
      onMouseDown={(e) => {
        // Allow drag, but prevent click-through if necessary (though usually fine)
        // Checks if specific targets need stopPropagation
      }}
    >
      {showUpdateInput ? (
        <div className="flex items-center gap-2 px-1 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3 px-3 py-2 bg-muted/50 rounded-xl border border-border/50 group focus-within:border-primary/50 transition-all">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <input
              ref={updateInputRef}
              type="text"
              placeholder="How should I update this screen?"
              className="bg-transparent border-none outline-none text-sm w-[320px] text-foreground placeholder:text-muted-foreground/60 cursor-text"
              onMouseDown={(e) => e.stopPropagation()} 
              onKeyDown={(e) => {
                if (e.key === "Enter") handleUpdateSubmit();
                if (e.key === "Escape") setShowUpdateInput(false);
                e.stopPropagation();
              }}
            />
            <div className="flex items-center gap-1">
               <span className="text-[10px] font-medium text-muted-foreground/50 border border-border px-1.5 py-0.5 rounded-md">ESC</span>
            </div>
          </div>
          
          <button 
            onClick={handleUpdateSubmit}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            <span>Update</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button 
            onClick={() => setShowUpdateInput(false)}
            className="p-2 hover:bg-muted text-muted-foreground rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <>
          {/* Drag Handle */}
          <div className="pl-1 text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-grab active:cursor-grabbing">
            <GripVertical className="w-5 h-5" />
          </div>

          {/* Info */}
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
               <Monitor className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-bold text-foreground max-w-[140px] truncate">
              {title || "Untitled Screen"}
            </span>
          </div>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Actions */}
          <div className="flex items-center gap-1">
            {onUpdate && (
              <button 
                onClick={(e) => { e.stopPropagation(); setShowUpdateInput(true); }}
                className="group flex items-center gap-2 px-3 py-1.5 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-xl transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider">Tidy Up</span>
              </button>
            )}

            <button 
              onClick={onRegenerate}
              className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl transition-all active:scale-90"
              title="Regenerate"
            >
              <RotateCcw className="w-4.5 h-4.5" />
            </button>

            <button 
              onClick={onViewCode}
              className="p-2 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-xl transition-all active:scale-90"
              title="View Code"
            >
              <Code className="w-5 h-5 text-primary" />
            </button>

            {onCopy && (
              <button 
                onClick={onCopy}
                className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl transition-all active:scale-90"
                title="Copy Code"
              >
                {isCopied ? <Check className="w-4.5 h-4.5 text-green-500" /> : <Copy className="w-4.5 h-4.5" />}
              </button>
            )}

            {onDelete && (
              <button 
                onClick={onDelete}
                className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-xl transition-all active:scale-90"
                title="Delete"
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
            )}

            <button className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl transition-all active:scale-90">
               <MoreHorizontal className="w-4.5 h-4.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
