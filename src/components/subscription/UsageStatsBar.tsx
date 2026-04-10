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
      className="relative p-8 border border-white/10 bg-white/[0.03] transition-colors duration-500 hover:border-white/20"
    >
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="flex flex-col items-center lg:items-start">
          <p className="font-mono text-[10px] uppercase tracking-[1.4px] text-white/30 mb-2">Historical Impact</p>
          <div className="flex items-center gap-4">
            <span className="font-mono text-4xl text-white tracking-tight tabular-nums">{formatCredits(usedCredits)}</span>
            <div className="flex flex-col">
               <span className="font-mono text-[10px] uppercase tracking-[1.4px] text-white/50">Total Consumed</span>
               <span className="font-mono text-[10px] text-white/30 uppercase tracking-[0.05em]">Since inception</span>
            </div>
          </div>
        </div>

        <div className="hidden lg:block w-px h-16 bg-white/10" />

        <div className="flex-1 w-full max-w-xl">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-white/50" />
               <span className="font-mono text-[10px] uppercase tracking-[1.4px] text-white/50">Usage Velocity</span>
            </div>
            <span className="font-mono text-sm text-white tracking-widest">{usagePercentage}%</span>
          </div>
          <div className="h-4 w-full bg-white/10 border border-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, usagePercentage)}%` }}
              transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
              className="h-full bg-white/20"
            />
          </div>
          <div className="mt-3 flex justify-between px-1">
             <p className="font-mono text-[9px] text-white/20 uppercase tracking-widest">Efficiency Optimized</p>
             <p className="font-mono text-[9px] text-white/20 uppercase tracking-widest">Resource Monitoring</p>
          </div>
        </div>

        <div className="hidden lg:block w-px h-16 bg-white/10" />

        {lastResetAt && (
          <div className="flex flex-col items-center lg:items-end">
            <p className="font-mono text-[10px] uppercase tracking-[1.4px] text-white/30 mb-2">Cycle Reset</p>
            <div className="font-sans text-xl text-white tabular-nums tracking-tight">
              {new Date(lastResetAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </div>
            <p className="font-mono text-[9px] text-white/30 uppercase tracking-[0.1em] mt-1">Automatic sync</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
