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
  const [mode, setMode] = useState<PromptMode>("presentation");

  const handleSuggestionClick = (prompt: string) => {
    trackEvent('home_suggestion_click', 'engagement', prompt);
    setPromptValue(prompt);
  };

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] overflow-hidden px-4 ">
      {/* Content */}
      <div className="relative w-full max-w-4xl flex flex-col gap-4 z-10">
        <HomeHeader />

        {/* Mode Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center gap-1 w-full max-w-2xl mx-auto"
        >
          <button
            type="button"
            onClick={() => {
              setMode("presentation");
              trackEvent("prompt_mode_switch", "engagement", "presentation");
            }}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-medium transition-colors",
              mode === "presentation"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            Presentation
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("mobile-app");
              trackEvent("prompt_mode_switch", "engagement", "mobile-app");
            }}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-medium transition-colors",
              mode === "mobile-app"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            Mobile App
          </button>
        </motion.div>

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
            mode={mode}
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
