"use client";

import React from "react";
import { motion } from "framer-motion";

interface HomeHeaderProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  title = <>What design to build today?</>,
  subtitle
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-4"
    >
      <h1 className="font-mono text-3xl md:text-4xl text-foreground tracking-tight leading-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="font-sans text-muted-foreground max-w-lg mx-auto">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};
