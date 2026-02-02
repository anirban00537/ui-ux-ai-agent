"use client";

import React from "react";
import { motion } from "framer-motion";

export const PricingFooter = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      className="text-center space-y-4 pt-4"
    >
      <p className="text-sm text-muted-foreground font-medium">
        Join thousands of creators building amazing mobile app designs with
        Butterfast.
      </p>
      <div className="flex items-center justify-center gap-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
          Secured with Polar.sh
        </span>
        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
          No Hidden Fees
        </span>
      </div>
    </motion.div>
  );
};
