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
      <p className="font-sans text-sm text-muted-foreground">
        Join thousands of creators building amazing mobile app designs with
        Butterfast.
      </p>
      <div className="flex items-center justify-center gap-6">
        <span className="font-mono text-[10px] uppercase tracking-[1.4px] text-muted-foreground/50">
          Secured with Polar.sh
        </span>
        <div className="w-1.5 h-1.5 bg-muted-foreground/30" />
        <span className="font-mono text-[10px] uppercase tracking-[1.4px] text-muted-foreground/50">
          No Hidden Fees
        </span>
      </div>
    </motion.div>
  );
};
