"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const spinningWord = "Mobile App";

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-24 overflow-hidden min-h-screen flex flex-col items-center justify-center isolate">
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: "url('/background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Refined overlay for depth and readability */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-background/40 to-background" />
      
      <div className="container relative z-10 px-4 flex flex-col items-center">
        <div className="w-full max-w-5xl flex flex-col gap-8 items-center">
          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center flex flex-col items-center gap-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium tracking-wide uppercase text-primary">
                AI-Powered Design
              </span>
            </div>

            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-foreground leading-[1.1] max-w-4xl text-center">
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
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-center">
              Transform your prompts into stunning mobile app designs instantly. 
              No design skills needed—just describe what you want.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <Button size="lg" className="rounded-full h-12 px-8 text-base shadow-lg hover:shadow-xl transition-all hover:scale-105" asChild>
                <Link href="/home">
                  Start Building for Free
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Video / Demo Area */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="relative w-full max-w-5xl mx-auto mt-12"
          >
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-blue-600/30 rounded-[2rem] blur-2xl opacity-50 dark:opacity-40" />
            
            <div className="relative rounded-xl md:rounded-2xl border border-white/20 dark:border-white/10 bg-white/50 dark:bg-black/50 backdrop-blur-sm p-2 shadow-2xl ring-1 ring-black/5 dark:ring-white/5">
              <div className="relative w-full aspect-video overflow-hidden rounded-lg md:rounded-xl border border-white/10 bg-black/5">
                <iframe
                  src="https://www.youtube.com/embed/rogYPw2uZjo?autoplay=1&mute=1&loop=1&playlist=rogYPw2uZjo&controls=0&rel=0&modestbranding=1&playsinline=1"
                  title="Butterfast Demo"
                  className="absolute inset-0 w-full h-full border-0 pointer-events-none scale-[1.02]"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
                
                {/* Overlay for better integration */}
                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 dark:ring-white/5 pointer-events-none rounded-lg md:rounded-xl" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
