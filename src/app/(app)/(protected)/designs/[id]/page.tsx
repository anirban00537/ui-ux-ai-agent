"use client";

import React, { useEffect, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  CustomResizableSidebar,
  SidebarContent,
  Editor,
  BackgroundGrid,
} from "@/components/design-editor";
import { useChatGenerator } from "@/hooks/use-chat-generator";
import { usePrompt } from "@/contexts/PromptContext";
import { createDesignConversation } from "@/services/designs";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function DesignEditorPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [currentDesignId, setCurrentDesignId] = React.useState<string>(params.id as string);
  const promptFromUrl = searchParams.get("prompt");
  const {
    conversation,
    isGenerating,
    isLoadingDesign,
    progress,
    error,
    sendMessage,
    cancelGeneration,
    clearConversation,
    updateColorPalette,
    updateScreen,
    syncArtboardPosition,
    deleteArtboard,
    loadMoreMessages,
    hasMoreMessages,
    updateArtboardHtml,
  } = useChatGenerator(currentDesignId);

  const { prompt: promptContext, type: typeContext, clearPrompt } = usePrompt();
  const hasSentInitialPrompt = useRef(false);

  // Sync params with state in case of navigation
  useEffect(() => {
    if (params.id) setCurrentDesignId(params.id as string);
  }, [params.id]);

  // Handle initialization from Context (New Flow)
  useEffect(() => {
    const initFromContext = async () => {
      if (
        currentDesignId === "new" &&
        promptContext &&
        !hasSentInitialPrompt.current &&
        !isGenerating
      ) {
        hasSentInitialPrompt.current = true;
        try {
          // 1. Create Design
          const title = promptContext.trim().slice(0, 50) + (promptContext.length > 50 ? "..." : "");
          const resp = await createDesignConversation(title, typeContext);
          
          if (resp?.success && resp?.data?.id) {
            const newId = resp.data.id;
            
            // 2. Update State & URL
            setCurrentDesignId(newId);
            window.history.replaceState(null, "", `/designs/${newId}`);
            
            // 3. Start Stream with NEW ID
            await sendMessage(promptContext, newId, typeContext);
            
            // 4. Clear Context
            clearPrompt();
          }
        } catch (err) {
          console.error("Failed to initialize design:", err);
          // @ts-ignore
          toast.error("Failed to create design. Please try again.");
          // Optional: redirect to home if critical
          // router.push('/home');
        }
      }
    };

    initFromContext();
  }, [currentDesignId, promptContext, typeContext, isGenerating, sendMessage, clearPrompt]);

  // Handle initialization from URL (Legacy/Direct Link)
  useEffect(() => {
    if (
      promptFromUrl &&
      currentDesignId &&
      currentDesignId !== "new" && 
      !hasSentInitialPrompt.current &&
      !isGenerating
    ) {
      const timer = setTimeout(() => {
        if (!conversation || conversation.messages.length === 0) {
          hasSentInitialPrompt.current = true;
          sendMessage(promptFromUrl, currentDesignId);
          window.history.replaceState({}, "", `/designs/${currentDesignId}`);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [
    promptFromUrl,
    currentDesignId,
    isGenerating,
    conversation,
    sendMessage,
  ]);

  if (isLoadingDesign) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2228]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
          <p className="text-sm font-medium text-white/50 font-mono uppercase tracking-[1.4px]">Loading your designs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-30 flex overflow-hidden bg-[#1f2228]">
      <div className="absolute inset-0 opacity-40">
        <BackgroundGrid />
      </div>

      <div className="relative flex-1 min-w-0 h-full">
        <Editor
          onDeleteArtboard={(artboardId: string) => {
            deleteArtboard(artboardId);
          }}
          onUpdateArtboard={(artboardId: string, prompt: string) => {
             updateScreen(currentDesignId, artboardId, prompt);
          }}
          onSaveArtboard={(id, data) => {
            syncArtboardPosition({ id, data });
          }}
          onSaveArtboardHtml={(id, html) => {
            updateArtboardHtml({ id, html });
          }}
        />
      </div>

      <CustomResizableSidebar
        side="right"
        defaultWidth={350}
        minWidth={250}
        maxWidth={600}
        className="relative shrink-0 z-10"
      >
        <SidebarContent
          onGenerate={(prompt) => sendMessage(prompt, currentDesignId)}
          onClear={clearConversation}
          onCancel={cancelGeneration}
          onColorChange={updateColorPalette}
          loadMoreMessages={loadMoreMessages}
          hasMoreMessages={hasMoreMessages}
        />
      </CustomResizableSidebar>
    </div>
  );
}
