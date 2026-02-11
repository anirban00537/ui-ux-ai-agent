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
      className="relative flex flex-col p-8 rounded-[40px] overflow-hidden group bg-white/[0.02] backdrop-blur-xl border-3d shadow-2xl transition-all duration-500 hover:bg-white/[0.04]"
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32 group-hover:bg-primary/20 transition-all duration-700" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 blur-[80px] rounded-full -ml-24 -mb-24 group-hover:bg-blue-500/10 transition-all duration-700" />
      
      <div className="relative z-10 flex items-center justify-between mb-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(30,157,241,0.2)] group-hover:scale-110 transition-transform duration-500">
            <IconSparkles size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-serif font-medium text-foreground tracking-tight italic">
              Credits
            </h2>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mt-0.5">
              Power your vision
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-1">
            Available Now
          </p>
          <p className={`text-5xl font-black tracking-tighter ${getCreditColor(balance)} tabular-nums drop-shadow-sm`}>
            {formatCredits(balance)}
          </p>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-4 pt-0">
        <div className="p-6 rounded-[24px] bg-black/20 border-3d flex items-center justify-between backdrop-blur-md transition-colors group-hover:bg-black/30">
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-2">
              Cycle Quota
            </p>
            <p className="text-xl font-bold text-foreground tabular-nums">
              {quota.toLocaleString()}
            </p>
          </div>
          <div className="w-px h-10 bg-white/5 mx-6" />
          <div className="flex-1 text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-2">
              Used This Cycle
            </p>
            <p className="text-xl font-bold text-foreground tabular-nums">
              {Math.max(0, quota - balance).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {!hasCredits && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 mt-6 p-5 rounded-2xl border border-red-500/20 bg-red-500/5 flex items-start gap-4 backdrop-blur-sm shadow-xl"
        >
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20">
             <IconAlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-red-400">
              Low Credit Balance
            </p>
            <p className="text-xs text-red-400/60 mt-1 font-medium leading-relaxed">
              You&apos;ve run out of fuel. Level up your plan to keep
              building amazing mobile experiences.
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
