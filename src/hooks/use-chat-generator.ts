import { useCallback, useRef, useEffect } from "react";
import { getDesignById, updateDesign, updateArtboard as apiUpdateArtboard, deleteArtboard as apiDeleteArtboard, getDesignMessages, DesignType } from "@/services/designs";
import { CONFIG } from "@/lib/config";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useDebouncedCallback } from "use-debounce";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  setConversation,
  updateConversation,
  setGenerating,
  setProgress,
  setError,
  updateArtboard,
  addMessage,
  prependMessages,
  updateMessageStatus,
  updateColorValue,
  setColorPalette,
  removeArtboard,
  resetEditor,
  cancelGeneration as cancelGenerationAction,
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
  const paginationRef = useRef({ page: 1, hasMore: true, isLoading: false });

  // TanStack Query for loading design
  const lastUpdateRef = useRef<Record<string, number>>({});
  const UPDATE_THROTTLE_MS = 150;

  // Track if we are in the middle of a reset to avoid double-loading
  const isResettingRef = useRef(false);

  // Reset editor when designId changes
  useEffect(() => {
    // If the conversation in store ALREADY matches the new designId, do NOT reset.
    // This handles the "create -> redirect" flow where we pre-populate the store.
    if (conversation?.id === designId) return;

    isResettingRef.current = true;
    dispatch(resetEditor());
    // Use timeout to ensure state is cleared before query might re-fetch or sync
    const timer = setTimeout(() => {
      isResettingRef.current = false;
    }, 0);
    return () => clearTimeout(timer);
  }, [designId, dispatch, conversation?.id]);

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

  // Fetch initial messages
  const { data: messagesData } = useQuery({
    queryKey: ["design-messages", designId],
    queryFn: async () => {
      if (!designId || designId === "new") return null;
      const resp = await getDesignMessages(designId, {
        page: 1,
        pageSize: 20,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      if (!resp.success) throw new Error(resp.message || "Failed to load messages");
      return resp.data;
    },
    enabled: !!designId && designId !== "new",
  });

  // Sync Redux with Query data
  useEffect(() => {
    if (queryData && !isResettingRef.current) {
      // Avoid overwriting existing conversation if it matches the loaded ID
      // This prevents the initial load from wiping out the real-time stream state during creation
      if (!conversation || conversation.id !== queryData.id) {
        dispatch(setConversation(queryData));
      }
    }
  }, [queryData, dispatch, conversation]);

  // Sync messages to Redux
  useEffect(() => {
    if (messagesData && !isResettingRef.current && conversation?.id === designId) {
      if (!conversation) return;
      const { items, pagination } = messagesData;
      
      // Sorted ASC for the UI
      const sortedItems = [...items].sort((a: any, b: any) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      // We only want to set these if we don't have messages yet or they are very few
      // This ensures we load the initial state correctly without wiping out real-time updates
      if (conversation.messages.length <= 1) {
        dispatch(updateConversation({ messages: sortedItems }));
      }

      paginationRef.current.page = pagination.currentPage;
      paginationRef.current.hasMore = pagination.currentPage < pagination.totalPages;
    }
  }, [messagesData, dispatch, conversation?.id, designId, conversation?.messages.length]);

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

  const { mutate: updateArtboardHtml } = useMutation({
    mutationFn: ({ id, html }: { id: string; html: string }) => apiUpdateArtboard(id, { html }),
    onMutate: ({ id, html }) => {
      dispatch(updateArtboard({ 
        id, 
        html, 
        title: "", // these are required by type but we only update html, usually reducer handles partial with ID match
        createdAt: new Date().toISOString() 
      } as any)); 
    }
  });

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (readerRef.current) readerRef.current.cancel().catch(() => {});
      dispatch(resetEditor());
    };
  }, [dispatch]);

  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (readerRef.current) {
      readerRef.current.cancel().catch(() => {});
      readerRef.current = null;
    }
    dispatch(cancelGenerationAction());

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
    async (message: string, designIdOverride?: string, designType?: DesignType, targetArtboardId?: string) => {
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
        
        // Determine endpoint based on whether we are updating a specific artboard or chatting generally
        let streamUrl: string;
        if (targetArtboardId) {
          // Use the specialized update endpoint
          streamUrl = `${baseUrl}/designs/chat/stream-update/${activeDesignId ?? ""}?prompt=${encodeURIComponent(message)}&artboardId=${targetArtboardId}`;
        } else {
          // Use the standard chat endpoint
          streamUrl = `${baseUrl}/designs/chat/stream/${activeDesignId ?? ""}?prompt=${encodeURIComponent(message)}`;
        }
        
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
                    status: "intent_analysis",
                  }));
                  dispatch(setProgress({
                    current: 0,
                    total: 0,
                    phase: "analyzing",
                    currentScreen: eventData?.message,
                  }));
                  break;
                
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
                  const screenId = eventData?.screenId;
                  
                  if (eventData?.messageId) {
                    dispatch(addMessage({
                      id: eventData.messageId,
                      content: kind === "update" ? `Updating: ${title}` : `Generating: ${title}`,
                      role: "assistant",
                      createdAt: new Date().toISOString(),
                      type: "stream",
                      status: "screen_start",
                      data: { title, kind, screenId },
                    }));
                  }

                  const targetId = screenId ?? `streaming-${title}`;
                  dispatch(updateArtboard({
                    id: targetId,
                    title,
                    html: "",
                    createdAt: new Date().toISOString(),
                    status: "generating",
                  }));

                  if (raw?.progress) {
                    dispatch(setProgress({
                      current: raw.progress.current,
                      total: raw.progress.total,
                      phase: "generating",
                    }));
                  }
                  break;
                }

                case "screen_streaming": {
                  const title = eventData?.title;
                  const screenId = eventData?.id || eventData?.screenId;
                  const accumulatedText = eventData?.accumulatedText || "";

                  // Throttle streaming updates
                  const targetId = screenId ?? `streaming-${title}`;
                  const now = Date.now();
                  if (lastUpdateRef.current[targetId] && 
                      now - lastUpdateRef.current[targetId] < UPDATE_THROTTLE_MS) {
                    break;
                  }
                  lastUpdateRef.current[targetId] = now;

                  let partialHtml = "";
                  try {
                    // Robust regex to capture the "html" value even if streamed in chunks
                    const htmlMatch = accumulatedText.match(/"html"\s*:\s*"((?:\\.|[^"\\])*?)(?:"|$)/);
                    if (htmlMatch?.[1]) {
                      partialHtml = htmlMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
                    }
                  } catch (err) {
                    console.warn("Stream parsing warning:", err);
                  }

                  if (title && partialHtml) {
                    dispatch(updateArtboard({
                      id: targetId,
                      title,
                      html: partialHtml,
                      createdAt: new Date().toISOString(),
                      status: "generating",
                    }));
                  }
                  if (raw?.progress) {
                    dispatch(setProgress({
                      current: raw.progress.current,
                      total: raw.progress.total,
                      phase: "generating",
                    }));
                  }
                  break;
                }

                case "screen_complete": {
                  const screenPayload = eventData?.screen ?? eventData;
                  const tempId = eventData?.tempId;
                  if (screenPayload) {
                    // Update last update time to ensure we don't skip final version
                    const targetId = screenPayload.id;
                    lastUpdateRef.current[targetId] = Date.now();

                    dispatch(updateArtboard({
                      id: screenPayload.id,
                      title: screenPayload.title,
                      description: screenPayload.description,
                      html: screenPayload.html,
                      createdAt: new Date().toISOString(),
                      status: "complete",
                      tempId: tempId, // Pass tempId so reducer can replace it
                    } as any));

                    if (eventData?.messageId) {
                      dispatch(updateMessageStatus({
                        id: eventData.messageId,
                        content: `Generated: ${screenPayload.title}`,
                        status: "screen_complete",
                        data: { screenId: screenPayload.id, screen: screenPayload }
                      }));
                    }
                  }
                  if (raw?.progress) {
                    dispatch(setProgress({
                      current: raw.progress.current,
                      total: raw.progress.total,
                      phase: "generating",
                    }));
                  }
                  break;
                }

                case "screen_update": {
                  // Dedicated event for update API success
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
                      status: "ai_response",
                      createdAt: new Date().toISOString(),
                      type: "final",
                    }));
                  }
                  break;

                case "ai_thinking":
                  if (eventData?.message) {
                    dispatch(addMessage({
                      id: `think-${Date.now()}`,
                      content: eventData.message,
                      role: "assistant",
                      status: "ai_thinking",
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

                case "status_update": {
                  const dataObj = eventData?.data || eventData;
                  const msg = dataObj?.message || dataObj?.error || "";
                  
                  // Debug logging to see exactly what we are catching
                  if (msg.startsWith("Error:") || dataObj?.code === 'INSUFFICIENT_CREDITS' || dataObj?.error) {
                    const errorText = msg.replace("Error:", "").trim();
                    console.log("[useChatGenerator] Credit Error Detected:", errorText);
                    
                    dispatch(setError(errorText));
                    return; 
                  } else if (msg) {
                    dispatch(addMessage({
                      id: `status-${Date.now()}`,
                      content: msg,
                      role: "system",
                      createdAt: new Date().toISOString(),
                      type: "stream",
                      status: "status_update",
                    }));
                  }
                  break;
                }

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
          let errorMessage = e?.message || "Failed to send message";
          
          // Check for credit-related errors
          if (
            errorMessage.toLowerCase().includes("credit") || 
            errorMessage.toLowerCase().includes("insufficient") ||
            errorMessage.toLowerCase().includes("payment")
          ) {
            errorMessage = "Insufficient credits. Please upgrade your plan to continue.";
          }

          dispatch(setError(errorMessage));
        }
      } finally {
        dispatch(setGenerating(false));
        dispatch(setProgress(null));
        abortControllerRef.current = null;
        readerRef.current = null;
        lastUpdateRef.current = {};
      }
    },
    [dispatch, conversation, designId]
  );

  const updateScreen = useCallback(async (designIdParam: string, artboardId: string, prompt: string) => {
    // Call sendMessage with the raw prompt and targetArtboardId to trigger the specialized update API
    await sendMessage(prompt, designIdParam, undefined, artboardId);
  }, [sendMessage]);

  const clearConversation = useCallback(() => {
    cancelGeneration();
    dispatch(setConversation(null));
  }, [dispatch, cancelGeneration]);

  const debouncedUpdate = useDebouncedCallback((id: string, palette: any) => {
    updateDesign(id, { colorPalette: palette }).catch(() => {});
  }, 1000);

  const updateColorPalette = useCallback((key: keyof ColorPalette, value: string) => {
    console.log('[useChatGenerator] updateColorPalette called:', key, value);
    if (conversation?.colorPalette) {
      // If updating main font family, also update heading/body fonts to match
      // This ensures the single font selector controls the whole theme
      let updatedPalette = { ...conversation.colorPalette, [key]: value };
      
      if (key === 'fontFamily') {
        updatedPalette = {
          ...updatedPalette,
          fontHeading: value,
          fontBody: value
        };
        // We also need to dispatch these updates to Redux
        dispatch(updateColorValue({ key: 'fontHeading', value }));
        dispatch(updateColorValue({ key: 'fontBody', value }));
      }

      dispatch(updateColorValue({ key, value }));
      debouncedUpdate(conversation.id, updatedPalette);
    } else {
      console.warn('[useChatGenerator] No conversation or colorPalette found');
    }
  }, [dispatch, conversation, debouncedUpdate]);

  const loadMoreMessages = useCallback(async () => {
    if (!designId || designId === "new" || paginationRef.current.isLoading || !paginationRef.current.hasMore) {
      return;
    }

    try {
      paginationRef.current.isLoading = true;
      const nextPage = paginationRef.current.page + 1;
      
      const resp = await getDesignMessages(designId, {
        page: nextPage,
        pageSize: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc' // We want latest messages first usually, but the backend order might vary.
      });

      if (resp.success && resp.data) {
        const { items, pagination } = resp.data;
        
        // Items are in desc order from API (latest first), 
        // but our UI expects them in asc order (oldest first) because we prepend them.
        // Wait, if it's DESC, and we prepend, then:
        // [New1, New2] prepend [Old1, Old2] -> [Old1, Old2, New1, New2]
        // Prepending [Page2Items] before [Page1Items]
        // Page 1: [M1, M2] (M2 is newer)
        // Page 2: [M3, M4] (M4 is newer, M3 is older than M1)
        // Prepending [M3, M4] -> [M3, M4, M1, M2] - Correct!
        // But the items should be sorted ASC within the prepended block to match the list flow.
        const sortedItems = [...items].sort((a: any, b: any) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        dispatch(prependMessages(sortedItems));
        
        paginationRef.current.page = pagination.currentPage;
        paginationRef.current.hasMore = pagination.currentPage < pagination.totalPages;
      }
    } catch (err) {
      console.error("Failed to load more messages:", err);
    } finally {
      paginationRef.current.isLoading = false;
    }
  }, [designId, dispatch]);

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
    updateArtboardHtml,
    deleteArtboard,
    loadMoreMessages,
    hasMoreMessages: paginationRef.current.hasMore,
  };
}
