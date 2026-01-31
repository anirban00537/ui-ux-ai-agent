"use client";

import React from "react";
import { motion } from "framer-motion";
import { IconSparkles, IconAlertCircle } from "@tabler/icons-react";

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
      className="relative flex flex-col p-6 rounded-2xl overflow-hidden group bg-card border border-border shadow-sm hover:shadow-depth-3 transition-all duration-300"
    >
      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary">
            <IconSparkles size={20} />
          </div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            Credits
          </h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-0.5">
            Available Now
          </p>
          <p className="text-3xl font-bold text-foreground tracking-tight">
            {balance.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-4 pt-0">
        <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/10 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 mb-1">
              Cycle Quota
            </p>
            <p className="text-base font-bold text-foreground/80">
              {quota.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 mb-1">
              Used This Cycle
            </p>
            <p className="text-base font-bold text-foreground/80">
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
