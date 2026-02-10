"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPublicDesignById, getDesignById, updateDesign } from "@/services/designs";
import { Loader2, ChevronLeft, ChevronRight, Share2, ArrowLeft, Globe, Lock, Copy, Check, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PreviewMobileFrame } from "@/components/design-editor/PreviewMobileFrame";
import { useProfile } from "@/hooks/use-auth";

interface Artboard {
  id: string;
  title: string;
  description?: string | null;
  html: string;
  width?: number;
  height?: number;
}

interface Design {
  id: string;
  userId: string;
  title: string | null;
  artboards: Artboard[];
  colorPalette?: any;
  isPublic: boolean;
}

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const designId = params.id as string;
  const { data: user } = useProfile();
  const [design, setDesign] = useState<Design | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchDesign() {
      try {
        // Try public first
        let resp = await getPublicDesignById(designId);
        
        // If public fails, try private if logged in
        if (!resp.success && user) {
          resp = await getDesignById(designId);
        }

        if (resp.success) {
          setDesign(resp.data);
        } else {
          toast.error(resp.message || "Failed to load design");
        }
      } catch (error) {
        toast.error("An error occurred while fetching the design");
      } finally {
        setLoading(false);
      }
    }

    if (designId) {
      fetchDesign();
    }
  }, [designId, user]);

  const nextScreen = useCallback(() => {
    if (!design) return;
    setCurrentIndex((prev) => (prev + 1) % design.artboards.length);
  }, [design]);

  const prevScreen = useCallback(() => {
    if (!design) return;
    setCurrentIndex((prev) => (prev - 1 + design.artboards.length) % design.artboards.length);
  }, [design]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextScreen();
      if (e.key === "ArrowLeft") prevScreen();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextScreen, prevScreen]);

  const currentArtboard = design?.artboards[currentIndex];

  const [scale, setScale] = useState(0.85);

  // Dynamic scaling based on viewport height
  useEffect(() => {
    const calculateScale = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      
      // Target height is 840px. Leave 180px for header/margins.
      const availableHeight = vh - 180;
      const heightScale = Math.min(availableHeight / 840, 0.9);
      
      // Also ensure it doesn't overflow horizontally
      const availableWidth = vw - 80; // Margin
      const widthScale = Math.min(availableWidth / 480, 0.9);
      
      setScale(Math.min(heightScale, widthScale));
    };

    calculateScale();
    window.addEventListener("resize", calculateScale);
    return () => window.removeEventListener("resize", calculateScale);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-white/50">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (!design) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <h1 className="text-xl font-bold text-white mb-2">Design Not Found</h1>
          <p className="text-sm text-white/50">This design may be private or does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex flex-col transition-colors duration-500 bg-[#0a0a0a]"
    )}>
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 px-6 py-4 flex items-center justify-between z-50 bg-transparent">
        <div className="flex items-center gap-4">
          {user?.id === design?.userId ? (
            <Link 
              href={`/designs/${designId}`}
              className="group flex items-center gap-2 pl-2 pr-4 py-2 rounded-xl bg-zinc-900/50 hover:bg-zinc-800/80 text-white transition-all border border-white/5 backdrop-blur-md"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold tracking-tight">Back to Design</span>
            </Link>
          ) : (
            <Link 
              href="/home"
              className="group flex items-center gap-2 pl-2 pr-4 py-2 rounded-xl bg-zinc-900/50 hover:bg-zinc-800/80 text-white transition-all border border-white/5 backdrop-blur-md"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold tracking-tight">Back to Projects</span>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 bg-zinc-900/50 backdrop-blur-md p-1 rounded-xl border border-white/5 scale-90 sm:scale-100">
          
          <div className="w-px h-4 bg-white/10 mx-1" />
          
          <ShareControls 
            design={design} 
            isOwner={user?.id === design.userId} 
            onUpdate={(isPublic) => setDesign(prev => prev ? { ...prev, isPublic } : null)}
          />
        </div>
      </div>

      {/* Main Preview Container - Center content perfectly */}
      <div className="flex-1 relative flex items-center justify-center min-h-0 overflow-y-auto overflow-x-hidden p-0 py-20">
        {/* Navigation Arrows */}
        {design.artboards.length > 1 && (
          <>
            <button 
              onClick={prevScreen}
              className="fixed left-4 sm:left-12 lg:left-24 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-zinc-900/80 border border-white/5 text-white/50 hover:text-white hover:scale-110 transition-all backdrop-blur-xl shadow-2xl"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={nextScreen}
              className="fixed right-4 sm:right-12 lg:right-24 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-zinc-900/80 border border-white/5 text-white/50 hover:text-white hover:scale-110 transition-all backdrop-blur-xl shadow-2xl"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Mobile Frame Container */}
        <div className="relative group perspective-1000 animate-in fade-in zoom-in duration-700 flex flex-col items-center justify-center shrink-0 my-auto">
           {/* Glow Effect */}
           <div 
              className="absolute bg-primary/20 blur-[120px] opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity"
              style={{
                 width: 480 * scale,
                 minHeight: 840 * scale,
                 height: "auto",
              }}
           />
           
           {/* Screen Title Label - Proportional Gap */}
           <div 
             className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-mono tracking-[0.2em] text-zinc-500/80 uppercase transition-all duration-300 pointer-events-none"
             style={{ top: `-${25 * scale}px` }}
           >
              {currentArtboard?.title || `Screen ${currentIndex + 1}`}
           </div>

           <div 
             className="flex items-center justify-center transition-all duration-300"
             style={{
                width: 480 * scale,
                minHeight: 840 * scale,
                height: "auto",
             }}
           >
              {currentArtboard && (
                <PreviewMobileFrame
                  id={currentArtboard.id}
                  htmlContent={currentArtboard.html}
                  title={currentArtboard.title}
                  colorPalette={design.colorPalette}
                  isStatic={true}
                  disableDrag={true}
                  disableResize={true}
                  width={480}
                  height={840}
                  scale={scale}
                />
              )}
           </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes gradient-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-flow {
          animation: gradient-flow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}

function ShareControls({ 
  design, 
  isOwner,
  onUpdate 
}: { 
  design: Design; 
  isOwner: boolean;
  onUpdate: (isPublic: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleToggle = async () => {
    if (!isOwner) return;
    setLoading(true);
    try {
      const resp = await updateDesign(design.id, { isPublic: !design.isPublic });
      if (resp.success) {
        onUpdate(!design.isPublic);
        toast.success(!design.isPublic ? "Design is now public" : "Design is now private");
      }
    } catch (error) {
      toast.error("Failed to update share settings");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Share link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 px-1">
      {isOwner && (
        <button
          onClick={handleToggle}
          disabled={loading}
          className={cn(
             "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all border outline-none active:scale-95",
             design.isPublic 
               ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20" 
               : "bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
           )}
           title={design.isPublic ? "Public - Anyone with link can view" : "Private - Only you can view"}
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : design.isPublic ? (
            <Globe className="w-3.5 h-3.5" />
          ) : (
            <Lock className="w-3.5 h-3.5" />
          )}
          <span className="text-[11px] font-bold uppercase tracking-wider">
            {design.isPublic ? "Public" : "Private"}
          </span>
        </button>
      )}

      {!isOwner && !design.isPublic && (
         <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 text-zinc-500 cursor-not-allowed">
            <Lock className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Private</span>
         </div>
      )}

      <button
        onClick={copyLink}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-300 hover:text-white transition-all active:scale-95 group"
        title="Copy Page Link"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <Share2 className="w-3.5 h-3.5 group-hover:text-blue-400 transition-colors" />
        )}
        <span className="text-[11px] font-medium tracking-wide">Share</span>
      </button>
    </div>
  );
}
