"use client";

import React, { useCallback, useState, useRef, useEffect, useMemo } from "react";
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

interface Screen {
  id: string;
  title: string;
  description?: string;
  html: string;
  createdAt: string;
  status?: 'generating' | 'complete';
}

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  createdAt: string;
  type?: "stream" | "final";
  eventType?: string;
  status?: string;
  data?: Record<string, unknown>;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  screens: Screen[];
  colorPalette?: ColorPalette;
}

interface GenerationProgress {
  current: number;
  total: number;
  phase: "analyzing" | "theme_generating" | "analyzed" | "planning" | "generating" | "complete";
  currentScreen?: string;
  screenTitles?: string[];
  steps?: Array<{ label: string; status: "loading" | "completed" }>;
}

interface SidebarContentProps {
  onGenerate?: (prompt: string) => Promise<void> | void;
  onClear?: () => void;
  onCancel?: () => void;
  loading?: boolean;
  progress?: GenerationProgress | null;
  hasScreens?: boolean;
  conversation?: Conversation | null;
  onColorChange?: (key: keyof ColorPalette, value: string) => void;
  onFontChange?: (fontFamily: string) => void;
}

// Card statuses that trigger screen cards
const SCREEN_CARD_STATUSES = ["screen_start", "screen_complete", "screen_update"] as const;

// Agent activity line - minimal terminal-like log entry
function AgentActivityLine({
  label,
  status,
  isLast,
}: {
  label: string;
  status: "loading" | "completed";
  isLast: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-mono">
      <span className="text-zinc-600 select-none">→</span>
      <span className={status === "completed" ? "text-zinc-400" : "text-zinc-500"}>
        {label}
      </span>
      {status === "loading" ? (
        <span className="inline-flex items-center gap-1 text-amber-500/80">
          <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
        </span>
      ) : (
        <span className="text-emerald-500/70">✓</span>
      )}
    </div>
  );
}

