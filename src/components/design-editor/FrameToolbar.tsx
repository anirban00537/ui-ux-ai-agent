"use client";

import React, { useRef, useEffect } from "react";
import { 
  Trash2, 
  RotateCcw, 
  Monitor, 
  GripVertical, 
  Sparkles, 
  X, 
  Code, 
  MoreHorizontal,
  ChevronRight,
  Download,
  Image as ImageIcon,
  FileCode,
  MousePointerClick
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface FrameToolbarProps {
  title?: string;
  onDelete?: () => void;
  onRegenerate?: () => void;
  onViewCode?: () => void;
  onUpdate?: (prompt: string) => void;
  onExportImage?: () => void;
  onExportHtml?: () => void;
  showUpdateInput: boolean;
  setShowUpdateInput: (show: boolean) => void;
  onToggleInspect?: () => void;
  isInspecting?: boolean;
}

export function FrameToolbar({
  title,
  onDelete,
  onRegenerate,
  onViewCode,
  onUpdate,
  onExportImage,
  onExportHtml,
  showUpdateInput,
  setShowUpdateInput,
  onToggleInspect,
  isInspecting
}: FrameToolbarProps) {
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = () => setShowMenu(false);
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  return (
    <div 
      className={cn(
        "relative flex items-center gap-1.5 p-1 rounded-full border border-white/10 bg-zinc-950/80 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 group/toolbar ring-1 ring-white/5",
        "min-w-fit px-2 py-1.5"
      )}
    >
      {/* Drag Handle */}
      <div className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:text-zinc-400 transition-colors cursor-grab active:cursor-grabbing drag-target">
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Screen Title Section */}
      <div className="flex items-center gap-3 px-3 py-1 bg-white/[0.03] border border-white/[0.05] rounded-full mr-2">
        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
           <Monitor className="w-3.5 h-3.5 text-primary" />
        </div>
        <span className="text-[13px] font-semibold text-zinc-100 max-w-[160px] truncate tracking-tight">
          {title || "Untitled Screen"}
        </span>
      </div>

      <div className="flex items-center gap-1">
        {/* Tidy Up Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); setShowUpdateInput(true); }}
          className={cn(
            "group flex items-center gap-2.5 px-4 py-1.5 hover:bg-white/[0.08] text-zinc-400 hover:text-white rounded-full transition-all active:scale-95 border border-transparent hover:border-white/10 shrink-0",
            showUpdateInput && "bg-white/[0.08] text-white border-white/10"
          )}
        >
          <Sparkles className="w-4 h-4 group-hover:animate-pulse text-primary" />
          <span className="text-[12px] font-bold uppercase tracking-[0.08em] whitespace-nowrap">AI ENHANCE</span>
        </button>

        <div className="w-px h-4 bg-white/10 mx-1" />

        {/* Regular Actions */}
        <div className="flex items-center gap-0.5">
          {/* <button 
            onClick={onRegenerate}
            className="w-9 h-9 flex items-center justify-center hover:bg-white/[0.08] text-zinc-400 hover:text-white rounded-full transition-all active:scale-90"
            title="Regenerate"
          >
            <RotateCcw className="w-4 h-4" />
          </button> */}

          <button 
             onClick={(e) => {
                e.stopPropagation();
                onToggleInspect?.();
             }}
             className={cn(
               "w-9 h-9 flex items-center justify-center hover:bg-white/[0.08] text-zinc-400 hover:text-white rounded-full transition-all active:scale-90",
               isInspecting && "bg-blue-500/20 text-blue-400 hover:text-blue-300 ring-1 ring-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
             )}
             title="Inspect Element"
          >
            <MousePointerClick className="w-4 h-4" />
          </button>

          <button 
            onClick={onViewCode}
            className="w-9 h-9 flex items-center justify-center hover:bg-white/[0.08] text-zinc-400 hover:text-white rounded-full transition-all active:scale-90"
            title="View Code"
          >
            <Code className="w-4.5 h-4.5" />
          </button>

          {onDelete && (
            <button 
              onClick={onDelete}
              className="w-9 h-9 flex items-center justify-center hover:bg-red-500/10 text-zinc-400 hover:text-red-400 rounded-full transition-all active:scale-90"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className={cn(
                "w-9 h-9 flex items-center justify-center hover:bg-white/[0.08] text-zinc-400 hover:text-white rounded-full transition-all active:scale-90",
                showMenu && "bg-white/[0.08] text-white"
              )}
            >
               <MoreHorizontal className="w-4.5 h-4.5" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div 
                className="absolute top-full right-0 mt-3 w-52 bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[70] p-1.5 backdrop-blur-2xl"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => {
                      onExportImage?.();
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-white/[0.05] rounded-xl transition-all"
                  >
                    <ImageIcon className="w-4 h-4 text-zinc-500" />
                    <span className="font-medium">Export as Image</span>
                  </button>
                  <button
                    onClick={() => {
                      onExportHtml?.();
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-white/[0.05] rounded-xl transition-all"
                  >
                    <FileCode className="w-4 h-4 text-zinc-500" />
                    <span className="font-medium">Export as HTML</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
