"use client";

import React, { useCallback, useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarPromptInput } from "@/components/design-editor/SidebarPromptInput";
import { useCreditBalance } from "@/hooks/use-credit-balance";
import Link from "next/link";

interface ColorPalette {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  mutedForeground: string;
  card: string;
  cardForeground: string;
  border: string;
  input: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Array<{
    id: string;
    content: string;
    role: "user" | "assistant" | "system";
    createdAt: string;
    type?: "stream" | "final";
    eventType?: string;
    status?: string;
  }>;
  screens: Array<{
    id: string;
    title: string;
    description?: string;
    html: string;
    createdAt: string;
  }>;
  colorPalette?: ColorPalette;
}

interface GenerationProgress {
  current: number;
  total: number;
  phase: "planning" | "generating" | "complete";
  currentScreen?: string;
}

interface SidebarContentProps {
  onGenerate?: (prompt: string) => Promise<void> | void;
  onClear?: () => void;
  loading?: boolean;
  progress?: GenerationProgress | null;
  hasScreens?: boolean;
  conversation?: Conversation | null;
  onColorChange?: (key: keyof ColorPalette, value: string) => void;
  onFontChange?: (fontFamily: string) => void;
}

export function SidebarContent({
  onGenerate,
  onClear,
  loading,
  progress,
  hasScreens = false,
  conversation,
}: SidebarContentProps) {
  const [prompt, setPrompt] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { balance, loading: balanceLoading, refetch: refetchBalance } =
    useCreditBalance();

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({
      behavior,
      block: "end",
      inline: "nearest",
    });
  }, []);

  useEffect(() => {
    if (conversation?.messages.length) {
      scrollToBottom("auto");
    }
  }, [conversation?.messages.length, scrollToBottom]);

  useEffect(() => {
    if (conversation?.messages.length) {
      const timer = setTimeout(() => scrollToBottom("smooth"), 100);
      return () => clearTimeout(timer);
    }
  }, [conversation?.messages, scrollToBottom]);

  useEffect(() => {
    if (loading && progress) {
      scrollToBottom("smooth");
    }
  }, [loading, progress, scrollToBottom]);

  const handleSubmit = useCallback(async () => {
    if (!onGenerate || !prompt.trim()) return;
    await onGenerate(prompt.trim());
    setPrompt("");
    setTimeout(() => refetchBalance(), 2000);
  }, [onGenerate, prompt, refetchBalance]);

  const formatCredits = (credits: number | undefined) => {
    if (credits !== 0 && !credits) return "0";
    if (credits >= 1000) return `${(credits / 1000).toFixed(1)}K`;
    return credits.toLocaleString();
  };

  const getCreditColor = () => {
    if (!balance) return "text-white/70";
    const pct = balance.usagePercentage;
    if (pct >= 80) return "text-red-400";
    if (pct >= 50) return "text-yellow-400";
    return "text-green-400";
  };

  return (
    <div className="relative flex flex-col h-full font-sans bg-zinc-900/20 backdrop-blur-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800/50 bg-zinc-900/20 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-white/90 via-white to-white/90" />
            <h2 className="text-sm font-medium text-white/90">Chat</h2>
          </div>
          <Link href="/home">
            <button className="px-3 py-1.5 text-xs text-white/70 hover:text-white/90 hover:bg-zinc-900/30 rounded-md transition-all duration-300 hover:scale-105">
              Back
            </button>
          </Link>
        </div>
        {!balanceLoading && (
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <svg
                className={`w-3.5 h-3.5 ${getCreditColor()}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className={getCreditColor()}>
                {formatCredits(balance?.remainingCredits)} credits remaining
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 p-4 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-600/30 scrollbar-track-transparent hover:scrollbar-thumb-zinc-500/50"
      >
        {conversation?.messages.length ? (
          <>
            <div className="mx-auto flex w-full items-center gap-3 text-[11px] text-zinc-400 mb-4">
              <div className="h-px flex-1 bg-zinc-800/50" />
              <span className="px-2 py-0.5 font-normal">Today</span>
              <div className="h-px flex-1 bg-zinc-800/50" />
            </div>
            {conversation.messages.map((message) => {
              if (message.role === "user") {
                return (
                  <div
                    key={message.id}
                    className="flex items-start justify-end gap-2.5"
                  >
                    <div className="max-w-[80%]">
                      <div className="bg-zinc-900/20 backdrop-blur-sm text-white px-3 py-2.5 rounded-lg border border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-300">
                        <p className="text-[13px] text-white/95 leading-relaxed">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }
              return (
                <div key={message.id} className="flex items-start gap-2.5">
                  <Avatar className="h-6 w-6 mt-0.5 flex-shrink-0">
                    <AvatarImage src="" alt="AI" />
                    <AvatarFallback className="bg-gradient-to-r from-white/90 via-white to-white/90 text-black text-[10px] font-medium">
                      AI
                    </AvatarFallback>
                  </Avatar>
                  <div className="max-w-[85%] flex-1">
                    <div className="px-0 py-0.5">
                      <p className="text-[13px] text-white/85 leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-[13px] text-white/40">
              Start a conversation to generate screens
            </p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-zinc-800/50 bg-zinc-900/20 backdrop-blur-sm">
        <SidebarPromptInput
          prompt={prompt}
          setPrompt={setPrompt}
          onSubmit={handleSubmit}
          loading={loading}
          placeholder="Ask to design something..."
        />
        {loading && progress && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-white/50">
              <span className="truncate">
                {progress.currentScreen || "Processing..."}
              </span>
              <span className="flex-shrink-0 ml-2">
                {progress.current}/{progress.total}
              </span>
            </div>
            <div className="w-full bg-zinc-800/50 rounded-full h-1 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-white/90 via-white to-white/90 transition-all duration-300 ease-out"
                style={{
                  width:
                    progress.total > 0
                      ? `${(progress.current / progress.total) * 100}%`
                      : "0%",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
