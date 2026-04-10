"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

const spinningWord = "Mobile App";

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-24 overflow-hidden min-h-screen flex flex-col items-center justify-center isolate bg-[#1f2228]">
      <div className="container relative z-10 px-4 flex flex-col items-center">
        <div className="w-full max-w-5xl flex flex-col gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center flex flex-col items-center gap-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 border border-white/20">
              <span className="font-mono text-xs uppercase tracking-[1.4px] text-white">
                AI-Powered Design
              </span>
            </div>

            <h1 className="font-mono text-5xl md:text-7xl lg:text-[120px] font-light tracking-tight text-white leading-[1] max-w-5xl text-center">
              Design{" "}
              <span className="relative inline-block text-left">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={spinningWord}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute left-0 bottom-0 text-white/70 whitespace-nowrap"
                  >
                    {spinningWord}
                  </motion.span>
                </AnimatePresence>
                <span className="opacity-0 invisible pointer-events-none whitespace-nowrap">
                  {spinningWord}
                </span>
              </span>{" "}
              in Seconds
            </h1>

            <p className="font-sans text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed text-center max-w-xl">
              Transform your prompts into stunning mobile app designs instantly.
              No design skills needed—just describe what you want.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link href="/home">
                <Button size="lg" className="font-mono">
                  Start Building
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="ghost" size="lg" className="font-mono">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="relative w-full max-w-5xl mx-auto mt-16"
          >
            <div className="relative z-10 border border-white/10 bg-white/[0.03] p-2">
              <div className="relative w-full aspect-[16/10] sm:aspect-video overflow-hidden bg-white/5">
                <iframe
                  src="https://www.youtube.com/embed/rogYPw2uZjo?autoplay=1&mute=1&loop=1&playlist=rogYPw2uZjo&controls=0&rel=0&modestbranding=1&playsinline=1"
                  title="Butterfast Demo"
                  className="absolute inset-0 w-full h-full border-0 pointer-events-none scale-[1.05]"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
