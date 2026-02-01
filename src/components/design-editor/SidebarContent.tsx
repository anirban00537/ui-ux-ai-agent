"use client";

import React, { useCallback, useState, useRef, useEffect, useMemo } from "react";
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
  phase: "analyzing" | "planning" | "generating" | "complete";
  currentScreen?: string;
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

// Status badge component
function StatusBadge({ 
  label, 
  completed, 
  loading 
}: { 
  label: string; 
  completed: boolean; 
  loading?: boolean;
}) {
  return (
    <div className={`
      inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium
      ${completed 
        ? 'bg-zinc-800/80 text-white/90' 
        : loading 
          ? 'bg-zinc-800/50 text-white/60 border border-zinc-700/50' 
          : 'bg-zinc-800/30 text-white/40'
      }
    `}>
      {loading ? (
        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : completed ? (
        <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : null}
      <span className="uppercase tracking-wide">{label}</span>
    </div>
  );
}

// Screen card component
function ScreenCard({ 
  screen, 
  isGenerating,
}: { 
  screen: Screen; 
  isGenerating: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-zinc-800/30 border border-zinc-700/30">
      {/* Screen icon */}
      <div className={`
        w-10 h-10 rounded-lg flex items-center justify-center
        ${isGenerating 
          ? 'bg-orange-500/20 border border-orange-500/30' 
          : 'bg-orange-500/10 border border-orange-500/20'
        }
      `}>
        <div className={`w-5 h-5 rounded ${isGenerating ? 'bg-orange-400 animate-pulse' : 'bg-orange-500'}`} />
      </div>
      
      {/* Screen info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-white/90 truncate">
            {screen.title}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          {isGenerating ? (
            <span className="text-[11px] text-orange-400 flex items-center gap-1">
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating...
            </span>
          ) : (
            <>
              <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-[11px] text-white/50">Generated screen</span>
            </>
          )}
        </div>
      </div>
      
      {/* Expand icon */}
      <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

// Conversation turn with its screens
interface ConversationTurn {
  userMessage: Message;
  aiMessage: Message | null;
  screens: Screen[];
  isActive: boolean; // Is this the current active turn (loading)?
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

  // Group messages into conversation turns with their screens
  const conversationTurns = useMemo(() => {
    const messages = conversation?.messages || [];
    const screens = conversation?.screens || [];
    const turns: ConversationTurn[] = [];
    
    // Get all user messages
    const userMessages = messages.filter(m => m.role === 'user');
    
    for (let i = 0; i < userMessages.length; i++) {
      const userMsg = userMessages[i];
      const nextUserMsg = userMessages[i + 1];
      const isLastTurn = i === userMessages.length - 1;
      
      // Find AI response for this user message
      // It's the first final assistant message after this user message
      const userMsgIndex = messages.findIndex(m => m.id === userMsg.id);
      let aiMessage: Message | null = null;
      
      for (let j = userMsgIndex + 1; j < messages.length; j++) {
        const msg = messages[j];
        if (msg.role === 'user') break; // Stop at next user message
        if (msg.role === 'assistant' && msg.type === 'final') {
          aiMessage = msg;
          break;
        }
      }
      
      // Find screens that belong to this turn
      // Screens created after this user message but before the next user message
      const userMsgTime = new Date(userMsg.createdAt).getTime();
      const nextUserMsgTime = nextUserMsg 
        ? new Date(nextUserMsg.createdAt).getTime() 
        : Date.now() + 1000000; // Far future for last turn
      
      const turnScreens = screens.filter(screen => {
        const screenTime = new Date(screen.createdAt).getTime();
        return screenTime >= userMsgTime && screenTime < nextUserMsgTime;
      });
      
      turns.push({
        userMessage: userMsg,
        aiMessage,
        screens: turnScreens,
        isActive: isLastTurn && loading === true,
      });
    }
    
    return turns;
  }, [conversation?.messages, conversation?.screens, loading]);

  // Get phases for the active turn
  const activePhases = useMemo(() => {
    const result = {
      analyzed: false,
      planned: false,
      themeGenerated: false,
      analyzeLoading: false,
      planLoading: false,
      themeLoading: false,
    };
    
    if (loading && progress) {
      if (progress.phase === 'analyzing') {
        result.analyzeLoading = true;
      } else if (progress.phase === 'planning') {
        result.analyzed = true;
        result.planLoading = true;
      } else if (progress.phase === 'generating') {
        result.analyzed = true;
        result.planned = true;
        result.themeGenerated = true;
      } else if (progress.phase === 'complete') {
        result.analyzed = true;
        result.planned = true;
        result.themeGenerated = true;
      }
    }
    
    return result;
  }, [loading, progress]);

  // Get screens with status for active turn
  const getScreensWithStatus = useCallback((screens: Screen[]) => {
    const currentlyGenerating = progress?.currentScreen;
    return screens.map(screen => ({
      ...screen,
      isGenerating: loading && (
        screen.status === 'generating' || 
        (currentlyGenerating && currentlyGenerating.includes(screen.title))
      )
    }));
  }, [loading, progress?.currentScreen]);

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
        className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-600/30 scrollbar-track-transparent hover:scrollbar-thumb-zinc-500/50"
      >
        {conversationTurns.length > 0 ? (
          <>
            <div className="mx-auto flex w-full items-center gap-3 text-[11px] text-zinc-400 mb-4">
              <div className="h-px flex-1 bg-zinc-800/50" />
              <span className="px-2 py-0.5 font-normal">Today</span>
              <div className="h-px flex-1 bg-zinc-800/50" />
            </div>
            
            {conversationTurns.map((turn, turnIndex) => {
              const turnScreens = getScreensWithStatus(turn.screens);
              const isComplete = !turn.isActive && turn.screens.length > 0;
              const showPhases = turn.isActive || turn.screens.length > 0 || turn.aiMessage;
              
              return (
                <div key={turn.userMessage.id} className="space-y-3">
                  {/* User Message */}
                  <div className="flex items-start justify-end gap-2.5">
                    <div className="max-w-[80%]">
                      <div className="bg-zinc-900/20 backdrop-blur-sm text-white px-3 py-2.5 rounded-lg border border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-300">
                        <p className="text-[13px] text-white/95 leading-relaxed">
                          {turn.userMessage.content}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AI Response */}
                  {turn.aiMessage && (
                    <div className="flex items-start gap-2.5">
                      <Avatar className="h-6 w-6 mt-0.5 flex-shrink-0">
                        <AvatarImage src="" alt="AI" />
                        <AvatarFallback className="bg-gradient-to-r from-white/90 via-white to-white/90 text-black text-[10px] font-medium">
                          AI
                        </AvatarFallback>
                      </Avatar>
                      <div className="max-w-[85%] flex-1">
                        <div className="px-0 py-0.5">
                          <p className="text-[13px] text-white/85 leading-relaxed whitespace-pre-line">
                            {turn.aiMessage.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Phase Status Badges for THIS turn */}
                  {showPhases && (
                    <div className="flex flex-wrap gap-2 ml-8">
                      <StatusBadge 
                        label="Analyzed Request" 
                        completed={isComplete || (turn.isActive && activePhases.analyzed)} 
                        loading={turn.isActive && activePhases.analyzeLoading}
                      />
                      <StatusBadge 
                        label="Planned Actions" 
                        completed={isComplete || (turn.isActive && activePhases.planned)} 
                        loading={turn.isActive && activePhases.planLoading}
                      />
                      <StatusBadge 
                        label="Generated Theme" 
                        completed={isComplete || (turn.isActive && activePhases.themeGenerated)} 
                        loading={turn.isActive && activePhases.themeLoading}
                      />
                    </div>
                  )}

                  {/* Screen Cards for THIS turn */}
                  {turnScreens.length > 0 && (
                    <div className="space-y-2 ml-8">
                      {turnScreens.map((screen) => (
                        <ScreenCard
                          key={screen.id}
                          screen={screen}
                          isGenerating={screen.isGenerating || false}
                        />
                      ))}
                    </div>
                  )}
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
        />
        {loading && progress && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-white/50">
              <span className="truncate">
                {progress.currentScreen || "Processing..."}
              </span>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <span>
                  {progress.current}/{progress.total}
                </span>
                {onCancel && (
                  <button
                    onClick={onCancel}
                    className="px-2 py-0.5 text-[10px] text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-all duration-200"
                    title="Cancel generation"
                  >
                    Cancel
                  </button>
                )}
              </div>
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
