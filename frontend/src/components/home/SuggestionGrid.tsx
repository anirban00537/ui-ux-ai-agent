"use client";

import React from "react";
import { motion } from "framer-motion";
import { SuggestionCard } from "./SuggestionCard";

interface Suggestion {
  icon: any;
  title: string;
  description: string;
  prompt: string;
  iconColor?: string;
}

interface SuggestionGridProps {
  suggestions: Suggestion[];
  onSuggestionClick: (prompt: string) => void;
  title?: string;
}

export const SuggestionGrid: React.FC<SuggestionGridProps> = ({
  suggestions,
  onSuggestionClick,
  title = "Quick Start Ideas",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="space-y-3"
    >
      {title && (
        <p className="text-[10px] font-bold text-muted-foreground/60 text-center uppercase tracking-widest">
          {title}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {suggestions.map((suggestion, index) => (
          <SuggestionCard
            key={suggestion.title}
            {...suggestion}
            index={index}
            onClick={onSuggestionClick}
          />
        ))}
      </div>
    </motion.div>
  );
};
