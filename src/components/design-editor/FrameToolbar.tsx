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
        "relative flex items-center gap-1.5 p-1 rounded-full border border-black/[0.04] bg-white/95 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-300 group/toolbar ring-1 ring-black/5",
        "min-w-fit px-2 py-1.5"
      )}
    >
      {/* Drag Handle */}
      <div className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-grab active:cursor-grabbing drag-target">
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Screen Title Section */}
      <div className="flex items-center gap-3 px-3 py-1 bg-black/[0.02] border border-black/[0.04] rounded-full mr-2">
        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
          <Monitor className="w-3.5 h-3.5 text-primary" />
        </div>
        <span className="text-[13px] font-semibold text-slate-800 max-w-[160px] truncate tracking-tight">
          {title || "Untitled Screen"}
        </span>
      </div>

      <div className="flex items-center gap-1">
        {/* Tidy Up Button */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowUpdateInput(true); }}
          className={cn(
            "group flex items-center gap-2.5 px-4 py-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-full transition-all active:scale-95 border border-transparent hover:border-black/5 shrink-0",
            showUpdateInput && "bg-slate-100 text-slate-900 border-black/5"
          )}
        >
          <Sparkles className="w-4 h-4 group-hover:animate-pulse text-primary" />
          <span className="text-[12px] font-bold uppercase tracking-[0.08em] whitespace-nowrap">AI ENHANCE</span>
        </button>

        <div className="w-px h-4 bg-black/[0.06] mx-1" />

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
            onClick={onViewCode}
            className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-full transition-all active:scale-90"
            title="View Code"
          >
            <Code className="w-4.5 h-4.5" />
          </button>

          {onDelete && (
            <button
              onClick={onDelete}
              className="w-9 h-9 flex items-center justify-center hover:bg-red-50 text-slate-500 hover:text-red-500 rounded-full transition-all active:scale-90"
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
                "w-9 h-9 flex items-center justify-center hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-full transition-all active:scale-90",
                showMenu && "bg-slate-100 text-slate-900"
              )}
            >
              <MoreHorizontal className="w-4.5 h-4.5" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div
                className="absolute top-full right-0 mt-3 w-52 bg-white border border-black/10 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[70] p-1.5 backdrop-blur-2xl"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => {
                      onExportImage?.();
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                  >
                    <ImageIcon className="w-4 h-4 text-slate-500" />
                    <span className="font-medium">Export as Image</span>
                  </button>
                  <button
                    onClick={() => {
                      onExportHtml?.();
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                  >
                    <FileCode className="w-4 h-4 text-slate-500" />
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
