"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";

import { getDesignById, updateDesign, DesignType } from "@/services/designs";
import { CONFIG } from "@/lib/config";

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
  designType: DesignType;
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

interface UseChatGeneratorResult {
  conversation: Conversation | null;
  isGenerating: boolean;
  progress: GenerationProgress | null;
  error: string | null;
  sendMessage: (message: string, designId?: string) => Promise<void>;
  cancelGeneration: () => void;
  clearConversation: () => void;
  loadConversation: (designId: string) => Promise<void>;
  updateColorPalette: (key: keyof ColorPalette, value: string) => void;
}

export function useChatGenerator(): UseChatGeneratorResult {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // AbortController ref for cancellation support
  const abortControllerRef = useRef<AbortController | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (readerRef.current) {
        readerRef.current.cancel().catch(() => {});
      }
    };
  }, []);

  const cancelGeneration = useCallback(() => {
    // Abort the fetch request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Cancel the reader
    if (readerRef.current) {
      readerRef.current.cancel().catch(() => {});
      readerRef.current = null;
    }
    
    setIsGenerating(false);
    setProgress(null);
    
    // Add a system message about cancellation
    setConversation((prev) => {
      if (!prev) return prev;
      const cancelMessage: Message = {
        id: `cancel-${Date.now()}`,
        content: "Generation cancelled.",
        role: "system",
        createdAt: new Date().toISOString(),
        type: "stream",
        eventType: "cancelled",
      };
      return { ...prev, messages: [...prev.messages, cancelMessage] };
    });
  }, []);

  const sendMessage = useCallback(
    async (message: string, designId?: string) => {
      // Cancel any existing generation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new AbortController for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      
      try {
        setIsGenerating(true);
        setError(null);

        const userMessage: Message = {
          id: Date.now().toString(),
          content: message,
          role: "user",
          createdAt: new Date().toISOString(),
        };

        setConversation((prev) => {
          if (prev) {
            return { ...prev, messages: [...prev.messages, userMessage] };
          }
          return {
            id: designId || "temp",
            title: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
            designType: "mobile_app",
            messages: [userMessage],
            screens: [],
          };
        });

        const baseUrl = CONFIG.API_URL.replace(/\/$/, "");
        const streamUrl = `${baseUrl}/designs/chat/stream/${designId ?? ""}?prompt=${encodeURIComponent(message)}`;
        const res = await fetch(streamUrl, {
          method: "GET",
          headers: {
            Accept: "text/event-stream",
            apisecretkeycheck: CONFIG.API_SECRET,
          },
          credentials: "include",
          signal: abortController.signal, // Add abort signal
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(
            data?.message || data?.error || `Request failed: ${res.status}`
          );
        }

        const responseDesignId = designId;
        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");
        
        // Store reader ref for cancellation
        readerRef.current = reader;

        const decoder = new TextDecoder();
        let buffer = "";
        const generatedScreens: Screen[] = [];
        let assistantMessageContent = "";

        const updateAvailableScreens = (availableScreens: any[]) => {
          const screens = availableScreens || [];
          if (screens.length > 0) {
            setConversation((prev) => {
              if (!prev) return prev;
              const existingIds = new Set(prev.screens.map((s) => s.id));
              const newScreens = screens
                .filter((s: any) => !existingIds.has(s.id))
                .map((s: any) => ({
                  id: s.id,
                  title: s.title,
                  description: s.description,
                  html: "",
                  createdAt: new Date().toISOString(),
                }));
              return { ...prev, screens: [...prev.screens, ...newScreens] };
            });
          }
        };

        const addStreamMessage = (content: string, type: string, data?: Record<string, unknown>) => {
          if (!content) return;
          const streamMessage: Message = {
            id: `stream-${Date.now()}-${Math.random()}`,
            content,
            role: "system",
            createdAt: new Date().toISOString(),
            type: "stream",
            eventType: type,
            status: type, // Also set status for card filtering
            data,
          };
          setConversation((prev) =>
            prev ? { ...prev, messages: [...prev.messages, streamMessage] } : prev
          );
        };

        while (true) {
          // Check for cancellation
          if (abortController.signal.aborted) {
            console.log('[useChatGenerator] Request was aborted');
            break;
          }
          
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const raw = JSON.parse(line.slice(6));
              const eventData = raw?.data ?? raw;
              const eventType = raw?.type ?? eventData?.type;
              const availableScreens = raw?.availableScreens ?? eventData?.availableScreens;

              switch (eventType) {
                case "intent_analysis":
                  addStreamMessage(
                    eventData?.message || "Analyzing your request...",
                    "intent_analysis"
                  );
                  setProgress({
                    current: 0,
                    total: 0,
                    phase: "analyzing",
                    currentScreen: eventData?.message,
                  });
                  updateAvailableScreens(availableScreens || []);
                  break;
                case "ai_thinking":
                case "status_update":
                case "thinking_step":
                case "tool_use":
                  addStreamMessage(eventData?.message ?? "", eventType);
                  updateAvailableScreens(availableScreens || []);
                  break;
                case "planning":
                  addStreamMessage(eventData?.message ?? "", "planning");
                  setProgress({
                    current: 0,
                    total: 0,
                    phase: "planning",
                    currentScreen: eventData?.message,
                  });
                  break;
                case "planning_complete":
                  addStreamMessage(
                    `Planning complete: ${eventData?.totalScreens ?? 0} screens to generate`,
                    "planning_complete"
                  );
                  setProgress({
                    current: 0,
                    total: eventData?.totalScreens ?? 0,
                    phase: "planning",
                    currentScreen: `Planning complete: ${eventData?.totalScreens ?? 0} screens`,
                  });
                  break;
                case "screen_start": {
                  const messageId = eventData?.messageId;
                  const title = eventData?.title ?? "Screen";
                  const kind = eventData?.kind ?? "create";
                  if (messageId) {
                    const cardMessage: Message = {
                      id: messageId,
                      content: kind === "update" ? `Updating: ${title}` : `Generating: ${title}`,
                      role: "assistant",
                      createdAt: new Date().toISOString(),
                      type: "stream",
                      status: "screen_start",
                      data: { title, kind, screenId: eventData?.screenId },
                    };
                    setConversation((prev) =>
                      prev ? { ...prev, messages: [...prev.messages, cardMessage] } : prev
                    );
                  } else {
                    addStreamMessage(
                      eventData?.message || `Starting: ${title}`,
                      "screen_start"
                    );
                  }
                  if (raw?.progress || eventData?.progress) {
                    const pg = raw?.progress ?? eventData?.progress;
                    setProgress((prev) => ({
                      ...prev,
                      current: pg.current,
                      total: pg.total,
                      phase: "generating",
                      currentScreen: title,
                      screenTitles: prev?.screenTitles ?? [],
                    }));
                  }
                  break;
                }
                case "screen_complete": {
                  const screenPayload = eventData?.screen ?? eventData;
                  const messageId = eventData?.messageId;
                  if (screenPayload) {
                    const planTitle = screenPayload.planTitle;
                    const newScreen: Screen = {
                      id: screenPayload.id ?? `${Date.now()}`,
                      title: screenPayload.title,
                      description: screenPayload.description,
                      html: screenPayload.html,
                      createdAt: new Date().toISOString(),
                      status: "complete",
                    };
                    generatedScreens.push(newScreen);
                    if (!messageId) {
                      addStreamMessage(`Completed: ${screenPayload.title}`, "screen_complete");
                    }
                    setConversation((prev) => {
                      if (!prev) return prev;
                      const messages = messageId
                        ? prev.messages.map((m) =>
                            m.id === messageId
                              ? {
                                  ...m,
                                  content: `Generated: ${screenPayload.title}`,
                                  status: "screen_complete",
                                  data: {
                                    ...m.data,
                                    title: screenPayload.title,
                                    screenId: screenPayload.id,
                                    screen: screenPayload,
                                  },
                                }
                              : m
                          )
                        : prev.messages;
                      const matchesBy = (s: Screen) =>
                        s.id === newScreen.id ||
                        s.title === newScreen.title ||
                        (planTitle != null && s.title === planTitle);
                      const matched = prev.screens.filter(matchesBy);
                      const nextScreens = prev.screens
                        .map((s) => (matchesBy(s) ? newScreen : s))
                        .concat(matched.length ? [] : [newScreen]);
                      return {
                        ...prev,
                        id: responseDesignId || prev.id,
                        messages,
                        screens: nextScreens,
                      };
                    });
                    if (raw?.progress || eventData?.progress) {
                      const pg = raw?.progress ?? eventData?.progress;
                      setProgress((prev) => ({
                        ...prev,
                        current: pg.current,
                        total: pg.total,
                        phase: "generating",
                        currentScreen: `Completed: ${screenPayload.title}`,
                        screenTitles: prev?.screenTitles ?? [],
                      }));
                    }
                  }
                  break;
                }
                case "screen_streaming": {
                  // Real-time streaming of LLM content
                  const title = eventData?.title;
                  const screenId = eventData?.id || eventData?.screenId;
                  const accumulatedText = eventData?.accumulatedText || "";
                  
                  // Try to extract partial HTML from the accumulated JSON
                  let partialHtml = "";
                  try {
                    // Robust regex to match partial JSON strings including escaped quotes
                    const htmlMatch = accumulatedText.match(/"html"\s*:\s*"((?:\\.|[^"\\])*?)(?:"|$)/);
                    if (htmlMatch && htmlMatch[1]) {
                      // Unescape JSON string
                      partialHtml = htmlMatch[1]
                        .replace(/\\n/g, "\n")
                        .replace(/\\"/g, '"')
                        .replace(/\\\\/g, "\\");
                    }
                  } catch {
                    // Ignore parse errors
                  }
                  
                  if (title && partialHtml) {
                    setConversation((prev) => {
                      if (!prev) return prev;
                      
                      // Find or create the streaming screen
                      const existingIndex = prev.screens.findIndex(
                        (s) => (screenId && s.id === screenId) || s.title === title
                      );
                      if (existingIndex >= 0) {
                        // Update existing screen
                        const updatedScreens = [...prev.screens];
                        updatedScreens[existingIndex] = {
                          ...updatedScreens[existingIndex],
                          html: partialHtml,
                          status: 'generating',
                          // Update ID if we have a real one now and didn't before
                          ...(screenId ? { id: screenId } : {}), 
                        };
                        return { ...prev, screens: updatedScreens };
                      } else {
                        // Create new placeholder screen
                        const newScreen: Screen = {
                          id: screenId ?? `streaming-${Date.now()}`,
                          title,
                          description: "Generating...",
                          html: partialHtml,
                          createdAt: new Date().toISOString(),
                          status: 'generating',
                        };
                        return { ...prev, screens: [...prev.screens, newScreen] };
                      }
                    });
                  }
                  break;
                }
                case "screen_update": {
                  const screenPayload = eventData?.screen ?? eventData;
                  const messageId = eventData?.messageId;
                  if (screenPayload) {
                    const updatedScreen: Screen = {
                      id: screenPayload.id,
                      title: screenPayload.title,
                      description: screenPayload.description,
                      html: screenPayload.html,
                      createdAt: new Date().toISOString(),
                    };
                    if (!messageId) {
                      addStreamMessage(`Updated: ${screenPayload.title}`, "screen_update");
                    }
                    setConversation((prev) => {
                      if (!prev) return prev;
                      const messages = messageId
                        ? prev.messages.map((m) =>
                            m.id === messageId
                              ? {
                                  ...m,
                                  content: `Updated: ${screenPayload.title}`,
                                  status: "screen_update",
                                  data: {
                                    ...m.data,
                                    title: screenPayload.title,
                                    screenId: screenPayload.id,
                                    screen: screenPayload,
                                  },
                                }
                              : m
                          )
                        : prev.messages;
                      return {
                        ...prev,
                        id: responseDesignId || prev.id,
                        messages,
                        screens: prev.screens.map((s) =>
                          s.id === updatedScreen.id ? updatedScreen : s
                        ),
                      };
                    });
                  }
                  break;
                }
                case "screen_delete": {
                  const screenId = eventData?.screen?.id ?? eventData?.screenId;
                  const screenTitle = eventData?.screen?.title ?? "Screen";
                  if (screenId) {
                    addStreamMessage(`Deleted: ${screenTitle}`, "screen_delete");
                    setConversation((prev) =>
                      prev
                        ? {
                            ...prev,
                            id: responseDesignId || prev.id,
                            screens: prev.screens.filter((s) => s.id !== screenId),
                          }
                        : prev
                    );
                  }
                  break;
                }
                case "color_palette": {
                  if (eventData) {
                    setConversation((prev) =>
                      prev ? { ...prev, colorPalette: eventData } : prev
                    );
                  }
                  break;
                }
                case "all_complete":
                  addStreamMessage(
                    eventData?.message || "All tasks completed.",
                    "all_complete"
                  );
                  assistantMessageContent =
                    eventData?.message || "All tasks completed.";
                  setProgress({
                    current: generatedScreens.length,
                    total: generatedScreens.length,
                    phase: "complete",
                    currentScreen: "Complete",
                  });
                  break;
                // === NEW CLEAN PHASE EVENTS ===
                case "phase_analyzing":
                  setProgress({
                    current: 0,
                    total: 0,
                    phase: "analyzing",
                    currentScreen: "Analyzing request...",
                  });
                  break;
                case "phase_analyzed":
                  setProgress((prev) =>
                    prev
                      ? { ...prev, phase: "analyzed", screenTitles: prev.screenTitles ?? [] }
                      : null
                  );
                  break;
                case "phase_theme_generating":
                  setProgress((prev) =>
                    prev
                      ? { ...prev, phase: "theme_generating", screenTitles: prev.screenTitles ?? [] }
                      : null
                  );
                  break;
                case "phase_theme_complete":
                  if (eventData) {
                    setConversation((prev) =>
                      prev ? { ...prev, colorPalette: eventData } : prev
                    );
                  }
                  setProgress((prev) =>
                    prev
                      ? { ...prev, phase: "analyzed", screenTitles: prev.screenTitles ?? [] }
                      : null
                  );
                  break;
                case "phase_planning":
                  setProgress({
                    current: 0,
                    total: 0,
                    phase: "planning",
                    currentScreen: "Planning actions...",
                  });
                  break;
                case "phase_planned":
                  setProgress((prev) => ({
                    ...prev,
                    current: 0,
                    total: eventData?.totalScreens ?? 0,
                    phase: "generating",
                    currentScreen: "Starting generation...",
                    screenTitles: eventData?.screenTitles ?? [],
                    steps: prev?.steps ?? [],
                  }));
                  break;
                case "phase_step": {
                  const label = eventData?.label;
                  const stepStatus = eventData?.status;
                  if (label && (stepStatus === "started" || stepStatus === "completed")) {
                    const stepMessage: Message = {
                      id: `phase-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                      content: `${label}: ${stepStatus}`,
                      role: "assistant",
                      createdAt: new Date().toISOString(),
                      type: "stream",
                      status: "phase_step",
                      data: { label, status: stepStatus },
                    };
                    setConversation((prev) =>
                      prev ? { ...prev, messages: [...prev.messages, stepMessage] } : prev
                    );
                    setProgress((prev) => {
                      const base = prev ?? {
                        current: 0,
                        total: 0,
                        phase: "analyzing",
                        currentScreen: "",
                        screenTitles: [],
                      };
                      const currentSteps = base.steps ?? [];
                      let nextSteps: Array<{ label: string; status: "loading" | "completed" }>;
                      if (stepStatus === "started") {
                        nextSteps = [...currentSteps, { label, status: "loading" }];
                      } else {
                        const copy = currentSteps.slice();
                        const lastIdx = copy.map((s, i) => ({ s, i })).filter(({ s }) => s.label === label).pop()?.i ?? -1;
                        if (lastIdx >= 0) {
                          copy[lastIdx] = { ...copy[lastIdx], status: "completed" };
                        } else {
                          copy.push({ label, status: "completed" });
                        }
                        nextSteps = copy;
                      }
                      return { ...base, steps: nextSteps, screenTitles: base.screenTitles ?? [] };
                    });
                  }
                  break;
                }
                case "ai_response":
                  // This is the persisted AI response message
                  if (eventData?.message) {
                    assistantMessageContent = eventData.message;
                    // Add immediately to conversation
                    const aiMsg: Message = {
                      id: `ai-${Date.now()}`,
                      content: eventData.message,
                      role: "assistant",
                      createdAt: new Date().toISOString(),
                      type: "final",
                      eventType: "ai_response",
                    };
                    setConversation((prev) =>
                      prev
                        ? { ...prev, messages: [...prev.messages, aiMsg] }
                        : prev
                    );
                  }
                  break;
                default:
                  if (eventData?.error && eventData?.code === "INSUFFICIENT_CREDITS") {
                    setError(eventData.error);
                    throw new Error(eventData.error);
                  }
                  break;
              }
            } catch (parseError) {
              // ignore parse errors
            }
          }
        }

        // Clean up reader ref
        readerRef.current = null;

        if (assistantMessageContent || generatedScreens.length > 0) {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            content:
              assistantMessageContent ||
              `Generated ${generatedScreens.length} screen(s)`,
            role: "assistant",
            createdAt: new Date().toISOString(),
            type: "final",
          };
          setConversation((prev) =>
            prev
              ? {
                  ...prev,
                  id: responseDesignId || prev.id,
                  messages: [...prev.messages, assistantMessage],
                }
              : prev
          );
        }
      } catch (e: any) {
        // Check if this was an abort error
        if (e.name === 'AbortError') {
          console.log('[useChatGenerator] Request aborted by user');
          return; // Don't set error for user-initiated cancellation
        }
        
        console.error("Error sending message:", e);
        setError(e?.message || "Failed to send message");
      } finally {
        setIsGenerating(false);
        setProgress(null);
        abortControllerRef.current = null;
        readerRef.current = null;
      }
    },
    []
  );

  const clearConversation = useCallback(() => {
    // Cancel any in-progress generation
    cancelGeneration();
    
    setConversation(null);
    setError(null);
    setIsGenerating(false);
    setProgress(null);
  }, [cancelGeneration]);

  const loadConversation = useCallback(async (designId: string) => {
    try {
      setError(null);
      const resp = await getDesignById(designId) as any;
      if (!resp?.success) {
        if (resp?.message?.toLowerCase().includes("not found")) {
          throw new Error("Design not found");
        }
        throw new Error(resp?.message || "Failed to load design");
      }
      const designData = resp.data;
      const messages = (designData.messages || []).map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        createdAt: msg.createdAt,
        status: msg.status,
        data: msg.data ?? undefined,
        type: msg.role === "assistant" ? "final" : undefined,
      }));
      const conv: Conversation = {
        id: designData.id,
        title: designData.title || "Untitled Design",
        designType: designData.type || "mobile_app",
        messages,
        screens: (designData.artboards || []).map((artboard: any) => ({
          id: artboard.id,
          title: artboard.title,
          description: artboard.description,
          html: artboard.html,
          createdAt: artboard.createdAt,
        })),
        colorPalette: designData.colorPalette,
      };
      setConversation(conv);
    } catch (e: any) {
      console.error("Error loading design:", e);
      setError(e?.message || "Failed to load design");
    }
  }, []);

  const debouncedUpdate = useDebouncedCallback((id: string, palette: any) => {
    updateDesign(id, { colorPalette: palette }).catch((err) => {
      console.error("Failed to save color palette:", err);
    });
  }, 1000);

  const updateColorPalette = useCallback(
    (key: keyof ColorPalette, value: string) => {
      setConversation((prev) => {
        if (!prev) return prev;
        const updatedPalette = {
          ...(prev.colorPalette || {}),
          [key]: value,
        } as ColorPalette;
        
        // Persist to backend with debounce
        debouncedUpdate(prev.id, updatedPalette);
        
        return { ...prev, colorPalette: updatedPalette };
      });
    },
    [debouncedUpdate]
  );

  return {
    conversation,
    isGenerating,
    progress,
    error,
    sendMessage,
    cancelGeneration,
    clearConversation,
    loadConversation,
    updateColorPalette,
  };
}
