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
      className="relative p-8 rounded-[32px] overflow-hidden bg-card border border-border/50 shadow-2xl ring-1 ring-white/5"
    >
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-1.5">Historical Impact</p>
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <span className="text-3xl font-black text-foreground tracking-tighter">{formatCredits(usedCredits)}</span>
            <span className="text-[11px] font-black text-muted-foreground/50 mt-1 uppercase tracking-[0.1em]">Credits Consumed</span>
          </div>
        </div>

        <div className="hidden md:block w-px h-12 bg-white/5" />

        <div className="flex-1 max-w-md w-full">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">Usage Velocity</span>
            <span className="text-sm font-black text-primary italic tracking-widest">{usagePercentage}%</span>
          </div>
          <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-[3px] ring-1 ring-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, usagePercentage)}%` }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] animate-[shimmer_2s_infinite]" />
            </motion.div>
          </div>
        </div>

        <div className="hidden md:block w-px h-12 bg-white/5" />

        {lastResetAt && (
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-1.5">Last Reset Cycle</p>
            <p className="text-lg font-black text-foreground tracking-tight">
              {new Date(lastResetAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
