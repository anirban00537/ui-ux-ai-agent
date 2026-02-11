"use client";

import React from "react";
import { motion } from "framer-motion";

import { formatCredits } from "@/lib/credit-utils";

interface UsageStatsBarProps {
  usedCredits: number;
  balance: number;
  quota: number;
  lastResetAt?: string;
}

export const UsageStatsBar: React.FC<UsageStatsBarProps> = ({
  usedCredits,
  balance,
  quota,
  lastResetAt,
}) => {
  const usagePercentage = Math.round((Math.max(0, quota - balance) / (quota || 1)) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative p-8 rounded-[40px] overflow-hidden bg-white/[0.02] backdrop-blur-xl border-3d shadow-2xl transition-all duration-500 hover:bg-white/[0.04]"
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-32 bg-primary/5 blur-[120px] rounded-full opacity-50" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="flex flex-col items-center lg:items-start">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-2">Historical Impact</p>
          <div className="flex items-center gap-4">
            <span className="text-4xl font-black text-foreground tracking-tighter tabular-nums drop-shadow-sm">{formatCredits(usedCredits)}</span>
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-primary uppercase tracking-[0.1em] italic">Total Consumed</span>
               <span className="text-[10px] font-medium text-muted-foreground/30 uppercase tracking-[0.05em]">Since inception</span>
            </div>
          </div>
        </div>

        <div className="hidden lg:block w-px h-16 bg-white/5" />

        <div className="flex-1 w-full max-w-xl">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
               <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">Usage Velocity</span>
            </div>
            <span className="text-sm font-black text-primary italic tracking-widest">{usagePercentage}%</span>
          </div>
          <div className="h-4 w-full bg-black/40 rounded-full overflow-hidden p-[4px] border-3d shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, usagePercentage)}%` }}
              transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
              className="h-full bg-gradient-to-r from-primary/60 via-primary to-blue-400 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.4)] relative overflow-hidden"
            >
               {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] animate-[shimmer_3s_infinite]" style={{ backgroundSize: '200% 100%' }} />
              {/* Internal Glow */}
              <div className="absolute inset-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]" />
            </motion.div>
          </div>
          <div className="mt-3 flex justify-between px-1">
             <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest">Efficiency Optimized</p>
             <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest">Resource Monitoring</p>
          </div>
        </div>

        <div className="hidden lg:block w-px h-16 bg-white/5" />

        {lastResetAt && (
          <div className="flex flex-col items-center lg:items-end">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-2">Cycle Reset</p>
            <div className="text-xl font-bold text-foreground tracking-tight tabular-nums">
              {new Date(lastResetAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </div>
            <p className="text-[9px] font-medium text-primary/40 uppercase tracking-[0.1em] mt-1">Automatic sync</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
