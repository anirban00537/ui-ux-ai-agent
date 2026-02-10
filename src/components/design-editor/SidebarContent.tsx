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
import { Share2, Globe, Lock, Copy, Check, Loader2, Brain, ChevronRight, CheckCircle2, MessageSquare, Palette } from "lucide-react";
import { updateDesign } from "@/services/designs";
import { toast } from "sonner";
import { ThemePanel } from "./ThemePanel";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  Message,
  GenerationProgress,
  ColorPalette,
  updateConversation,
} from "@/store/slices/designEditorSlice";

import { formatCredits, getCreditColor } from "@/lib/credit-utils";

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
  loadMoreMessages?: () => Promise<void>;
  hasMoreMessages?: boolean;
}

// Agent activity line - minimal terminal-like log entry with shimmer effect
// Agent activity line - minimal vertical timeline style
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
    <div className="relative flex items-start gap-4 pl-1 group">
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-[5.5px] top-6 bottom-[-8px] w-px bg-zinc-800/80 group-hover:bg-zinc-700/80 transition-colors" />
      )}
      
      {/* Status Dot */}
      <div className="relative flex-shrink-0 mt-1.5">
        {status === "loading" ? (
          <div className="relative flex items-center justify-center w-3 h-3">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            <div className="relative w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
          </div>
        ) : (
          <div className="w-3 h-3 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-zinc-500" />
          </div>
        )}
      </div>

      <span
        className={cn(
          "text-[12px] leading-relaxed transition-all duration-500 py-0.5",
          status === "completed"
            ? "text-zinc-500 font-medium"
            : "text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-200 bg-[length:200%_auto] animate-gradient-flow font-medium"
        )}
      >
        {label}
      </span>
    </div>
  );
}

// Screen generation card - ultra clean row
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
        "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all duration-300",
        isGenerating
          ? "bg-zinc-900/80 border-primary/20 shadow-[0_4px_12px_-4px_rgba(var(--primary),0.1)]"
          : isCompleted
          ? "bg-zinc-900/20 border-white/5 hover:bg-zinc-900/40"
          : "bg-transparent border-transparent opacity-40"
      )}
    >
      {/* Index Badge */}
      <div
        className={cn(
          "flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold font-mono transition-colors duration-300",
          isGenerating && "bg-primary text-primary-foreground shadow-sm",
          isCompleted && "bg-zinc-800 text-zinc-500",
          isPending && "bg-zinc-800/30 text-zinc-700"
        )}
      >
        {isGenerating ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <span className="mt-[1px]">{index + 1}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <span
          className={cn(
            "text-[12px] font-medium truncate transition-colors duration-300",
            isGenerating ? "text-zinc-100" : "text-zinc-400 group-hover:text-zinc-300"
          )}
        >
          {title}
        </span>
      </div>

      {/* Status Icon */}
      {isCompleted && (
        <Check className="w-3.5 h-3.5 text-zinc-600" />
      )}
    </div>
  );
}

// Conversation turn interface
interface ConversationTurn {
  userMessage: Message;
  aiMessage: Message | null;
  thinkingMessage: Message | null;
  cardMessages: Message[];
  stepMessages: Message[];
  isActive: boolean;
}

