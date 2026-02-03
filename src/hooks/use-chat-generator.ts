import { useCallback, useRef, useEffect } from "react";
import { getDesignById, updateDesign, updateArtboard as apiUpdateArtboard, deleteArtboard as apiDeleteArtboard, DesignType } from "@/services/designs";
import { CONFIG } from "@/lib/config";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useDebouncedCallback } from "use-debounce";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  setConversation, 
  setGenerating, 
  setProgress, 
  setError,
  updateArtboard,
  addMessage,
  updateMessageStatus,
  updateColorValue,
  setColorPalette,
  removeArtboard,
  Conversation,
  Message,
  ColorPalette,
  Artboard
} from "@/store/slices/designEditorSlice";

export function useChatGenerator(designId?: string) {
  const dispatch = useAppDispatch();
  const conversation = useAppSelector((state) => state.designEditor.conversation);
  const isGenerating = useAppSelector((state) => state.designEditor.isGenerating);
  const progress = useAppSelector((state) => state.designEditor.progress);
  const error = useAppSelector((state) => state.designEditor.error);

  const abortControllerRef = useRef<AbortController | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  // TanStack Query for loading design
  const { data: queryData, isLoading: isLoadingDesign } = useQuery({
    queryKey: ["design", designId],
    queryFn: async () => {
      if (!designId || designId === "new") return null;
      const resp = await getDesignById(designId);
      if (!resp.success) throw new Error(resp.message || "Failed to load design");
      return resp.data;
    },
    enabled: !!designId && designId !== "new",
  });

  // Sync Redux with Query data
  useEffect(() => {
    if (queryData) {
      dispatch(setConversation(queryData));
    }
  }, [queryData, dispatch]);

  // Sync position mutation
  const { mutate: syncArtboardPosition } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiUpdateArtboard(id, data),
  });

  const { mutate: deleteArtboard } = useMutation({
    mutationFn: (id: string) => apiDeleteArtboard(id),
    onSuccess: (_, id) => {
      dispatch(removeArtboard(id));
    }
  });

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (readerRef.current) readerRef.current.cancel().catch(() => {});
    };
  }, []);

  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (readerRef.current) {
      readerRef.current.cancel().catch(() => {});
      readerRef.current = null;
    }
    dispatch(setGenerating(false));
    dispatch(setProgress(null));

    if (conversation) {
      dispatch(addMessage({
        id: `cancel-${Date.now()}`,
        content: "Generation cancelled.",
        role: "system",
        createdAt: new Date().toISOString(),
        type: "stream",
        eventType: "cancelled",
      }));
    }
  }, [dispatch, conversation]);

  const sendMessage = useCallback(
    async (message: string, designIdOverride?: string, designType?: DesignType) => {
      const activeDesignId = designIdOverride || designId;
      if (abortControllerRef.current) abortControllerRef.current.abort();
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        dispatch(setGenerating(true));
        dispatch(setError(null));

        const userMessage: Message = {
          id: Date.now().toString(),
          content: message,
          role: "user",
          createdAt: new Date().toISOString(),
        };

        if (conversation) {
          dispatch(addMessage(userMessage));
        } else {
          dispatch(setConversation({
            id: activeDesignId || "temp",
            title: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
            designType: designType || "mobile_app",
            messages: [userMessage],
            artboards: [],
          }));
        }

        const baseUrl = CONFIG.API_URL.replace(/\/$/, "");
        const streamUrl = `${baseUrl}/designs/chat/stream/${activeDesignId ?? ""}?prompt=${encodeURIComponent(message)}`;
        
        const res = await fetch(streamUrl, {
          method: "GET",
          headers: {
            Accept: "text/event-stream",
            apisecretkeycheck: CONFIG.API_SECRET,
          },
          credentials: "include",
          signal: abortController.signal,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.message || data?.error || `Request failed: ${res.status}`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");
        readerRef.current = reader;

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          if (abortController.signal.aborted) break;
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

              switch (eventType) {
                case "intent_analysis":
                  dispatch(addMessage({
                    id: `intent-${Date.now()}`,
                    content: eventData?.message || "Analyzing your request...",
                    role: "system",
                    createdAt: new Date().toISOString(),
                    type: "stream",
                    eventType: "intent_analysis",
                  }));
                  dispatch(setProgress({
                    current: 0,
                    total: 0,
                    phase: "analyzing",
                    currentScreen: eventData?.message,
                  }));
                  break;
                
                case "planning":
                  dispatch(setProgress({
                    current: 0,
                    total: 0,
                    phase: "planning",
                    currentScreen: eventData?.message,
                  }));
                  break;

                case "planning_complete":
                  dispatch(setProgress({
                    current: 0,
                    total: eventData?.totalScreens ?? 0,
                    phase: "planning",
                    currentScreen: `Planning complete`,
                  }));
                  break;

                case "screen_start": {
                  const title = eventData?.title ?? "Screen";
                  const kind = eventData?.kind ?? "create";
                  if (eventData?.messageId) {
                    dispatch(addMessage({
                      id: eventData.messageId,
                      content: kind === "update" ? `Updating: ${title}` : `Generating: ${title}`,
                      role: "assistant",
                      createdAt: new Date().toISOString(),
                      type: "stream",
                      status: "screen_start",
                      data: { title, kind, screenId: eventData?.screenId },
                    }));
                  }
                  break;
                }

                case "screen_streaming": {
                  const title = eventData?.title;
                  const screenId = eventData?.id || eventData?.screenId;
                  const accumulatedText = eventData?.accumulatedText || "";
                  let partialHtml = "";
                  try {
                    const htmlMatch = accumulatedText.match(/"html"\s*:\s*"((?:\\.|[^"\\])*?)(?:"|$)/);
                    if (htmlMatch?.[1]) {
                      partialHtml = htmlMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
                    }
                  } catch {}

                  if (title && partialHtml) {
                    dispatch(updateArtboard({
                      id: screenId ?? `streaming-${title}`,
                      title,
                      html: partialHtml,
                      createdAt: new Date().toISOString(),
                      status: "generating",
                    }));
                  }
                  break;
                }

                case "screen_complete": {
                  const screenPayload = eventData?.screen ?? eventData;
                  if (screenPayload) {
                    dispatch(updateArtboard({
                      id: screenPayload.id,
                      title: screenPayload.title,
                      description: screenPayload.description,
                      html: screenPayload.html,
                      createdAt: new Date().toISOString(),
                      status: "complete",
                    }));
                    if (eventData?.messageId) {
                      dispatch(updateMessageStatus({
                        id: eventData.messageId,
                        content: `Generated: ${screenPayload.title}`,
                        status: "screen_complete",
                        data: { screenId: screenPayload.id, screen: screenPayload }
                      }));
                    }
                  }
                  break;
                }

                case "screen_update": {
                  const screenPayload = eventData?.screen ?? eventData;
                  if (screenPayload) {
                    dispatch(updateArtboard({
                      id: screenPayload.id,
                      title: screenPayload.title,
                      description: screenPayload.description,
                      html: screenPayload.html,
                      createdAt: new Date().toISOString(),
                      status: "complete"
                    }));
                  }
                  break;
                }

                case "screen_delete": {
                  const screenId = eventData?.screen?.id ?? eventData?.screenId;
                  if (screenId) dispatch(removeArtboard(screenId));
                  break;
                }

                case "phase_planned":
                  dispatch(setProgress({
                    current: 0,
                    total: eventData?.totalScreens ?? 0,
                    phase: "generating",
                    currentScreen: "Starting generation...",
                    screenTitles: eventData?.screenTitles ?? [],
                  }));
                  break;

                case "ai_response":
                  if (eventData?.message) {
                    dispatch(addMessage({
                      id: `ai-${Date.now()}`,
                      content: eventData.message,
                      role: "assistant",
                      createdAt: new Date().toISOString(),
                      type: "final",
                    }));
                  }
                  break;
                
                case "phase_theme_generating":
                  dispatch(setProgress({
                    current: 0,
                    total: 0,
                    phase: "theme_generating",
                    currentScreen: "Generating theme...",
                  }));
                  break;

                case "phase_theme_complete":
                case "color_palette": {
                  const palette = eventData?.palette ?? eventData;
                  if (palette && typeof palette === 'object' && palette.background) {
                    dispatch(setColorPalette(palette));
                  }
                  break;
                }

                case "phase_step":
                  if (eventData?.label) {
                    dispatch(addMessage({
                      id: `phase-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                      content: eventData.label,
                      role: "system",
                      createdAt: new Date().toISOString(),
                      type: "stream",
                      status: "phase_step",
                      data: { 
                        label: eventData.label, 
                        status: eventData.status 
                      }
                    }));
                  }
                  break;

                case "all_complete":
                  dispatch(setProgress({
                    current: 100,
                    total: 100,
                    phase: "complete",
                    currentScreen: "All tasks completed.",
                  }));
                  break;
              }
            } catch {}
          }
        }
      } catch (e: any) {
        if (e.name !== "AbortError") {
          dispatch(setError(e?.message || "Failed to send message"));
        }
      } finally {
        dispatch(setGenerating(false));
        dispatch(setProgress(null));
        abortControllerRef.current = null;
        readerRef.current = null;
      }
    },
    [dispatch, conversation, designId]
  );

  const updateScreen = useCallback(async (designIdParam: string, artboardId: string, prompt: string) => {
    await sendMessage(`Update screen ${artboardId}: ${prompt}`, designIdParam);
  }, [sendMessage]);

  const clearConversation = useCallback(() => {
    cancelGeneration();
    dispatch(setConversation(null));
  }, [dispatch, cancelGeneration]);

  const debouncedUpdate = useDebouncedCallback((id: string, palette: any) => {
    updateDesign(id, { colorPalette: palette }).catch(() => {});
  }, 1000);

  const updateColorPalette = useCallback((key: keyof ColorPalette, value: string) => {
    if (conversation?.colorPalette) {
      const updatedPalette = { ...conversation.colorPalette, [key]: value };
      dispatch(updateColorValue({ key, value }));
      debouncedUpdate(conversation.id, updatedPalette);
    }
  }, [dispatch, conversation, debouncedUpdate]);

  return {
    conversation,
    isGenerating,
    isLoadingDesign,
    progress,
    error,
    sendMessage,
    updateScreen,
    cancelGeneration,
    clearConversation,
    updateColorPalette,
    syncArtboardPosition,
    deleteArtboard,
  };
}
