"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { PromptBox } from "@/components/ui";
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
    <div className="relative flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 bg-[#1f2228]">

      <div className="relative w-full max-w-4xl flex flex-col gap-10 z-10 py-12">
        <HomeHeader />

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
          <PromptBox
            name="message"
            defaultValue={promptValue}
            onError={(errorMessage: string) => setError(errorMessage)}
          />

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400 text-center font-sans"
            >
              {error}
            </motion.div>
          )}
        </motion.div>

        <SuggestionGrid
          suggestions={suggestions}
          onSuggestionClick={handleSuggestionClick}
        />
      </div>
    </div>
  );
}
