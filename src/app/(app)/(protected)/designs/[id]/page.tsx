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

export default function DesignEditorPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const designId = params.id as string;
  const promptFromUrl = searchParams.get("prompt");
  const {
    conversation,
    isGenerating,
    progress,
    error,
    sendMessage,
    cancelGeneration,
    clearConversation,
    loadConversation,
    updateColorPalette,
    updateScreen,
  } = useChatGenerator();

  const { prompt: promptContext, type: typeContext, clearPrompt } = usePrompt();
  const hasSentInitialPrompt = useRef(false);

  useEffect(() => {
    if (designId && designId !== "new") {
      loadConversation(designId);
    }
  }, [designId, loadConversation]);

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

  return (
    <div className="fixed inset-0 z-30 flex overflow-hidden bg-background">
      <div className="absolute inset-0 opacity-40">
        <BackgroundGrid />
      </div>

      <div className="relative flex-1 min-w-0 h-full">
        <Editor
          artboards={conversation?.screens ?? []}
          designType={conversation?.designType ?? "mobile_app"}
          error={error ?? undefined}
          loading={isGenerating}
          colorPalette={conversation?.colorPalette}
          onDeleteArtboard={(artboardId: string, artboardTitle: string) => {
            sendMessage(
              `Delete the screen "${artboardTitle}" with ID ${artboardId}`,
              designId
            );
          }}
          onUpdateArtboard={(artboardId: string, prompt: string) => {
             updateScreen(designId, artboardId, prompt);
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
          loading={isGenerating}
          progress={progress}
          hasScreens={(conversation?.screens.length ?? 0) > 0}
          conversation={conversation}
          onColorChange={updateColorPalette}
        />
      </CustomResizableSidebar>
    </div>
  );
}
