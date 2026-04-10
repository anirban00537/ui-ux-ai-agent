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
      className="relative flex flex-col p-8 border border-white/10 bg-white/[0.03] transition-colors duration-500 hover:border-white/20"
    >
      <div className="relative z-10 flex items-center justify-between mb-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 border border-white/20 flex items-center justify-center text-white">
            <IconSparkles size={28} />
          </div>
          <div>
            <h2 className="font-mono text-3xl text-white tracking-tight">
              Credits
            </h2>
            <p className="font-mono text-[10px] uppercase tracking-[1.4px] text-white/50 mt-0.5">
              Power your vision
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] uppercase tracking-[1.4px] text-white/30 mb-1">
            Available Now
          </p>
          <p className={`font-mono text-5xl tracking-tight ${getCreditColor(balance)}`}>
            {formatCredits(balance)}
          </p>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-4 pt-0">
        <div className="p-6 border border-white/10 flex items-center justify-between">
          <div className="flex-1">
            <p className="font-mono text-[10px] uppercase tracking-[1.4px] text-white/30 mb-2">
              Cycle Quota
            </p>
            <p className="font-sans text-xl text-white tabular-nums">
              {quota.toLocaleString()}
            </p>
          </div>
          <div className="w-px h-10 bg-white/10 mx-6" />
          <div className="flex-1 text-right">
            <p className="font-mono text-[10px] uppercase tracking-[1.4px] text-white/30 mb-2">
              Used This Cycle
            </p>
            <p className="font-sans text-xl text-white tabular-nums">
              {Math.max(0, quota - balance).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {!hasCredits && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 mt-6 p-5 border border-red-500/20 bg-red-500/10 flex items-start gap-4"
        >
          <div className="w-10 h-10 border border-red-500/20 flex items-center justify-center shrink-0">
             <IconAlertCircle className="h-6 w-6 text-red-400" />
          </div>
          <div>
            <p className="font-sans text-sm text-red-400">
              Low Credit Balance
            </p>
            <p className="font-sans text-xs text-red-400/60 mt-1 leading-relaxed">
              You&apos;ve run out of fuel. Level up your plan to keep
              building amazing mobile experiences.
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
