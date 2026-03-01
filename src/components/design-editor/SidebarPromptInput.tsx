"use client";

import React, { useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarPromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onSubmit: () => Promise<void> | void;
  loading?: boolean;
  placeholder?: string;
  onCancel?: () => void;
}

// ... (imports remain)
import { SendHorizontal, Square, X } from "lucide-react";
// ... (interface remains)

export function SidebarPromptInput({
  prompt,
  setPrompt,
  onSubmit,
  loading = false,
  placeholder = "Ask to design something...",
  onCancel,
}: SidebarPromptInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = useCallback(
    async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Allow Shift+Enter for new lines
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        await onSubmit();
      }
    },
    [onSubmit]
  );

  const handleSubmit = useCallback(async () => {
    if (!prompt.trim() || loading) return;
    await onSubmit();
  }, [onSubmit, prompt, loading]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [prompt]);

  return (
    <div className="relative group">
      <div
        className={cn(
          "relative bg-white backdrop-blur-xl border transition-all duration-300 rounded-2xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.03)]",
          loading
            ? "border-primary/20 ring-1 ring-primary/10 shadow-[0_0_20px_-10px_rgba(83,56,255,0.2)]"
            : "border-black/[0.06] hover:border-black/[0.1] focus-within:border-primary/20 focus-within:ring-1 focus-within:ring-primary/10"
        )}
      >
        <div className="relative flex items-end gap-3 p-3.5">
          <div className="flex-1 min-w-0 py-0.5">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={loading ? "Generating designs..." : placeholder}
              className={cn(
                "w-full resize-none border-0 bg-transparent p-0 text-[13.5px] leading-relaxed text-[#0a0f1c] placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 font-medium custom-scrollbar disabled:opacity-50",
                loading && "text-slate-500 cursor-not-allowed italic"
              )}
              rows={1}
              disabled={loading}
              style={{ minHeight: "20px", maxHeight: "200px" }}
            />
          </div>

          <div className="flex items-center gap-1 flex-shrink-0 mb-[1px]">
            {loading && onCancel ? (
              <Button
                size="icon"
                variant="ghost"
                onClick={onCancel}
                className="h-7 w-7 rounded-lg group/stop relative overflow-hidden bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
                title="Stop generation"
              >
                <span className="sr-only">Stop</span>
                <Square className="w-2.5 h-2.5 fill-current" />
              </Button>
            ) : (
              <Button
                size="icon"
                onClick={handleSubmit}
                disabled={!prompt.trim() || loading}
                className={cn(
                  "h-8 w-8 rounded-xl transition-all duration-300 shadow-sm",
                  prompt.trim()
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed opacity-50 shadow-none border border-black/5"
                )}
              >
                <SendHorizontal className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Loading Progress Bar at bottom */}
        {loading && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary/10">
            <div className="h-full bg-primary/50 animate-progress-indeterminate" />
          </div>
        )}
      </div>

      {/* Keyboard hint */}
      {!loading && (
        <div className="absolute -bottom-5 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">Press Enter to send</span>
        </div>
      )}
    </div>
  );
}
