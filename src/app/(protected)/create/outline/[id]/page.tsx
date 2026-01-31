"use client";

import React, { useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useOutlineEditor } from "@/app/(protected)/docs/[id]/hooks/use-outline";
import { OutlineViewer } from "@/components/outline-viewer";
import { Button } from "@/components/ui/button";
import { IconSparkles, IconLoader2 } from "@tabler/icons-react";
import { LoaderOverlay } from "@/components/ui/loader-overlay";
import { trackEvent } from "@/components/analytics/trackEvent";

// Shared components
import { EmptyState } from "@/components/shared/EmptyState";
import { PageSkeleton } from "@/components/shared/DashboardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { IconWriting } from "@tabler/icons-react";

// Sub-components
import { OutlineHeader } from "@/components/outline/OutlineHeader";
import { ThemeSelector } from "@/components/outline/ThemeSelector";

export default function OutlinePage() {
  const params = useParams();
  const outlineId = params.id as string;

  const {
    outline,
    outlineData,
    themes,
    selectedTheme,
    docUrl,
    
    // Status
    isLoading,
    isStreaming,
    generationSpeed,
    streamingContent,
    saveStatus,
    
    // Actions
    handleRegenerate,
    debouncedSave,
    setSelectedTheme,
    saveThemeToDoc,
  } = useOutlineEditor(outlineId);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll effect
  useEffect(() => {
    if (isStreaming && bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [isStreaming, outlineData?.outlines?.length]);

  if (isLoading && !isStreaming && !outlineData) {
    return (
      <div className="flex-1 w-full p-8 max-w-5xl mx-auto">
         <PageSkeleton>
            <Skeleton className="h-16 w-full rounded-3xl" />
            <Skeleton className="h-[400px] w-full rounded-[32px]" />
            <Skeleton className="h-32 w-full rounded-2xl" />
         </PageSkeleton>
      </div>
    );
  }

  return (
    <div className="relative flex-1 min-h-screen overflow-auto bg-background">
      {/* Scrollable Content */}
      <div className="flex flex-col items-center py-8 min-h-full">
        <div className="w-full max-w-5xl px-6 py-8 bg-card backdrop-blur-xl border border-border shadow-2xl rounded-[32px] flex flex-col gap-8">
        
        <OutlineHeader prompt={outline?.prompt || ""} onRegenerate={handleRegenerate} />

        {/* Outline Content */}
        {!outlineData && !isStreaming ? (
            <EmptyState 
              icon={IconWriting}
              title="Ready to generate"
              description="Enter a prompt in the box above to generate your presentation outline. Our AI will help you structure your thoughts."
              className="py-12 border-2 border-dashed border-secondary/20 rounded-[32px]"
            />
        ) : (
            <div className="space-y-4">
                 <div className="flex items-center justify-between px-2">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Outline</h2>
                    {saveStatus === 'saving' && <span className="text-xs text-muted-foreground flex gap-1 items-center"><IconLoader2 size={10} className="animate-spin"/> Saving...</span>}
                 </div>
                 
                 <div className="border border-secondary/10 rounded-[24px] overflow-hidden shadow-sm">
                    <OutlineViewer
                        outline={outlineData || { title: "Generating...", outlines: [] }}
                        isLoading={false}
                        editable={!isStreaming}
                        onUpdate={debouncedSave}
                    />
                 </div>
                 <div ref={bottomRef} className="h-4 w-full" />
            </div>
        )}

        <ThemeSelector 
          themes={themes} 
          selectedTheme={selectedTheme} 
          onSelectTheme={(theme) => {
            trackEvent('theme_change', 'engagement', theme.name);
            setSelectedTheme(theme);
            saveThemeToDoc(theme);
          }} 
        />

        {/* Bottom Actions */}
        <div className="flex justify-end pt-4">
            <Link href={docUrl || "#"}>
                <Button 
                    disabled={!docUrl || isStreaming}
                    onClick={() => trackEvent('presentation_create_click', 'engagement', outlineId)}
                    className="rounded-full h-12 px-8 shadow-coral-glow hover:scale-105 transition-transform font-bold text-base bg-primary text-primary-foreground"
                >
                    {isStreaming ? (
                        <>
                           <IconLoader2 size={18} className="mr-2 animate-spin" /> Generating...
                        </>
                    ) : (
                        <>
                           <IconSparkles size={18} className="mr-2" /> Create Presentation
                        </>
                    )}
                </Button>
            </Link>
        </div>

      </div>
      
      <LoaderOverlay 
        isLoading={isStreaming} 
        message="Generating Outline..." 
        streamSpeed={generationSpeed}
        theme={selectedTheme}
        progress={{
          current: streamingContent ? streamingContent.length : 0,
          total: 0,
          message: "Generating Outline..."
        }}
      />
      </div>
    </div>
  );
}
