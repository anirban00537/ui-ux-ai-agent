"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { PromptBox } from "@/components/ui";
import { HomeHeader, SuggestionGrid } from "@/components/home";
import { trackEvent } from "@/components/analytics/trackEvent";
import { suggestions } from "./constants";

export default function HomePage() {
  const [error, setError] = useState<string | null>(null);
  const [promptValue, setPromptValue] = useState("");

  const handleSuggestionClick = (prompt: string) => {
    trackEvent('home_suggestion_click', 'engagement', prompt);
    setPromptValue(prompt);
  };

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] overflow-hidden px-4 ">
      {/* Content */}
      <div className="relative w-full max-w-4xl flex flex-col gap-4 z-10">
        <HomeHeader />

        {/* Prompt Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative w-full max-w-2xl mx-auto"
        >
          <PromptBox
            name="message"
            defaultValue={promptValue}
            onError={(errorMessage) => setError(errorMessage)}
            className="border border-border bg-card shadow-none"
          />

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500 text-center font-medium"
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
