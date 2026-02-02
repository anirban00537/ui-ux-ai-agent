"use client";

import React, { useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SendHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarPromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onSubmit: () => Promise<void> | void;
  loading?: boolean;
  placeholder?: string;
  onCancel?: () => void;
}

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
          "relative bg-zinc-900 border transition-all duration-300 rounded-xl overflow-hidden",
          loading 
            ? "border-emerald-500/30 ring-1 ring-emerald-500/10" 
            : "border-zinc-800 hover:border-zinc-700 focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-zinc-800"
        )}
      >
        {/* Subtle Gradient for Loading State */}
        {loading && (
           <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent pointer-events-none animate-gradient-flow bg-[length:200%_auto]" />
        )}

        <div className="relative flex items-end gap-2 p-3">
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={loading ? "Agent is working..." : placeholder}
              className={cn(
                "w-full resize-none border-0 bg-transparent p-0 text-[13px] leading-5 text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 font-sans custom-scrollbar disabled:opacity-50",
                loading && "text-zinc-400 cursor-not-allowed"
              )}
              rows={1}
              disabled={loading}
              style={{ minHeight: "20px", maxHeight: "200px" }}
            />
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0 mb-0.5">
             {loading && onCancel ? (
               <Button
                 size="icon"
                 variant="ghost"
                 onClick={onCancel}
                 className="h-6 w-6 rounded-lg text-red-400/80 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                 title="Stop generation"
               >
                 <span className="sr-only">Stop</span>
                 <div className="w-2 h-2 rounded-sm bg-current" />
               </Button>
             ) : (
                <Button
                  size="icon"
                  onClick={handleSubmit}
                  disabled={!prompt.trim() || loading}
                  className={cn(
                    "h-6 w-6 rounded-lg transition-all duration-200",
                    prompt.trim() 
                      ? "bg-zinc-100 text-black hover:bg-white" 
                      : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700"
                  )}
                >
                  <SendHorizontal className="h-3 w-3" />
                </Button>
             )}
          </div>
        </div>
      </div>
      
      {/* Footer hint */}
      {!loading && (
        <div className="absolute -bottom-5 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <span className="text-[10px] text-zinc-600/60 font-medium">Return to send</span>
        </div>
      )}
    </div>
  );
}
