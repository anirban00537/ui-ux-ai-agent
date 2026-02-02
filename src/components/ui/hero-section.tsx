"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PromptBox, type PromptMode } from "@/components/ui";
import { trackEvent } from "@/components/analytics/trackEvent";
import { cn } from "@/lib/utils";

const spinningWord = "Mobile App";

export default function HeroSection() {
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="relative pt-32 pb-24 overflow-hidden min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="container relative z-10 px-4 flex flex-col items-center">
        <div className="w-full max-w-4xl flex flex-col gap-3">
          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-foreground leading-[1.1] mb-6">
              Design{" "}
              <span className="relative inline-block text-left">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={spinningWord}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="absolute left-0 bottom-0 italic text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500 whitespace-nowrap"
                  >
                    {spinningWord}
                  </motion.span>
                </AnimatePresence>
                {/* Invisible spacer to maintain layout height/width based on longest word */}
                <span className="opacity-0 invisible pointer-events-none italic whitespace-nowrap">
                  {spinningWord}
                </span>
              </span>{" "}
              in Seconds
            </h1>
            <p className="text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Transform your prompts into stunning mobile app
              designs. No design skills needed.
            </p>
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
              onError={(errorMessage: string) => setError(errorMessage)}
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

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex justify-center"
          >
            <a href="https://twelve.tools" target="_blank" rel="noreferrer">
              <img
                src="https://twelve.tools/badge0-light.svg"
                alt="Featured on Twelve Tools"
                width={200}
                height={54}
              />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
