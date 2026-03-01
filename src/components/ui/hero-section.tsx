"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const spinningWord = "Mobile App";

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-24 overflow-hidden min-h-screen flex flex-col items-center justify-center isolate bg-white">
      {/* Refined overlay for depth and readability */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/40 via-white to-white" />

      <div className="container relative z-10 px-4 flex flex-col items-center">
        <div className="w-full max-w-5xl flex flex-col gap-8 items-center">
          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center flex flex-col items-center gap-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-border/50 shadow-sm backdrop-blur-md">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-xs font-semibold tracking-wide uppercase text-foreground/80">
                AI-Powered Design
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-[80px] font-bold tracking-tight text-foreground leading-[1.05] max-w-5xl text-center">
              Design{" "}
              <span className="relative inline-block text-left">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={spinningWord}
                    initial={{ y: 20, opacity: 0, filter: "blur(4px)" }}
                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                    exit={{ y: -20, opacity: 0, filter: "blur(4px)" }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute left-0 bottom-0 italic font-[family-name:var(--font-libre)] text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-blue-500 whitespace-nowrap pb-1 translate-y-2"
                  >
                    {spinningWord}
                  </motion.span>
                </AnimatePresence>
                {/* Invisible spacer to maintain layout height/width based on longest word */}
                <span className="opacity-0 invisible pointer-events-none italic font-[family-name:var(--font-libre)] whitespace-nowrap pb-1">
                  {spinningWord}
                </span>
              </span>{" "}
              in Seconds
            </h1>

            <p className="text-lg md:text-[22px] text-muted-foreground/90 max-w-2xl mx-auto leading-relaxed text-center font-medium">
              Transform your prompts into stunning mobile app designs instantly.
              No design skills needed—just describe what you want.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button size="lg" className="rounded-full h-14 px-10 text-[17px] font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all hover:-translate-y-0.5" asChild>
                <Link href="/home">
                  Start Building for Free
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Video / Demo Area */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="relative w-full max-w-5xl mx-auto mt-20"
          >
            {/* Glowing Aura Background (matching the image) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-pink-300 via-purple-300 to-indigo-300 rounded-[100%] blur-[120px] opacity-40 mix-blend-multiply z-0 pointer-events-none" />

            <div className="relative z-10 rounded-2xl md:rounded-[32px] border border-black/[0.04] bg-white p-3 shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
              <div className="relative w-full aspect-[16/10] sm:aspect-video overflow-hidden rounded-xl md:rounded-[24px] border border-black/[0.04] bg-muted">
                <iframe
                  src="https://www.youtube.com/embed/rogYPw2uZjo?autoplay=1&mute=1&loop=1&playlist=rogYPw2uZjo&controls=0&rel=0&modestbranding=1&playsinline=1"
                  title="Butterfast Demo"
                  className="absolute inset-0 w-full h-full border-0 pointer-events-none scale-[1.05]"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />

                {/* Overlay for better integration */}
                <div className="absolute inset-0 ring-1 ring-inset ring-black/5 pointer-events-none rounded-xl md:rounded-[24px]" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
