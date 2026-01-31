import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { parse as parsePartialJson } from "partial-json";
import {
  savePrompt,
  updateDoc,
  generateAndCreateCards,
  getDoc,
  type CreatePlanFromPromptDto,
  type UpdateDocPayload,
  type CardGenerationChunk,
  type StreamChunk,
  type OutlineResponse,
  generateOutlineStream,
} from "@/services/docs";
import { useAppDispatch } from "@/store/hooks";
import { fetchCreditBalance } from "@/store/slices/subscriptionSlice";
import { subscriptionKeys } from "@/hooks/use-subscription";
import { useAdminThemesList } from "./use-themes";
import { type ThemeResponse } from "@/services/themes";

// Query keys
export const outlineKeys = {
  all: ["outlines"] as const,
  detail: (id: string) => [...outlineKeys.all, id] as const,
};

// --- Sub-Hook: Outline Generation (Streaming) ---
export const useOutlineGeneration = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const generateOutlineStreamMutation = useGenerateOutlineStream();

  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingContent, setStreamingContent] = useState<string>("");
  const [completedOutline, setCompletedOutline] = useState<any>(null);
  const [generationSpeed, setGenerationSpeed] = useState(0);

  const hasStartedStreaming = useRef(false);
  const lastContentLengthRef = useRef(0);
  const lastUpdateTimestampRef = useRef(0);
  
  useEffect(() => {
    lastUpdateTimestampRef.current = Date.now();
  }, []);

  // Decay speed effect: if no updates for >200ms, start decaying the speed visual
  useEffect(() => {
    if (!isGenerating) {
      setTimeout(() => setGenerationSpeed(0), 0);
      return;
    }
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateTimestampRef.current;
      if (timeSinceLastUpdate > 150) {
        setGenerationSpeed((prev) => Math.max(0, prev * 0.8));
      }
    }, 100);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const startGeneration = useCallback(
    (outlineId: string) => {
      // CRITICAL: Prevent double-start
      if (isGenerating || hasStartedStreaming.current) {
        return;
      }

      setIsGenerating(true);
      setStreamingContent("");
      setCompletedOutline(null);
      setGenerationSpeed(0);
      hasStartedStreaming.current = true;
      lastContentLengthRef.current = 0;
      lastUpdateTimestampRef.current = Date.now();

      generateOutlineStreamMutation.mutate({
        outlineId,
        onChunk: (chunk) => {
          if (chunk.type === "chunk" && chunk.accumulated) {
            const now = Date.now();
            const deltaChars =
              chunk.accumulated.length - lastContentLengthRef.current;
            const timeDiff = now - lastUpdateTimestampRef.current;

            if (timeDiff > 0 && deltaChars >= 0) {
              const instantSpeed = (deltaChars / Math.max(timeDiff, 1)) * 1000;
              setGenerationSpeed((prev) => prev * 0.3 + instantSpeed * 0.7);
            }

            lastContentLengthRef.current = chunk.accumulated.length;
            lastUpdateTimestampRef.current = now;
            setStreamingContent(chunk.accumulated);
          } else if (chunk.type === "complete") {
            if (chunk.data) {
              setCompletedOutline(chunk.data);
            }
            setIsGenerating(false);
            setGenerationSpeed(0);
            hasStartedStreaming.current = false;
            
            // Refresh credits on completion
            dispatch(fetchCreditBalance());
            queryClient.invalidateQueries({
              queryKey: subscriptionKeys.credits(),
            });
            queryClient.invalidateQueries({
              queryKey: subscriptionKeys.status(),
            });
          } else if (chunk.type === "error") {
            console.error("[useOutlineGeneration] Streaming error:", chunk.message);
            setIsGenerating(false);
            setGenerationSpeed(0);
            hasStartedStreaming.current = false;
          }
        },
      });
    },
    [isGenerating, generateOutlineStreamMutation, dispatch, queryClient]
  );

  const resetGeneration = useCallback(() => {
    setIsGenerating(false);
    setStreamingContent("");
    setCompletedOutline(null);
    setGenerationSpeed(0);
    hasStartedStreaming.current = false;
  }, []);

  return {
    isGenerating,
    streamingContent,
    completedOutline,
    generationSpeed,
    startGeneration,
    resetGeneration,
    hasStartedStreaming,
  };
};

