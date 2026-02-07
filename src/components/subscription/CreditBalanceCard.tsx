"use client";

import React from "react";
import { motion } from "framer-motion";
import { IconSparkles, IconAlertCircle } from "@tabler/icons-react";
import { formatCredits, getCreditColor } from "@/lib/credit-utils";

interface CreditBalanceCardProps {
  balance: number;
  quota: number;
}

export const CreditBalanceCard: React.FC<CreditBalanceCardProps> = ({
  balance,
  quota
}) => {
  const hasCredits = balance > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className="relative flex flex-col p-8 rounded-[32px] overflow-hidden group bg-card border border-border/50 shadow-2xl ring-1 ring-white/5 transition-all duration-300"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors duration-500" />
      
      <div className="relative z-10 flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary/10 text-primary ring-1 ring-primary/20">
            <IconSparkles size={24} />
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tighter uppercase italic">
            Credits
          </h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
            Available Now
          </p>
          <p className={`text-4xl font-black tracking-tighter ${getCreditColor(balance)}`}>
            {formatCredits(balance)}
          </p>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-4 pt-0 text-white">
        <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between backdrop-blur-sm">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-1.5">
              Cycle Quota
            </p>
            <p className="text-lg font-black text-foreground/90 tabular-nums">
              {quota.toLocaleString()}
            </p>
          </div>
          <div className="w-px h-8 bg-white/5" />
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-1.5">
              Used This Cycle
            </p>
            <p className="text-lg font-black text-foreground/90 tabular-nums">
              {Math.max(0, quota - balance).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {!hasCredits && (
        <div className="relative z-10 mt-6 p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10 flex items-start gap-3">
          <IconAlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-yellow-700">
              Low Credit Balance
            </p>
            <p className="text-xs text-yellow-700/70 mt-0.5 font-medium leading-relaxed">
              You&apos;ve run out of fuel. Level up your plan to keep
              building.
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};
