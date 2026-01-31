"use client";

import React, { useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarPromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onSubmit: () => Promise<void> | void;
  loading?: boolean;
  placeholder?: string;
}

export function SidebarPromptInput({
  prompt,
  setPrompt,
  onSubmit,
  loading = false,
  placeholder = "Ask to design something...",
}: SidebarPromptInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = useCallback(
    async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
    <div className="relative">
      <div className="relative bg-card border border-white/10 rounded-xl overflow-hidden transition-all duration-200 hover:border-white/20 focus-within:border-white/30 focus-within:ring-1 focus-within:ring-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent pointer-events-none" />
        <div className="relative flex items-end gap-3 p-3">
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={cn(
                "w-full resize-none border-0 bg-transparent p-0 text-sm leading-6 text-white placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 font-sans overflow-hidden"
              )}
              rows={1}
              disabled={loading}
              style={{ minHeight: "40px", maxHeight: "200px" }}
            />
          </div>
          <div className="flex items-center flex-shrink-0">
            <Button
              size="icon"
              aria-label="Send prompt"
              onClick={handleSubmit}
              disabled={!prompt.trim() || loading}
              className="h-7 w-7 rounded-md bg-white text-black transition-all duration-150 hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
            >
              <SendHorizontal className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        {loading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
            <div className="flex items-center gap-2 text-white/60 text-xs">
              <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generating...</span>
            </div>
          </div>
        )}
      </div>
      <div className="mt-2 text-[10px] text-white/30 text-center">
        Press <kbd className="px-1 py-0.5 bg-white/10 rounded text-[9px]">Enter</kbd> to send,{" "}
        <kbd className="px-1 py-0.5 bg-white/10 rounded text-[9px]">Shift + Enter</kbd> for new line
      </div>
    </div>
  );
}