function ThinkingBlock({ content }: { content: string }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!content) return null;

  return (
    <div className="group/think mb-4 border border-emerald-500/10 rounded-lg p-2 bg-emerald-500/5">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-[11px] font-medium text-emerald-500/80 hover:text-emerald-400 transition-colors uppercase tracking-wider"
      >
        <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <Brain className={cn("w-2.5 h-2.5 transition-transform duration-300", isExpanded ? "rotate-12 scale-110 text-emerald-400" : "text-emerald-600")} />
        </div>
        Thinking Process
        <ChevronRight className={cn("w-3 h-3 transition-transform duration-200", isExpanded && "rotate-90")} />
      </button>
      
      {isExpanded && (
        <div className="mt-2 pl-4 border-l border-emerald-500/20 overflow-hidden animate-in slide-in-from-top-1 duration-300">
          <div className="text-[12px] leading-relaxed text-zinc-400 italic font-light pr-2">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}

export function SidebarContent({
  onGenerate,
  onClear,
  onCancel,
  onColorChange,
  loadMoreMessages,
  hasMoreMessages: hasMoreInApi,
}: SidebarContentProps) {
  const {
    conversation,
    isGenerating: loading,
    progress,
  } = useAppSelector((state) => state.designEditor);

  const [activeTab, setActiveTab] = useState<"chat" | "theme">("chat");
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
    
    let currentTurn: ConversationTurn | null = null;

    for (const msg of messages) {
      if (msg.role === "user") {
        // Start a new turn
        if (currentTurn) {
          turns.push(currentTurn);
        }
        currentTurn = {
          userMessage: msg,
          aiMessage: null,
          thinkingMessage: null,
          cardMessages: [],
          stepMessages: [],
          isActive: false,
        };
      } else {
        // Handle non-user messages
        if (!currentTurn) {
          // Orphaned messages (e.g. from the middle of a turn due to pagination)
          // We create a dummy user message for this turn
          currentTurn = {
            userMessage: { 
              id: "orphan-" + msg.id, 
              content: "", 
              role: "user", 
              createdAt: msg.createdAt 
            },
            aiMessage: null,
            thinkingMessage: null,
            cardMessages: [],
            stepMessages: [],
            isActive: false,
          };
        }

        const isProcessMessage = 
          msg.status === "phase_step" || 
          msg.status === "intent_analysis" ||
          msg.status === "ai_thinking" ||
          (msg.status && SCREEN_CARD_STATUSES.includes(msg.status as any));

        if (msg.role === "assistant") {
          if (msg.status === "ai_response") {
            currentTurn.aiMessage = msg;
          } else if (msg.status === "ai_thinking") {
            currentTurn.thinkingMessage = msg;
          } else if (!currentTurn.aiMessage && !isProcessMessage) {
            currentTurn.aiMessage = msg;
          }
        }

        if (msg.status && SCREEN_CARD_STATUSES.includes(msg.status as any)) {
          currentTurn.cardMessages.push(msg);
        }
        
        if (msg.status === "phase_step" || msg.status === "intent_analysis" || msg.status === "status_update") {
          currentTurn.stepMessages.push(msg);
        }
      }
    }

    if (currentTurn) {
      currentTurn.isActive = loading === true;
      turns.push(currentTurn);
    }

    return turns;
  }, [conversation?.messages, loading]);

  // Combined pagination (local + api)
  const [visibleCount, setVisibleCount] = useState(10);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [isApiLoading, setIsApiLoading] = useState(false);

  const displayedTurns = useMemo(() => {
    return conversationTurns.slice(-visibleCount);
  }, [conversationTurns, visibleCount]);

  const hasMoreLocal = conversationTurns.length > visibleCount;
  const hasMore = hasMoreLocal || hasMoreInApi;

  // Auto-scroll logic fixes for pagination
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  useEffect(() => {
    if (loading) {
      setShouldScrollToBottom(true);
      setVisibleCount(10); 
    }
  }, [loading]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting) {
           const container = chatContainerRef.current;
           const oldScrollHeight = container?.scrollHeight || 0;

           if (hasMoreLocal) {
             // Load more from local state first
             setVisibleCount((prev) => Math.min(prev + 10, conversationTurns.length));
             
             requestAnimationFrame(() => {
               if (container) {
                 container.scrollTop += (container.scrollHeight - oldScrollHeight);
               }
             });
           } else if (hasMoreInApi && !isApiLoading && loadMoreMessages) {
             // Fetch from API if local exhausted
             setIsApiLoading(true);
             await loadMoreMessages();
             setIsApiLoading(false);
             
             // After API load, increase visible count to show the new messages
             setVisibleCount((prev) => prev + 10);

             requestAnimationFrame(() => {
               if (container) {
                 container.scrollTop += (container.scrollHeight - oldScrollHeight);
               }
             });
           }
        }
      },
      { threshold: 0.5, rootMargin: '100px' }
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMoreLocal, hasMoreInApi, isApiLoading, conversationTurns.length, loadMoreMessages]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({
      behavior,
      block: "end",
      inline: "nearest",
    });
  }, []);

  useEffect(() => {
    if (conversation?.messages.length && shouldScrollToBottom) {
      scrollToBottom(loading ? "smooth" : "auto");
    }
  }, [conversation?.messages.length, scrollToBottom, shouldScrollToBottom, loading]);

  useEffect(() => {
    if (loading && progress) {
      scrollToBottom("smooth");
    }
  }, [loading, progress, scrollToBottom]);

  const handleSubmit = useCallback(async () => {
    if (!onGenerate || !prompt.trim()) return;
    setVisibleCount(10); // Reset pagination on new message
    setShouldScrollToBottom(true);
    await onGenerate(prompt.trim());
    setPrompt("");
    setTimeout(() => refetchBalance(), 2000);
  }, [onGenerate, prompt, refetchBalance]);

  return (
    <div className="relative flex flex-col h-full font-sans bg-background/95">
      {/* Header - Minimal with transparency */}
      <div className="flex-shrink-0 px-5 py-3 border-b border-zinc-800/40 bg-background/50 backdrop-blur-sm z-10">
        <div className="flex items-center justify-between">
          <Link href="/my-designs" className="group flex items-center gap-1.5 -ml-2 px-2 py-1 rounded-md transition-colors hover:bg-zinc-800/50">
            <svg className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-xs font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors">Home</span>
          </Link>
          
          {!balanceLoading && (
            <div className={`flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider ${getCreditColor(balance?.remainingCredits)} bg-zinc-900/50 px-2 py-1 rounded-full border border-white/5`}>
              <span>{formatCredits(balance?.remainingCredits)} Credits</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800/40 bg-background/50 backdrop-blur-sm z-10">
        <button 
          onClick={() => setActiveTab("chat")}
          className={cn(
            "flex-1 py-3 text-xs font-medium transition-all relative",
            activeTab === "chat" 
              ? "text-primary" 
              : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          <div className="flex items-center justify-center gap-2">
            <MessageSquare className="w-3.5 h-3.5" />
            Chat
          </div>
          {activeTab === "chat" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_var(--primary)]" />
          )}
        </button>
        <button 
          onClick={() => setActiveTab("theme")}
          className={cn(
            "flex-1 py-3 text-xs font-medium transition-all relative",
            activeTab === "theme" 
              ? "text-primary" 
              : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          <div className="flex items-center justify-center gap-2">
            <Palette className="w-3.5 h-3.5" />
            Theme
          </div>
          {activeTab === "theme" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_var(--primary)]" />
          )}
        </button>
      </div>

      {/* Content Area */}
      {activeTab === "chat" ? (
        <>
          {/* Messages Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-5 py-6 space-y-8 custom-scrollbar scroll-smooth"
        onScroll={() => {
          const container = chatContainerRef.current;
          if (container) {
            const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
            setShouldScrollToBottom(isAtBottom);
          }
        }}
      >
        {displayedTurns.length > 0 ? (
          <>
            {/* Pagination Sentinel */}
            <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
               {hasMore && (
                 <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-medium py-4">
                   <Loader2 className="w-3 h-3 animate-spin" />
                   <span>Loading history...</span>
                 </div>
               )}
            </div>

            <div className="flex items-center justify-center pb-4">
              {!hasMore && (
                <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest opacity-60">Session Started</span>
              )}
            </div>

            {displayedTurns.map((turn, turnIndex) => {
              // Build display steps logic (kept same as before)
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
                      const byLabel = new Map<string, "loading" | "completed">();
                      for (const msg of sorted) {
                        const label = (msg.data?.label as string) || "";
                        const status = msg.data?.status === "completed" ? "completed" : "loading";
                        if (label) byLabel.set(label, status);
                      }
                      return Array.from(byLabel.entries()).map(
                        ([label, status]) => ({
                          label,
                          status: !turn.isActive ? ("completed" as const) : status,
                        })
                      );
                    })()
                  : null;

              const isUpdateTurn = turn.cardMessages.some(
                (m) => m.data?.kind === "update"
              );

              return (
                <div key={turn.userMessage.id} className="group/turn animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {/* User Bubble */}
                  {turn.userMessage.content && (
                    <div className="flex justify-end mb-6">
                      <div className="max-w-[90%] bg-zinc-950/50 text-zinc-300 px-4 py-2.5 rounded-2xl rounded-tr-sm shadow-sm border border-zinc-900 text-[13px] leading-relaxed backdrop-blur-sm">
                        {turn.userMessage.content}
                      </div>
                    </div>
                  )}

                  {/* Agent Response Area */}
                  {(turn.isActive || turn.aiMessage || turn.thinkingMessage || turn.cardMessages.length > 0 || (displaySteps && displaySteps.length > 0)) && (
                     <div className="pl-4 border-l-2 border-zinc-800/60 ml-2 space-y-6">
                        
                        {/* Thinking Process */}
                        {turn.thinkingMessage && (
                          <ThinkingBlock content={(turn.thinkingMessage.data?.message as string) || turn.thinkingMessage.content} />
                        )}

                        {/* AI Text Response */}
                        {turn.aiMessage && (
                          <div className="text-[13px] leading-relaxed text-zinc-200 pr-2 animate-in fade-in slide-in-from-left-1 duration-500">
                            {turn.aiMessage.content}
                          </div>
                        )}
                        
                        {/* Timeline Steps */}
                        {displaySteps && displaySteps.length > 0 && (
                          <div className="space-y-3">
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

                        {/* Cards Grid */}
                        {(turn.cardMessages.length > 0 || (turn.isActive && loading && progress && progress.total > 0 && !isUpdateTurn)) && (
                          <div className="grid grid-cols-1 gap-2 pt-1">
                             {/* Active Progress Cards */}
                             {turn.isActive && loading && progress && progress.total > 0 && !isUpdateTurn ? (
                                Array.from({ length: progress.total }, (_, i) => {
                                  const title = progress.screenTitles?.[i] ?? `Screen ${i + 1}`;
                                  const status = i === progress.current ? "generating" : i < progress.current ? "completed" : "pending";
                                  return <ScreenCard key={i} title={title} status={status as any} index={i} />;
                                })
                             ) : (
                                /* Completed Cards */
                                turn.cardMessages
                                  .filter((m) => !isUpdateTurn || m.data?.kind === "update")
                                  .map((msg, idx) => {
                                    const title = (msg.data?.title as string) || msg.content.replace(/^(Generating|Generated|Updating|Updated):\s*/i, "");
                                    const status = msg.status === "screen_start" && turn.isActive ? "generating" : "completed";
                                    return <ScreenCard key={msg.id} title={title} status={status} index={idx} />;
                                  })
                             )}
                          </div>
                        )}
                     </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} className="h-4" />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
               <Share2 className="w-8 h-8 text-zinc-700" />
            </div>
            <div className="max-w-[200px]">
              <p className="text-sm font-medium text-zinc-400">Ready to Create</p>
              <p className="text-[11px] text-zinc-600 mt-1">Describe your app idea below to start generating screens.</p>
            </div>
          </div>
        )}
      </div>

      {/* Input Area - Floated effect */}
      <div className="relative p-4 bg-gradient-to-t from-background via-background to-transparent z-20">
        <SidebarPromptInput
          prompt={prompt}
          setPrompt={setPrompt}
          onSubmit={handleSubmit}
          loading={loading}
          onCancel={onCancel}
        />
      </div>
    </>
  ) : (
    <div className="flex-1 min-h-0 relative">
      <ThemePanel
        colorPalette={conversation?.colorPalette}
        onColorChange={(key, value) => onColorChange?.(key, value)}
        onFontChange={(font) => onColorChange?.("fontFamily", font)}
        currentFont={conversation?.colorPalette?.fontFamily}
      />
    </div>
  )}
    </div>
  );
}


