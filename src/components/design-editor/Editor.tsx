"use client";

import React, { useCallback, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { MobileFrame } from "@/components/design-editor/MobileFrame";
import { PresentationFrame } from "@/components/design-editor/PresentationFrame";
import { Trash2, Copy, Check } from "lucide-react";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";
import { DesignType } from "@/services/designs";

interface Artboard {
  id: string;
  title: string;
  description?: string;
  html: string;
  createdAt: string;
  status?: 'generating' | 'complete';
}

interface ColorPalette {
  primary: string;
  backgroundLight: string;
  backgroundDark: string;
}

interface EditorProps {
  artboards: Artboard[];
  designType?: DesignType;
  loading?: boolean;
  error?: string;
  colorPalette?: ColorPalette;
  onDeleteArtboard?: (artboardId: string, artboardTitle: string) => void;
}

export function Editor({
  artboards,
  designType = "mobile_app",
  loading,
  error,
  colorPalette,
  onDeleteArtboard,
}: EditorProps) {
  const isPresentationMode = designType === "presentation";
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = useCallback(async (html: string, id: string) => {
    try {
      await navigator.clipboard.writeText(html);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = html;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }, []);

  return (
    <div className="w-full h-full bg-background relative overflow-hidden">
      <DotPattern
        className={cn(
          "[mask-image:linear-gradient(to_bottom,white_0%,white_100%)] opacity-40"
        )}
      />
      <TransformWrapper
        initialScale={isPresentationMode ? 0.5 : 0.6}
        minScale={0.1}
        maxScale={3}
        centerOnInit={true}
        limitToBounds={false}
        panning={{ excluded: ["input", "textarea", "button", "select"] }}
        wheel={{ step: 0.1 }}
        doubleClick={{ disabled: true }}
        pinch={{ step: 5 }}
      >
        {({ zoomIn, zoomOut, resetTransform, instance }) => (
          <>
            <div className="absolute top-6 right-6 z-20">
              <div className="flex items-center gap-2 bg-zinc-950/80 backdrop-blur-md border border-zinc-800/50 rounded-xl px-4 py-3 shadow-xl ring-1 ring-white/5">
                <button
                  onClick={() => zoomOut()}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300 text-white/80 hover:text-white hover:scale-105"
                  title="Zoom Out"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="text-sm font-medium min-w-[3rem] text-center text-white/90 px-2">
                  {Math.round((instance?.transformState?.scale ?? 1) * 100)}%
                </span>
                <button
                  onClick={() => zoomIn()}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300 text-white/80 hover:text-white hover:scale-105"
                  title="Zoom In"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <div className="w-px h-4 bg-white/20 mx-2" />
                <button
                  onClick={() => resetTransform()}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300 text-white/80 hover:text-white hover:scale-105"
                  title="Reset View"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
            <TransformComponent
              wrapperStyle={{ width: "100%", height: "100%" }}
              contentStyle={{ width: "max-content", height: "max-content" }}
            >
              <div
                className={cn(
                  "flex items-center justify-center p-20",
                  isPresentationMode ? "flex-col gap-8" : "gap-12"
                )}
                style={{ minWidth: "800px", minHeight: "800px" }}
              >
                {artboards.map((artboard) => (
                  <div key={artboard.id} className="relative group">
                    <div className="absolute -top-2 -right-2 z-30 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={() => handleCopy(artboard.html, artboard.id)}
                        className="rounded-full p-2.5 bg-zinc-800/90 hover:bg-zinc-700 backdrop-blur-sm text-white shadow-xl ring-1 ring-white/10 hover:scale-110 transition-all"
                        title={`Copy HTML`}
                      >
                        {copiedId === artboard.id ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      {onDeleteArtboard && (
                        <button
                          onClick={() => onDeleteArtboard(artboard.id, artboard.title)}
                          className="rounded-full p-2.5 bg-red-500/90 hover:bg-red-500 backdrop-blur-sm text-white shadow-xl ring-1 ring-red-400/20 hover:scale-110 transition-all"
                          title={`Delete ${artboard.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {isPresentationMode ? (
                      <PresentationFrame
                        title={artboard.title}
                        subtitle={loading ? "Generating..." : artboard.description}
                        htmlContent={artboard.html}
                        width={1640}
                      />
                    ) : (
                      <MobileFrame
                        title={artboard.title}
                        subtitle={loading ? "Generating..." : artboard.description}
                        htmlContent={artboard.html}
                        width={400}
                        colorPalette={colorPalette}
                        isGenerating={artboard.status === 'generating'}
                      />
                    )}
                  </div>
                ))}
              </div>
            </TransformComponent>
            <div className="absolute bottom-6 left-6 z-20">
              <div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800/50 rounded-xl px-4 py-3 shadow-xl ring-1 ring-white/5">
                <p className="text-sm text-white/80 font-medium">
                  {artboards.length} {isPresentationMode ? "slide" : "screen"}{artboards.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            {error && (
              <div className="absolute top-4 left-4 right-4 bg-red-50 border border-red-200 text-red-700 rounded-md px-3 py-2 text-sm z-20">
                <div className="flex items-start gap-2">
                  <div className="flex-1">{error}</div>
                  {error.includes("Insufficient credits") && (
                    <a
                      href="/subscription"
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors whitespace-nowrap"
                    >
                      Upgrade
                    </a>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
