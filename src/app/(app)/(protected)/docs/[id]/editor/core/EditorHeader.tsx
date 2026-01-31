"use client";

import React, { useState } from "react";
import {
  IconCloudCheck,
  IconDots,
  IconChevronLeft,
  IconShare,
  IconPlayerPlayFilled,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconMenu2,
  IconDownload,
  IconChevronDown,
  IconFileTypePdf,
  IconFileText,
  IconPhoto,
  IconLock,
  IconBroadcast,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/components/analytics/trackEvent";
import { useUndoRedo } from "@/app/(app)/(protected)/docs/[id]/hooks/useUndoRedo";
import { selectDoc, selectCards, selectTheme, DEFAULT_THEME } from "@/store/slices/cardsSlice";
import { selectIsSubscribed } from "@/store/slices/subscriptionSlice";
import { useAppSelector } from "@/store/hooks";
import { ShareModal } from "@/components/shared/ShareModal";
import { toast } from "sonner";
import { 
  exportDocToPptx, 
  exportDocToPdf,
  exportDocToPng 
} from "@/services/docs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface EditorHeaderProps {
  onPresentClick: () => void;
  onMenuClick?: () => void;
  isReadOnly?: boolean;
}

export const EditorHeader = ({
  onPresentClick,
  onMenuClick,
  isReadOnly = false,
}: EditorHeaderProps) => {
  const router = useRouter();
  const doc = useAppSelector(selectDoc);
  const cards = useAppSelector(selectCards);
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const isSubscribed = useAppSelector(selectIsSubscribed);
  const isDark = theme.themeType === "dark";
  const { undo, redo, canUndo, canRedo } = useUndoRedo();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Calculate current slide info
  const totalSlides = cards?.length || 0;

  const checkSubscription = () => {
    if (!isSubscribed) {
      toast.error("Upgrade to Pro to export presentations", {
        action: {
          label: "Upgrade",
          onClick: () => router.push("/pricing"),
        },
      });
      return false;
    }
    return true;
  };

  const handleExportPptx = async () => {
    if (!doc?.id || isExporting) return;
    if (!checkSubscription()) return;

    try {
      setIsExporting(true);
      trackEvent('doc_export_pptx', 'engagement', doc.id);
      const blob = await exportDocToPptx(doc.id);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.title || 'presentation'}.pptx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export to PPTX:', error);
      toast.error("Failed to export presentation");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    if (!doc?.id || isExporting) return;
    if (!checkSubscription()) return;

    try {
      setIsExporting(true);
      trackEvent('doc_export_pdf', 'engagement', doc.id);
      const blob = await exportDocToPdf(doc.id);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.title || 'presentation'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export to PDF:', error);
      toast.error("Failed to export presentation");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPng = async () => {
    if (!doc?.id || isExporting) return;
    if (!checkSubscription()) return;

    try {
      setIsExporting(true);
      trackEvent('doc_export_png', 'engagement', doc.id);
      const blob = await exportDocToPng(doc.id);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.title || 'presentation'}_slides.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export to PNG:', error);
      toast.error("Failed to export presentation");
    } finally {
      setIsExporting(false);
    }
  };

  const buttonClass = "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all";

  return (
    <div className="fixed top-0 left-0 z-[60] w-full">
      <div
        className={cn(
          "relative w-full px-4 md:px-6 h-14 flex items-center justify-between backdrop-blur-xl border-b",
          isDark 
            ? "bg-[#1a1a1f]/95 border-white/10" 
            : "bg-white/95 border-black/10"
        )}
      >
        {/* Left Section - Title & Navigation */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle */}
          <button
            onClick={onMenuClick}
            className={cn(
              "lg:hidden p-2 rounded-lg transition-all",
              isDark 
                ? "text-white/60 hover:text-white hover:bg-white/10" 
                : "text-black/60 hover:text-black hover:bg-black/5"
            )}
          >
            <IconMenu2 size={20} />
          </button>

          {/* Back Button */}
          {!isReadOnly && (
            <button
              onClick={() => {
                trackEvent('nav_home_click', 'engagement', 'editor_header');
                router.push("/home");
              }}
              className={cn(
                "hidden sm:flex p-2 rounded-lg transition-all",
                isDark 
                  ? "text-white/40 hover:text-white hover:bg-white/10" 
                  : "text-black/40 hover:text-black hover:bg-black/5"
              )}
            >
              <IconChevronLeft size={20} />
            </button>
          )}

          {/* Separator */}
          <div className={cn(
            "hidden sm:block h-5 w-px",
            isDark ? "bg-white/10" : "bg-black/10"
          )} />

          {/* Title & Status */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <h1 className={cn(
                "text-sm font-semibold line-clamp-1 max-w-[150px] md:max-w-[300px]",
                isDark ? "text-white/90" : "text-black/90"
              )}>
                {doc?.title || "Untitled"}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <IconCloudCheck size={10} className="text-emerald-500" />
                <span className={cn(
                  "text-[10px] font-medium hidden xs:inline",
                  isDark ? "text-white/40" : "text-black/40"
                )}>
                  Saved
                </span>
              </div>
            </div>

            {/* Slide Count Badge */}
            {totalSlides > 0 && (
              <div className={cn(
                "hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                isDark ? "bg-white/5 text-white/50" : "bg-black/5 text-black/50"
              )}>
                <span>{totalSlides} slides</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-1.5">
          {!isReadOnly && (
            <>
              {/* Undo/Redo */}
              <div className={cn(
                "hidden md:flex items-center gap-0.5 p-1 rounded-lg",
                isDark ? "bg-white/5" : "bg-black/5"
              )}>
                <button
                  onClick={() => {
                    trackEvent('doc_undo', 'engagement', doc?.id);
                    undo();
                  }}
                  disabled={!canUndo}
                  className={cn(
                    "p-1.5 rounded-lg disabled:opacity-20 disabled:cursor-not-allowed transition-all",
                    isDark 
                      ? "text-white/60 hover:text-white hover:bg-white/10" 
                      : "text-black/60 hover:text-black hover:bg-black/10"
                  )}
                  title="Undo (Ctrl+Z)"
                >
                  <IconArrowBackUp size={16} />
                </button>
                <button
                  onClick={() => {
                    trackEvent('doc_redo', 'engagement', doc?.id);
                    redo();
                  }}
                  disabled={!canRedo}
                  className={cn(
                    "p-1.5 rounded-lg disabled:opacity-20 disabled:cursor-not-allowed transition-all",
                    isDark 
                      ? "text-white/60 hover:text-white hover:bg-white/10" 
                      : "text-black/60 hover:text-black hover:bg-black/10"
                  )}
                  title="Redo (Ctrl+Shift+Z)"
                >
                  <IconArrowForwardUp size={16} />
                </button>
              </div>


              {/* Share */}
              <button
                onClick={() => {
                  trackEvent('doc_share_click', 'engagement', doc?.id);
                  setShareModalOpen(true);
                }}
                className={cn(
                  buttonClass,
                  isDark 
                    ? "text-white/60 hover:text-white hover:bg-white/10" 
                    : "text-black/60 hover:text-black hover:bg-black/5"
                )}
              >
                <IconShare size={16} />
                <span className="hidden md:inline">Share</span>
              </button>

              {/* Export */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    disabled={isExporting}
                    className={cn(
                      buttonClass,
                      "disabled:opacity-50",
                      isDark 
                        ? "text-white/60 hover:text-white hover:bg-white/10" 
                        : "text-black/60 hover:text-black hover:bg-black/5"
                    )}
                    title="Export presentation"
                  >
                    <IconDownload size={16} />
                    <span className="hidden md:inline">
                      {isExporting ? 'Exporting...' : 'Export'}
                    </span>
                    <IconChevronDown size={14} className="hidden md:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className={cn(
                    "w-48",
                    isDark ? "bg-[#1a1a1f] border-white/10" : "bg-white border-black/10"
                  )}
                >
                  <DropdownMenuItem 
                    onClick={handleExportPptx} 
                    disabled={isExporting}
                    className={isDark ? "text-white/80 hover:text-white focus:bg-white/10" : ""}
                  >
                    <IconFileText size={16} className="mr-2" />
                    <span>Export as PPTX</span>
                    {!isSubscribed && (
                      <IconLock size={14} className="ml-auto opacity-50" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleExportPdf} 
                    disabled={isExporting}
                    className={isDark ? "text-white/80 hover:text-white focus:bg-white/10" : ""}
                  >
                    <IconFileTypePdf size={16} className="mr-2" />
                    <span>Export as PDF</span>
                    {!isSubscribed && (
                      <IconLock size={14} className="ml-auto opacity-50" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleExportPng} 
                    disabled={isExporting}
                    className={isDark ? "text-white/80 hover:text-white focus:bg-white/10" : ""}
                  >
                    <IconPhoto size={16} className="mr-2" />
                    <span>Export as PNG</span>
                    {!isSubscribed && (
                      <IconLock size={14} className="ml-auto opacity-50" />
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {/* Present Button - Primary Action */}
          <button
            onClick={() => {
              trackEvent('doc_present_click', 'engagement', doc?.id);
              onPresentClick();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/25"
          >
            <IconPlayerPlayFilled size={14} />
            <span className="hidden sm:inline">Present</span>
          </button>

          {/* More Options */}
          {!isReadOnly && (
            <>
              <div className={cn(
                "hidden sm:block h-5 w-px mx-1",
                isDark ? "bg-white/10" : "bg-black/10"
              )} />
              <button className={cn(
                "p-2 rounded-lg transition-all",
                isDark 
                  ? "text-white/40 hover:text-white hover:bg-white/10" 
                  : "text-black/40 hover:text-black hover:bg-black/5"
              )}>
                <IconDots size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      {doc?.id && (
        <ShareModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          docId={doc.id}
        />
      )}
    </div>
  );
};