// Get outline query (outline data is now part of doc)
export const useOutline = (docId: string | null) => {
  const dispatch = useAppDispatch();
  const hasRefreshedCredits = useRef(false);

  const query = useQuery({
    queryKey: docId ? outlineKeys.detail(docId) : ["outline", "null"],
    queryFn: () => {
      if (!docId) {
        throw new Error("Doc ID is required");
      }
      return getDoc(docId);
    },
    enabled: !!docId,
    staleTime: 30000, // 30 seconds - prevent unnecessary refetches
    // REMOVED refetchInterval - streaming handles real-time updates
    // Polling every 3s was causing duplicate API calls
  });

  const status = query.data?.data?.outlineStatus;
  useEffect(() => {
    if (status === "completed" && !hasRefreshedCredits.current) {
      hasRefreshedCredits.current = true;
      dispatch(fetchCreditBalance());
    }
  }, [status, dispatch]);

  return query;
};

// Save prompt mutation
export const useSavePrompt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePlanFromPromptDto) => savePrompt(payload),
    onSuccess: (data) => {
      if (data.success && data.data?.id) {
        queryClient.prefetchQuery({
          queryKey: outlineKeys.detail(data.data.id),
          queryFn: () => getDoc(data.data.id),
        });
      }
    },
  });
};

// Update outline mutation (now updates doc with outline data)
export const useUpdateOutline = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDocPayload }) =>
      updateDoc(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: outlineKeys.detail(variables.id),
      });
    },
  });
};

// Generate outline stream hook
export const useGenerateOutlineStream = () => {
  return useMutation({
    mutationFn: ({
      outlineId,
      onChunk,
    }: {
      outlineId: string;
      onChunk: (chunk: StreamChunk) => void;
    }) => generateOutlineStream(outlineId, onChunk),
  });
};

// Generate and create cards hook
export const useGenerateAndCreateCards = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      docId,
      onChunk,
    }: {
      docId: string;
      onChunk: (chunk: CardGenerationChunk) => void;
    }) => generateAndCreateCards(docId, onChunk),
    onSuccess: () => {
      dispatch(fetchCreditBalance());
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.credits() });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.status() });
    },
    onError: (error: any) => {
      console.error("[useGenerateAndCreateCards] Mutation error:", error);
    },
  });
};

/**
 * Consolidated hook for the Outline Editor Page logic
 */
