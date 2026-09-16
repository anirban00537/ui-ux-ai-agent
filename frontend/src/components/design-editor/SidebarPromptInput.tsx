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
          "relative bg-background backdrop-blur-xl border transition-all duration-300 rounded overflow-hidden",
          loading
            ? "border-border ring-1 ring-border"
            : "border-border hover:border-border-strong focus-within:border-border-strong focus-within:ring-1 focus-within:ring-border"
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
                "w-full resize-none border-0 bg-transparent p-0 text-[13.5px] leading-relaxed text-foreground placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 font-medium custom-scrollbar disabled:opacity-50 font-mono",
                loading && "text-muted-foreground/50 cursor-not-allowed italic"
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
                className="h-7 w-7 rounded group/stop relative overflow-hidden bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
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
                  "h-8 w-8 rounded transition-all duration-300",
                  prompt.trim()
                    ? "bg-foreground text-background hover:bg-foreground/90 hover:scale-105 active:scale-95 font-mono uppercase tracking-[1.4px]"
                    : "bg-accent text-muted-foreground/40 cursor-not-allowed opacity-50 font-mono uppercase tracking-[1.4px]"
                )}
              >
                <SendHorizontal className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Loading Progress Bar at bottom */}
        {loading && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-border">
            <div className="h-full bg-muted-foreground/50 animate-progress-indeterminate" />
          </div>
        )}
      </div>

      {/* Keyboard hint */}
      {!loading && (
        <div className="absolute -bottom-5 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
          <span className="text-[10px] text-muted-foreground/40 font-medium tracking-wide font-mono uppercase tracking-[1.4px]">Press Enter to send</span>
        </div>
      )}
    </div>
  );
}
