"use client";

import React from "react";
import { motion } from "framer-motion";

export const PricingHeader = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6"
    >
      <h1 className="font-mono text-4xl md:text-5xl text-white tracking-tight leading-tight">
        Simple, transparent pricing
      </h1>
      <p className="font-sans text-base md:text-lg text-white/70 max-w-xl mx-auto leading-relaxed">
      Choose the perfect plan to supercharge your mobile app design workflow
      with AI. No hidden fees, just pure creativity.
      </p>
    </motion.div>
  );
};