export const useOutlineEditor = (outlineId: string) => {
  const updateOutlineMutation = useUpdateOutline();

  // 1. Data Fetching
  const {
    data: outlineResponse,
    isLoading,
    error: outlineError,
    refetch,
  } = useOutline(outlineId);

  const { data: themesResponse } = useAdminThemesList();

  // 2. Generation Hook
  const {
    isGenerating: isStreaming,
    streamingContent,
    completedOutline,
    generationSpeed,
    startGeneration,
    resetGeneration,
  } = useOutlineGeneration();

  // 3. Local State
  const [selectedTheme, setSelectedTheme] = useState<ThemeResponse | null>(
    null
  );
  const [themeSaveStatus, setThemeSaveStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );

  // Refs
  const hasAutoSelectedTheme = useRef(false);
  const hasAutoStartedGeneration = useRef(false); // NEW: Track auto-start
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Derived Values
  const outline = outlineResponse?.data || null;
  const themes = useMemo(
    () => themesResponse?.data?.list || [],
    [themesResponse]
  );

  const displayError =
    outlineError?.message ||
    (outlineResponse && !outlineResponse.success
      ? outlineResponse.message
      : null);

  const docId = outlineResponse?.data?.id || outline?.id || outlineId;
  const docUrl = docId ? `/docs/${docId}` : null;

  // Auto-start streaming logic (IMPROVED: Only runs once)
  useEffect(() => {
    // CRITICAL: Only start ONCE per mount using ref
    if (hasAutoStartedGeneration.current) {
      return;
    }

    if (
      outline &&
      outline.outlineStatus === "generating" &&
      (!outline.cards || outline.cards.length === 0) &&
      !isStreaming &&
      !streamingContent
    ) {
      hasAutoStartedGeneration.current = true;
      startGeneration(outlineId);
    }
  }, [outline?.outlineStatus, outline?.cards?.length]); // Minimal dependencies

  // When stream completes, refetch to ensure we have canonical DB state
  useEffect(() => {
    if (completedOutline) {
      refetch();
    }
  }, [completedOutline, refetch]);

  // Computed Outline Data (Merging stream vs fetched)
  const outlineData = useMemo(() => {
    if (completedOutline) {
      let displayTitle = completedOutline.title;
      if (!displayTitle || displayTitle.match(/^[.\s]+$/)) {
        displayTitle = outline?.title || "Untitled Doc";
      }
      const validOutlines = (completedOutline.outlines || []).filter(
        (o: any) => o.content && o.content.trim()
      );
      return {
        title: displayTitle,
        outlines: validOutlines,
      };
    }

    if (streamingContent) {
      try {
        const partial = parsePartialJson(streamingContent);
        if (partial && partial.outlines && partial.outlines.length > 0) {
          let displayTitle = partial.title || outline?.title || "Generating...";
          if (displayTitle.match(/^[.\s]+$/)) displayTitle = "Generating...";
          return {
            title: displayTitle,
            outlines: partial.outlines,
          };
        }
      } catch {
        // Ignore parse errors
      }
    }

    if (outline?.cards && outline.cards.length > 0) {
      const hasOutlineData = outline.cards.some((card: any) => card.outline?.content);
      if (hasOutlineData) {
        const outlines = outline.cards
          .filter((card: any) => card.outline?.content)
          .map((card: any) => ({
            content: card.outline.content,
            layoutId: card.outline.layoutId,
            schemaId: card.outline.schemaId,
          }));
        
        return {
          title: outline.title || "Untitled Doc",
          outlines,
        };
      }
    }
    
    return null;
  }, [outline?.title, outline?.cards, streamingContent, completedOutline]);

  // Theme Logic
  const saveThemeToDoc = useCallback(
    async (theme: ThemeResponse) => {
      if (!docId) return;
      setThemeSaveStatus("saving");
      try {
        await updateDoc(docId, { globalTheme: theme.themeData });
        setThemeSaveStatus("saved");
        setTimeout(() => setThemeSaveStatus("idle"), 2000);
      } catch (err) {
        console.error("Failed to save theme:", err);
        setThemeSaveStatus("idle");
      }
    },
    [docId]
  );

  useEffect(() => {
    if (
      !hasAutoSelectedTheme.current &&
      themes.length > 0 &&
      docId &&
      !selectedTheme
    ) {
      hasAutoSelectedTheme.current = true;
      const randomIndex = Math.floor(Math.random() * themes.length);
      const randomTheme = themes[randomIndex];
      setTimeout(() => {
        setSelectedTheme(randomTheme);
        saveThemeToDoc(randomTheme);
      }, 0);
    }
  }, [themes, docId, selectedTheme, saveThemeToDoc]);

  // Regenerate Handler
  const handleRegenerate = (newPrompt: string, newCardCount: number) => {
    resetGeneration();
    hasAutoStartedGeneration.current = false; // Reset for new generation
    
    updateOutlineMutation.mutate(
      {
        id: outlineId,
        payload: {
          prompt: newPrompt,
          numberOfCards: newCardCount,
          outlineStatus: "generating",
        },
      },
      {
        onSuccess: () => {
          hasAutoStartedGeneration.current = true;
          startGeneration(outlineId);
        },
      }
    );
  };

  // Debounced auto-save
  const debouncedSave = useCallback(
    (updatedOutline: OutlineResponse) => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        setSaveStatus("saving");
        updateOutlineMutation.mutate(
          { id: outlineId, payload: updatedOutline },
          {
            onSuccess: () => {
              setSaveStatus("saved");
              setTimeout(() => setSaveStatus("idle"), 2000);
            },
            onError: () => setSaveStatus("idle"),
          }
        );
      }, 1500);
    },
    [outlineId, updateOutlineMutation]
  );

  return {
    // Data
    outline,
    outlineData,
    themes,
    selectedTheme,
    docUrl,
    displayError,

    // Status
    isLoading,
    isStreaming,
    generationSpeed,
    streamingContent,
    themesLoading: false,
    saveStatus,
    themeSaveStatus,

    // Actions
    handleRegenerate,
    debouncedSave,
    setSelectedTheme,
    saveThemeToDoc,
    refetch,
  };
};