// Screen generation card - clean, minimal design
function ScreenCard({
  title,
  status,
  index,
}: {
  title: string;
  status: "pending" | "generating" | "completed";
  index: number;
}) {
  return (
    <div className={`
      group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
      ${status === "generating" 
        ? "bg-zinc-800/60 border border-zinc-700/60" 
        : status === "completed"
          ? "bg-zinc-800/40 border border-zinc-700/40"
          : "bg-zinc-800/20 border border-zinc-800/40"
      }
    `}>
      {/* Index indicator */}
      <div className={`
        flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-medium
        ${status === "generating"
          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
          : status === "completed"
            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
            : "bg-zinc-700/30 text-zinc-500 border border-zinc-700/40"
        }
      `}>
        {status === "generating" ? (
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : status === "completed" ? (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <span>{index + 1}</span>
        )}
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <span className={`
          text-[12px] font-medium truncate block
          ${status === "generating" 
            ? "text-white/90" 
            : status === "completed"
              ? "text-white/70"
              : "text-white/40"
          }
        `}>
          {title}
        </span>
        <span className={`
          text-[10px] mt-0.5 block
          ${status === "generating"
            ? "text-amber-400/80"
            : status === "completed"
              ? "text-emerald-400/60"
              : "text-zinc-500"
          }
        `}>
          {status === "generating" ? "Building..." : status === "completed" ? "Done" : "Queued"}
        </span>
      </div>
    </div>
  );
}

// Conversation turn interface
interface ConversationTurn {
  userMessage: Message;
  aiMessage: Message | null;
  cardMessages: Message[];
  stepMessages: Message[];
  isActive: boolean;
}

export function SidebarContent({
  onGenerate,
  onClear,
  onCancel,
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

  // Group messages into conversation turns
  const conversationTurns = useMemo(() => {
    const messages = conversation?.messages || [];
    const turns: ConversationTurn[] = [];
    const userMessages = messages.filter((m) => m.role === "user");

    for (let i = 0; i < userMessages.length; i++) {
      const userMsg = userMessages[i];
      const userMsgIndex = messages.findIndex((m) => m.id === userMsg.id);
      const nextUserIndex = messages.findIndex(
        (m, idx) => idx > userMsgIndex && m.role === "user"
      );
      const endIndex = nextUserIndex === -1 ? messages.length : nextUserIndex;
      const turnMessages = messages.slice(userMsgIndex + 1, endIndex);

      let aiMessage: Message | null = null;
      const cardMessages: Message[] = [];
      const stepMessages: Message[] = [];

      for (const msg of turnMessages) {
        if (msg.role === "assistant" && msg.type === "final") {
          if (!aiMessage) aiMessage = msg;
        }
        if (msg.status && SCREEN_CARD_STATUSES.includes(msg.status as typeof SCREEN_CARD_STATUSES[number])) {
          cardMessages.push(msg);
        }
        if (msg.status === "phase_step") {
          stepMessages.push(msg);
        }
      }

      turns.push({
        userMessage: userMsg,
        aiMessage,
        cardMessages,
        stepMessages,
        isActive: i === userMessages.length - 1 && loading === true,
      });
    }
    return turns;
  }, [conversation?.messages, loading]);

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
    return "text-emerald-400";
  };

  return (
    <div className="relative flex flex-col h-full font-sans bg-zinc-900/30">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800/60">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <h2 className="text-sm font-medium text-white/90">Chat</h2>
          </div>
          <Link href="/home">
            <button className="px-3 py-1 text-[11px] text-white/50 hover:text-white/80 hover:bg-zinc-800/50 rounded transition-all">
              Back
            </button>
          </Link>
        </div>
        {!balanceLoading && (
          <div className="flex items-center gap-1.5 text-[11px]">
            <svg
              className={`w-3 h-3 ${getCreditColor()}`}
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
              {formatCredits(balance?.remainingCredits)} credits
            </span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 p-4 space-y-5 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700/50 scrollbar-track-transparent"
      >
        {conversationTurns.length > 0 ? (
          <>
            <div className="mx-auto flex w-full items-center gap-3 text-[10px] text-zinc-500">
              <div className="h-px flex-1 bg-zinc-800/60" />
              <span className="px-2 font-mono">Today</span>
              <div className="h-px flex-1 bg-zinc-800/60" />
            </div>

            {conversationTurns.map((turn, turnIndex) => {
              const isComplete = !turn.isActive && turn.cardMessages.length > 0;
              
              // Build display steps from step messages
              const displaySteps = turn.stepMessages.length > 0
                ? (() => {
                    const sorted = [...turn.stepMessages].sort(
                      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                    );
                    const byLabel = new Map<string, "loading" | "completed">();
                    for (const msg of sorted) {
                      const label = msg.data?.label as string || "";
                      const status = msg.data?.status === "completed" ? "completed" : "loading";
                      if (label) byLabel.set(label, status);
                    }
                    return Array.from(byLabel.entries()).map(([label, status]) => ({
                      label,
                      status: !turn.isActive ? "completed" as const : status,
                    }));
                  })()
                : null;

              // Get screen titles for this turn
              const screenTitles = turn.isActive && progress?.screenTitles
                ? progress.screenTitles
                : turn.cardMessages.map(m => (m.data?.title as string) || m.content.replace(/^(Generating|Generated|Updating|Updated):\s*/i, ""));

              return (
                <div key={turn.userMessage.id} className="space-y-3">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="max-w-[85%]">
                      <div className="bg-zinc-800/50 text-white px-3 py-2 rounded-lg border border-zinc-700/40">
                        <p className="text-[13px] text-white/90 leading-relaxed">
                          {turn.userMessage.content}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Agent Activity Log - clean terminal style */}
                  {displaySteps && displaySteps.length > 0 && (
                    <div className="ml-7 pl-3 border-l border-zinc-800/60 space-y-1">
                      {displaySteps.map((step, idx) => (
                        <AgentActivityLine
                          key={step.label + idx}
                          label={step.label}
                          status={step.status}
                          isLast={idx === displaySteps.length - 1}
                        />
                      ))}
                    </div>
                  )}

                  {/* Screen Cards */}
                  {turn.isActive && loading && progress && progress.total > 0 ? (
                    <div className="ml-7 space-y-2">
                      {Array.from({ length: progress.total }, (_, i) => {
                        const title = progress.screenTitles?.[i] ?? `Screen ${i + 1}`;
                        const status: "pending" | "generating" | "completed" =
                          i === progress.current ? "generating" : i < progress.current ? "completed" : "pending";
                        return <ScreenCard key={i} title={title} status={status} index={i} />;
                      })}
                    </div>
                  ) : turn.cardMessages.length > 0 ? (
                    <div className="ml-7 space-y-2">
                      {turn.cardMessages.map((msg, idx) => {
                        const title = (msg.data?.title as string) || msg.content.replace(/^(Generating|Generated|Updating|Updated):\s*/i, "");
                        const status = msg.status === "screen_start" && turn.isActive ? "generating" : "completed";
                        return <ScreenCard key={msg.id} title={title} status={status} index={idx} />;
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-[12px] text-zinc-500 font-mono">
              Start a conversation to generate screens
            </p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-zinc-800/60">
        <div className="relative group">
          <SidebarPromptInput
            prompt={prompt}
            setPrompt={setPrompt}
            onSubmit={handleSubmit}
            loading={loading}
            onCancel={onCancel}
          />
        </div>

      </div>
    </div>
  );
}
