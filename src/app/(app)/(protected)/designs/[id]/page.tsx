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

export default function DesignEditorPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const designId = params.id as string;
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
  } = useChatGenerator(designId);

  const { prompt: promptContext, type: typeContext, clearPrompt } = usePrompt();
  const hasSentInitialPrompt = useRef(false);

  // Handle initialization from Context (New Flow)
  useEffect(() => {
    const initFromContext = async () => {
      if (
        designId === "new" &&
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
            
            // 2. Update URL immediately
            window.history.replaceState(null, "", `/designs/${newId}`);
            
            // 3. Start Stream
            await sendMessage(promptContext, newId, typeContext);
            
            // 4. Clear Context
            clearPrompt();
          }
        } catch (err) {
          console.error("Failed to initialize design:", err);
          // Optional: Show error
        }
      }
    };

    initFromContext();
  }, [designId, promptContext, typeContext, isGenerating, sendMessage, clearPrompt]);

  // Handle initialization from URL (Legacy/Direct Link)
  useEffect(() => {
    if (
      promptFromUrl &&
      designId &&
      designId !== "new" && 
      !hasSentInitialPrompt.current &&
      !isGenerating
    ) {
      const timer = setTimeout(() => {
        if (!conversation || conversation.messages.length === 0) {
          hasSentInitialPrompt.current = true;
          sendMessage(promptFromUrl, designId);
          window.history.replaceState({}, "", `/designs/${designId}`);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [
    promptFromUrl,
    designId,
    isGenerating,
    conversation,
    sendMessage,
  ]);

  if (isLoadingDesign) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Loading your designs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-30 flex overflow-hidden bg-background">
      <div className="absolute inset-0 opacity-40">
        <BackgroundGrid />
      </div>

      <div className="relative flex-1 min-w-0 h-full">
        <Editor
          onDeleteArtboard={(artboardId: string) => {
            deleteArtboard(artboardId);
          }}
          onUpdateArtboard={(artboardId: string, prompt: string) => {
             updateScreen(designId, artboardId, prompt);
          }}
          onSaveArtboard={(id, data) => {
            syncArtboardPosition({ id, data });
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
          onGenerate={(prompt) => sendMessage(prompt, designId)}
          onClear={clearConversation}
          onCancel={cancelGeneration}
          onColorChange={updateColorPalette}
        />
      </CustomResizableSidebar>
    </div>
  );
}
