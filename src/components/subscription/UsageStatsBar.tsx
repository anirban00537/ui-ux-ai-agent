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
      className="relative p-6 rounded-2xl overflow-hidden bg-white/40 border border-secondary/20 shadow-sm"
    >
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-1">Historical Impact</p>
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <span className="text-2xl font-bold text-foreground tracking-tight">{formatCredits(usedCredits)}</span>
            <span className="text-[10px] font-bold text-muted-foreground/60 mt-1 uppercase tracking-wider">Credits Consumed</span>
          </div>
        </div>

        <div className="hidden md:block w-px h-10 bg-secondary/20" />

        <div className="flex-1 max-w-sm w-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Usage Velocity</span>
            <span className="text-[12px] font-bold text-primary italic">{usagePercentage}%</span>
          </div>
          <div className="h-2 w-full bg-secondary/10 rounded-full overflow-hidden p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, usagePercentage)}%` }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="h-full bg-primary rounded-full shadow-sm"
            />
          </div>
        </div>

        <div className="hidden md:block w-px h-10 bg-secondary/20" />

        {lastResetAt && (
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-1">Last Reset Cycle</p>
            <p className="text-base font-bold text-foreground">
              {new Date(lastResetAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
