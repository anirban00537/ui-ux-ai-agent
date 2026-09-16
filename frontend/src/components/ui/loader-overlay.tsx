"use client";

import React from "react";
import { IconLoader2 } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface LoaderOverlayProps {
  isLoading: boolean;
  message?: string;
  className?: string;
  progress?: { 
    current: number; 
    total: number;
    stage?: string;
    message?: string;
    estimatedSeconds?: number;
  } | null;
  theme?: any; 
  mode?: "light" | "dark";
}

// Helper function to get human-readable stage names
const getStageDisplay = (stage?: string): string => {
  const stageMap: Record<string, string> = {
    'initializing': 'Initializing',
    'analyzing-layout': 'Analyzing layout',
    'generating-content': 'AI creating content',
    'saving-card': 'Finalizing design',
  };
  return stage ? stageMap[stage] || stage : '';
};

// Thinking animation - pulsing dots
const ThinkingAnimation = ({ color }: { color: string }) => {
  return (
    <div className="flex items-center gap-1.5 h-5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: color }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
};

// Advanced reactive loader component
const ReactiveWaveform = ({ speed = 0, color }: { speed?: number; color: string }) => {
  // Threshold: only animate if speed is significant (> 1 char/sec)
  const isActive = speed > 1;
  
  return (
    <div className="flex items-center gap-[3px] h-5">
      {[0, 1, 2, 3].map((i) => {
         // Calculate duration based on speed. Higher speed = lower duration (faster).
         const duration = Math.max(0.15, 25 / Math.max(speed, 1));
         const maxHeights = [14, 20, 14, 18];
         
         return (
           <motion.div
             key={i}
             className="w-[3px] rounded-full"
             style={{ backgroundColor: color }}
             animate={{ 
               height: isActive ? [4, maxHeights[i], 4] : 4,
               opacity: isActive ? 1 : 0.5
             }}
             transition={{
               duration: duration,
               repeat: Infinity,
               repeatType: "reverse",
               delay: i * (duration / 3),
               ease: "easeInOut"
             }}
           />
         );
      })}
    </div>
  );
};

interface LoaderOverlayProps {
  isLoading: boolean;
  message?: string;
  className?: string;
  progress?: { 
    current: number; 
    total: number;
    stage?: string;
    message?: string;
    estimatedSeconds?: number;
  } | null;
  theme?: any; 
  mode?: "light" | "dark";
  streamSpeed?: number;
}

export const LoaderOverlay: React.FC<LoaderOverlayProps> = ({ 
  isLoading, 
  message = "Generating...", 
  className,
  progress,
  theme,
  mode = "light",
  streamSpeed
}) => {
  if (!isLoading) return null;

  const isDark = mode === "dark";
  // Fallback to black causing high contrast if no theme is provided (e.g. outline generation)
  const primaryColor = theme?.primary || (isDark ? "#ffffff" : "#000000");

  // Determine effective speed
  // Default to 0 if not provided and no progress (don't fake activity)
  const effectiveSpeed = streamSpeed !== undefined ? streamSpeed : (progress ? 40 : 0);
  const hasStream = effectiveSpeed > 1;
  
  const displayMessage = hasStream 
    ? (progress 
        ? (getStageDisplay(progress.stage) || progress.message || "Generating...") 
        : message)
    : "AI is thinking";

  return (
    <div className={cn("fixed inset-0 z-50 cursor-wait flex items-end justify-center pb-12 pointer-events-auto", className)}>
        <motion.div
           initial={{ opacity: 0, scale: 0.9, y: 20 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.9, y: 20 }}
           className="relative flex items-center gap-4 px-8 py-4 rounded-full overflow-hidden min-w-[200px]"
           style={{
             backgroundColor: isDark ? "rgba(20, 20, 25, 0.85)" : "rgba(255, 255, 255, 0.85)",
             backdropFilter: "blur(20px)",
             WebkitBackdropFilter: "blur(20px)",
             border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.6)"}`,
             boxShadow: isDark
               ? "0 20px 50px rgba(0,0,0,0.5), 0 5px 15px rgba(0,0,0,0.2)"
               : "0 20px 50px rgba(0,0,0,0.1), 0 5px 15px rgba(0,0,0,0.05)",
           }}
        >
            {hasStream ? (
              <ReactiveWaveform speed={effectiveSpeed} color={primaryColor} />
            ) : (
              <ThinkingAnimation color={primaryColor} />
            )}
            
            <span className={cn("font-medium text-base tracking-wide", isDark ? "text-white/90" : "text-black/90")}>
               {displayMessage}
            </span>

            {progress && progress.total > 0 && (
                <div className={cn("flex items-center gap-2 pl-4 ml-2 border-l h-5", isDark ? "border-white/10" : "border-black/10")}>
                     <span className={cn("text-sm font-semibold tabular-nums", isDark ? "text-white/90" : "text-black/90")}>
                        <>{progress.current} <span className="opacity-40">/</span> {progress.total}</>
                     </span>
                </div>
            )}
        </motion.div>
    </div>
  );
};
