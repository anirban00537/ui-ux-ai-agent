"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { PromptBox, type PromptMode } from "@/components/ui";
import { HomeHeader, SuggestionGrid } from "@/components/home";
import { trackEvent } from "@/components/analytics/trackEvent";
import { suggestions } from "./constants";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const [error, setError] = useState<string | null>(null);
  const [promptValue, setPromptValue] = useState("");

  const handleSuggestionClick = (prompt: string) => {
    trackEvent('home_suggestion_click', 'engagement', prompt);
    setPromptValue(prompt);
  };

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 overflow-hidden">
      {/* Torch Light Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[700px] pointer-events-none z-0">
        {/* Core spotlight beam - Increased intensity */}
        <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_0%,var(--color-primary)_0%,transparent_100%)] blur-[100px] opacity-[0.3]" />
        {/* Secondary glow - Wider spread */}
        <div className="absolute inset-0 h-[500px] -top-[100px] bg-[radial-gradient(50%_50%_at_50%_0%,var(--color-primary)_0%,transparent_100%)] blur-[80px] opacity-[0.2]" />
        {/* Center hot spot - Brightest point */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[600px] h-[300px] bg-[radial-gradient(50%_50%_at_50%_0%,var(--color-primary)_0%,transparent_100%)] blur-[50px] opacity-[0.4]" />
      </div>

      {/* Content */}
      <div className="relative w-full max-w-4xl flex flex-col gap-10 z-10 py-12">
        <HomeHeader />

        {/* Prompt Box Container with Glass effect */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            type: "spring",
            damping: 25,
            stiffness: 120,
            delay: 0.1 
          }}
          className="relative w-full max-w-2xl mx-auto"
        >
          <div className="absolute -inset-px bg-gradient-to-b from-primary/30 to-transparent rounded-[32px] blur-2xl opacity-30 -z-10" />
          
          <PromptBox
            name="message"
            defaultValue={promptValue}
            onError={(errorMessage: string) => setError(errorMessage)}
          />

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500 text-center font-medium backdrop-blur-md"
            >
              {error}
            </motion.div>
          )}
        </motion.div>

        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/20 to-transparent -z-10" />
          <SuggestionGrid
            suggestions={suggestions}
            onSuggestionClick={handleSuggestionClick}
          />
        </div>
      </div>
    </div>
  );
}
