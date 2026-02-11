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
      
      // Target height is 844px. Leave 200px for header/margins.
      const availableHeight = vh - 200;
      const heightScale = Math.min(availableHeight / 844, 0.9);
      
      // Also ensure it doesn't overflow horizontally. Increase margin for navigation arrows.
      const availableWidth = vw - 140; 
      const widthScale = Math.min(availableWidth / 390, 0.9);
      
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
      "fixed inset-0 z-50 flex flex-col transition-colors duration-500 bg-[#0a0a0a] font-sans"
    )}>
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-zinc-900/50 via-[#0a0a0a] to-[#0a0a0a] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] pointer-events-none mix-blend-overlay" />

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 px-6 py-5 flex items-center justify-between z-50 pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          {user?.id === design?.userId ? (
            <Link 
              href={`/designs/${designId}`}
              className="group flex items-center gap-2 pl-2 pr-4 py-2 rounded-full bg-black/40 hover:bg-black/60 text-zinc-300 hover:text-white transition-all border border-white/5 hover:border-white/10 backdrop-blur-xl shadow-sm"
            >
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all duration-300">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium tracking-wide">Back to Editor</span>
            </Link>
          ) : user ? (
            <Link 
              href="/home"
              className="group flex items-center gap-2 pl-2 pr-4 py-2 rounded-full bg-black/40 hover:bg-black/60 text-zinc-300 hover:text-white transition-all border border-white/5 hover:border-white/10 backdrop-blur-xl shadow-sm"
            >
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all duration-300">
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium tracking-wide">Dashboard</span>
            </Link>
          ) : (
             <Link 
              href="/"
              className="flex items-center gap-3 group"
            >
               <img src="/logo.svg" alt="Butterfast" className="w-28 h-8 opacity-90 group-hover:opacity-100 transition-opacity" />
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
           {/* Design Title (Optional, if we want to show it) */}
           {design?.title && (
             <div className="hidden sm:block px-4 py-1.5 rounded-full bg-black/20 border border-white/5 backdrop-blur-md">
                <span className="text-xs font-medium text-white/70">{design.title}</span>
             </div>
           )}

           <ShareControls 
             design={design} 
             isOwner={user?.id === design.userId} 
             onUpdate={(isPublic) => setDesign(prev => prev ? { ...prev, isPublic } : null)}
           />
        </div>
      </div>

      {/* Main Preview Container - Center content perfectly */}
      <div className="flex-1 relative flex items-center justify-center min-h-0 overflow-hidden p-0">
        
        {/* Navigation Arrows */}
        {design.artboards.length > 1 && (
          <>
            <button 
              onClick={prevScreen}
              className="fixed left-6 md:left-12 top-1/2 -translate-y-1/2 z-40 p-4 rounded-full bg-black/20 hover:bg-black/60 border border-white/5 hover:border-white/20 text-white/40 hover:text-white transition-all backdrop-blur-sm group active:scale-95 duration-300"
            >
              <ChevronLeft className="w-8 h-8 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button 
              onClick={nextScreen}
              className="fixed right-6 md:right-12 top-1/2 -translate-y-1/2 z-40 p-4 rounded-full bg-black/20 hover:bg-black/60 border border-white/5 hover:border-white/20 text-white/40 hover:text-white transition-all backdrop-blur-sm group active:scale-95 duration-300"
            >
              <ChevronRight className="w-8 h-8 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </>
        )}

        {/* Mobile Frame Container */}
        <div className="relative z-10 flex flex-col items-center justify-center">
           {/* Ambient Glow */}
           <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary/30 blur-[100px] opacity-0 animate-in fade-in duration-1000 delay-500 fill-mode-forwards"
              style={{
                 width: "60vw",
                 height: "60vh",
                 borderRadius: "100%"
              }}
           />

           {/* Mobile Frame with Reflection */}
           <div className="relative group perspective-1000 animate-in fade-in zoom-in duration-700 flex flex-col items-center justify-center">
               
               {/* Screen Title Label */}
               <div 
                 className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 bg-black/40 border border-white/10 rounded-full backdrop-blur-md opacity-0 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-700 fill-mode-forwards"
               >
                  <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
                    {currentArtboard?.title || `Screen ${currentIndex + 1}`}
                  </span>
               </div>

               <div 
                 className="relative transition-all duration-500 ease-out will-change-transform"
                style={{
                width: 390 * scale,
                minHeight: 844 * scale,
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
                      width={390}
                      height={844}
                      scale={scale}
                    />
                  )}
               </div>
           </div>
        </div>
      </div>
      
      {/* Footer Branding (Optional) */}
      {!user && (
        <div className="fixed bottom-6 right-6 z-40 opacity-50 hover:opacity-100 transition-opacity">
           <Link href="/" className="flex items-center gap-2 text-[10px] font-medium text-white/40 hover:text-white uppercase tracking-widest p-2 bg-black/20 rounded-lg backdrop-blur-sm border border-transparent hover:border-white/10 transition-all">
              Made with Butterfast.com
           </Link>
        </div>
      )}
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
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 p-1 rounded-full bg-black/40 border border-white/5 backdrop-blur-xl shadow-lg">
      {isOwner && (
        <button
          onClick={handleToggle}
          disabled={loading}
          className={cn(
             "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border outline-none active:scale-95",
             design.isPublic 
               ? "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20" 
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
          <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline-block">
            {design.isPublic ? "Public" : "Private"}
          </span>
        </button>
      )}

      {!isOwner && !design.isPublic && (
         <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-white/5 text-zinc-500 cursor-not-allowed">
            <Lock className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline-block">Private</span>
         </div>
      )}

      <button
        onClick={copyLink}
        className={cn(
            "flex items-center gap-2 px-4 py-1.5 rounded-full transition-all active:scale-95 group font-medium text-xs",
            copied 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                : "bg-white text-black hover:bg-zinc-200 border border-transparent shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
        )}
        title="Copy Page Link"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5" />
            <span className="hidden sm:inline-block">Copied</span>
          </>
        ) : (
          <>
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </>
        )}
      </button>
    </div>
  );
}
