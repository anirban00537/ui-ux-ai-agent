"use client";

import React, {
  useCallback,
  useState,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { SidebarPromptInput } from "@/components/design-editor/SidebarPromptInput";
import { useCreditBalance } from "@/hooks/use-credit-balance";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { useAppSelector } from "@/store/hooks";
import {
  Message,
  GenerationProgress,
  ColorPalette,
} from "@/store/slices/designEditorSlice";

// Card statuses that trigger screen cards
const SCREEN_CARD_STATUSES = [
  "screen_start",
  "screen_complete",
  "screen_update",
] as const;

interface SidebarContentProps {
  onGenerate?: (prompt: string) => Promise<void> | void;
  onClear?: () => void;
  onCancel?: () => void;
  onColorChange?: (key: keyof ColorPalette, value: string) => void;
  onFontChange?: (fontFamily: string) => void;
}

// Agent activity line - minimal terminal-like log entry with shimmer effect
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
    <div className="flex items-center gap-3 text-[13px] font-medium tracking-wide">
      {status === "loading" ? (
        <div className="flex-shrink-0 flex items-center justify-center w-3 h-3">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--primary)]" />
        </div>
      ) : (
        <div className="flex-shrink-0 text-primary/50">
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>
      )}

      <span
        className={cn(
          "transition-all duration-500",
          status === "completed"
            ? "text-zinc-500 font-normal"
            : "text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 via-white to-zinc-500 bg-[length:200%_auto] animate-gradient-flow"
        )}
        style={{
          animation:
            status === "loading"
              ? "gradient-flow 1.5s linear infinite"
              : "none",
          backgroundSize: "200% auto",
        }}
      >
        {label}
      </span>
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
  const isGenerating = status === "generating";
  const isCompleted = status === "completed";
  const isPending = status === "pending";

  return (
    <div
      className={cn(
        "group relative flex items-center gap-3 px-3 py-3 rounded-lg border transition-all duration-300",
        isGenerating &&
          "bg-zinc-800/40 border-primary/20 shadow-[0_0_15px_-5px_var(--primary)]",
        isCompleted && "bg-zinc-900/40 border-white/5",
        isPending && "bg-transparent border-transparent opacity-50"
      )}
    >
      {/* Index/Status Indicator */}
      <div
        className={cn(
          "flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-medium transition-colors duration-300",
          isGenerating && "bg-primary/10 text-primary ring-1 ring-primary/20",
          isCompleted && "bg-zinc-800 text-zinc-400",
          isPending && "bg-zinc-800/50 text-zinc-600"
        )}
      >
        {isGenerating ? (
          <div className="relative w-2.5 h-2.5">
            <div className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          </div>
        ) : isCompleted ? (
          <span className="text-xs">{index + 1}</span>
        ) : (
          <span>{index + 1}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <span
          className={cn(
            "text-[13px] font-medium truncate transition-colors duration-300",
            isGenerating ? "text-white" : "text-white/60"
          )}
        >
          {title}
        </span>
        {isGenerating && (
          <span className="text-[10px] text-primary/70 font-medium tracking-wide animate-pulse mt-0.5">
            Building UI...
          </span>
        )}
      </div>

      {/* Active Glow for Generating State */}
      {isGenerating && (
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-50 pointer-events-none" />
      )}
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
  onColorChange,
}: SidebarContentProps) {
  const {
    conversation,
    isGenerating: loading,
    progress,
  } = useAppSelector((state) => state.designEditor);

  const [prompt, setPrompt] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const {
    balance,
    loading: balanceLoading,
    refetch: refetchBalance,
  } = useCreditBalance();

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
        if (
          msg.status &&
          SCREEN_CARD_STATUSES.includes(
            msg.status as (typeof SCREEN_CARD_STATUSES)[number]
          )
        ) {
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
    if (pct >= 50) return "text-primary";
    return "text-primary";
  };

  return (
    <div className="relative flex flex-col h-full font-sans bg-background">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800/60">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
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
        className="flex-1 p-4 space-y-5 overflow-y-auto custom-scrollbar"
      >
        {conversationTurns.length > 0 ? (
          <>
            <div className="mx-auto flex w-full items-center gap-3 text-[10px] text-zinc-500">
              <div className="h-px flex-1 bg-zinc-800/60" />
              <span className="px-2 font-mono">Today</span>
              <div className="h-px flex-1 bg-zinc-800/60" />
            </div>

            {conversationTurns.map((turn, turnIndex) => {
              // Build display steps from step messages
              const allStepMessages = [
                ...turn.stepMessages,
                ...turn.cardMessages.filter((m) => m.status === "phase_step"),
              ];
              const displaySteps =
                allStepMessages.length > 0
                  ? (() => {
                      const sorted = [...allStepMessages].sort(
                        (a, b) =>
                          new Date(a.createdAt).getTime() -
                          new Date(b.createdAt).getTime()
                      );
                      const byLabel = new Map<
                        string,
                        "loading" | "completed"
                      >();
                      for (const msg of sorted) {
                        const label = (msg.data?.label as string) || "";
                        const status =
                          msg.data?.status === "completed"
                            ? "completed"
                            : "loading";
                        if (label) byLabel.set(label, status);
                      }
                      return Array.from(byLabel.entries()).map(
                        ([label, status]) => ({
                          label,
                          status: !turn.isActive
                            ? ("completed" as const)
                            : status,
                        })
                      );
                    })()
                  : null;

              // For updates, only show the screen being updated
              const isUpdateTurn = turn.cardMessages.some(
                (m) => m.data?.kind === "update"
              );

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
                    <div className="pl-1 space-y-2 mt-4 mb-4">
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
                  {turn.isActive &&
                  loading &&
                  progress &&
                  progress.total > 0 &&
                  !isUpdateTurn ? (
                    <div className="space-y-2 mt-2">
                      {Array.from({ length: progress.total }, (_, i) => {
                        const title =
                          progress.screenTitles?.[i] ?? `Screen ${i + 1}`;
                        const status: "pending" | "generating" | "completed" =
                          i === progress.current
                            ? "generating"
                            : i < progress.current
                            ? "completed"
                            : "pending";
                        return (
                          <ScreenCard
                            key={i}
                            title={title}
                            status={status}
                            index={i}
                          />
                        );
                      })}
                    </div>
                  ) : turn.cardMessages.length > 0 ? (
                    <div className="space-y-2 mt-2">
                      {turn.cardMessages
                        .filter(
                          (m) => !isUpdateTurn || m.data?.kind === "update"
                        )
                        .map((msg, idx) => {
                          const title =
                            (msg.data?.title as string) ||
                            msg.content.replace(
                              /^(Generating|Generated|Updating|Updated):\s*/i,
                              ""
                            );
                          const status =
                            msg.status === "screen_start" && turn.isActive
                              ? "generating"
                              : "completed";
                          return (
                            <ScreenCard
                              key={msg.id}
                              title={title}
                              status={status}
                              index={idx}
                            />
                          );
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
