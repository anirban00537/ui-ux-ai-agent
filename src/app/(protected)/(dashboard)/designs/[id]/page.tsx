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
    clearConversation,
    loadConversation,
  } = useChatGenerator();

  const hasSentInitialPrompt = useRef(false);

  useEffect(() => {
    if (designId && designId !== "new") {
      loadConversation(designId);
    }
  }, [designId, loadConversation]);

  useEffect(() => {
    if (
      promptFromUrl &&
      designId &&
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
          screens={conversation?.screens ?? []}
          error={error ?? undefined}
          loading={isGenerating}
          onDeleteScreen={(screenId, screenTitle) => {
            sendMessage(
              `Delete the screen "${screenTitle}" with ID ${screenId}`,
              designId
            );
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
          loading={isGenerating}
          progress={progress}
          hasScreens={(conversation?.screens.length ?? 0) > 0}
          conversation={conversation}
        />
      </CustomResizableSidebar>
    </div>
  );
}
