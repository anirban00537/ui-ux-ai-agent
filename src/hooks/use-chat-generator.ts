"use client";

import { useCallback, useState } from "react";
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
}

interface ColorPalette {
  primary: string;
  backgroundLight: string;
  backgroundDark: string;
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
  phase: "planning" | "generating" | "complete";
  currentScreen?: string;
}

interface UseChatGeneratorResult {
  conversation: Conversation | null;
  isGenerating: boolean;
  progress: GenerationProgress | null;
  error: string | null;
  sendMessage: (message: string, designId?: string) => Promise<void>;
  clearConversation: () => void;
  loadConversation: (designId: string) => Promise<void>;
  updateColorPalette: (key: keyof ColorPalette, value: string) => void;
}

export function useChatGenerator(): UseChatGeneratorResult {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (message: string, designId?: string) => {
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

        const addStreamMessage = (content: string, type: string) => {
          if (!content) return;
          const streamMessage: Message = {
            id: `stream-${Date.now()}-${Math.random()}`,
            content,
            role: "system",
            createdAt: new Date().toISOString(),
            type: "stream",
            eventType: type,
          };
          setConversation((prev) =>
            prev ? { ...prev, messages: [...prev.messages, streamMessage] } : prev
          );
        };

        while (true) {
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
                    phase: "planning",
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
                case "screen_start":
                  addStreamMessage(
                    eventData?.message || `Starting: ${eventData?.title}`,
                    "screen_start"
                  );
                  if (raw?.progress || eventData?.progress) {
                    const pg = raw?.progress ?? eventData?.progress;
                    setProgress({
                      current: pg.current,
                      total: pg.total,
                      phase: "generating",
                      currentScreen: eventData?.title,
                    });
                  }
                  break;
                case "screen_complete": {
                  const screenPayload = eventData?.screen ?? eventData;
                  if (screenPayload) {
                    const planTitle = screenPayload.planTitle;
                    const newScreen: Screen = {
                      id: screenPayload.id ?? `${Date.now()}`,
                      title: screenPayload.title,
                      description: screenPayload.description,
                      html: screenPayload.html,
                      createdAt: new Date().toISOString(),
                      status: 'complete',
                    };
                    generatedScreens.push(newScreen);
                    addStreamMessage(`Completed: ${screenPayload.title}`, "screen_complete");
                    setConversation((prev) => {
                      if (!prev) return prev;
                      const matchesBy = (s: Screen) =>
                        s.id === newScreen.id ||
                        s.title === newScreen.title ||
                        (planTitle != null && s.title === planTitle);
                      const matched = prev.screens.filter(matchesBy);
                      const nextScreens = prev.screens
                        .map((s) => (matchesBy(s) ? newScreen : s))
                        .concat(matched.length ? [] : [newScreen]);
                      return { ...prev, id: responseDesignId || prev.id, screens: nextScreens };
                    });
                    if (raw?.progress || eventData?.progress) {
                      const pg = raw?.progress ?? eventData?.progress;
                      setProgress({
                        current: pg.current,
                        total: pg.total,
                        phase: "generating",
                        currentScreen: `Completed: ${screenPayload.title}`,
                      });
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
                  if (screenPayload) {
                    const updatedScreen: Screen = {
                      id: screenPayload.id,
                      title: screenPayload.title,
                      description: screenPayload.description,
                      html: screenPayload.html,
                      createdAt: new Date().toISOString(),
                    };
                    addStreamMessage(`Updated: ${screenPayload.title}`, "screen_update");
                    setConversation((prev) =>
                      prev
                        ? {
                            ...prev,
                            id: responseDesignId || prev.id,
                            screens: prev.screens.map((s) =>
                              s.id === updatedScreen.id ? updatedScreen : s
                            ),
                          }
                        : prev
                    );
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
        console.error("Error sending message:", e);
        setError(e?.message || "Failed to send message");
      } finally {
        setIsGenerating(false);
        setProgress(null);
      }
    },
    []
  );

  const clearConversation = useCallback(() => {
    setConversation(null);
    setError(null);
    setIsGenerating(false);
    setProgress(null);
  }, []);

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
      const conv: Conversation = {
        id: designData.id,
        title: designData.title || "Untitled Design",
        designType: designData.type || "mobile_app",
        messages: (designData.messages || []).map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          role: msg.role,
          createdAt: msg.createdAt,
          status: msg.status,
        })),
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
    clearConversation,
    loadConversation,
    updateColorPalette,
  };
}
