"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { IconSparkles, IconPlayerPlay } from "@tabler/icons-react";
import { trackEvent } from "@/components/analytics/trackEvent";

export default function HeroSection() {
  const [videoError, setVideoError] = useState(false);

  return (
    <section className="relative pt-32 pb-24 overflow-hidden min-h-screen flex flex-col items-center justify-start bg-background">
      <div className="container relative z-10 px-4 flex flex-col items-center">
        {/* Headline Section */}
        <div className="text-center max-w-5xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-xs font-semibold tracking-wide uppercase text-zinc-600 dark:text-zinc-400">
              AI-Powered Design v2.0
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-6xl md:text-7xl lg:text-9xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50 leading-[0.95] mb-8"
          >
            Ideas to{" "}
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
              Presentations
            </span>{" "}
            <br />
            in Seconds.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
          >
            Butterfast transforms your prompts into stunning, professional
            presentations. No design skills needed. Just pure storytelling.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/home">
              <Button
                size="lg"
                onClick={() => trackEvent('button_click', 'engagement', 'hero_cta_start_creating')}
                className="h-14 px-8 rounded-full text-lg bg-white text-zinc-900 hover:bg-zinc-100 shadow-xl transition-all duration-300"
              >
                <IconSparkles className="mr-2 h-5 w-5" />
                Start Creating Free
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => trackEvent('button_click', 'engagement', 'hero_cta_how_it_works')}
              className="h-14 px-8 rounded-full text-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
            >
              <IconPlayerPlay className="mr-2 h-5 w-5 fill-current" />
              See how it works
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 flex justify-center"
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

        {/* Sleek Video Preview */}
        <motion.div
          className="relative w-full max-w-6xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {/* Glow Effect behind the video */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-purple-600/30 rounded-2xl blur-2xl opacity-30"></div>
          
          <div className="relative aspect-[21/9] rounded-xl overflow-hidden shadow-2xl border border-zinc-200/50 dark:border-zinc-800/50 bg-black">
            {!videoError ? (
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/bkIDMSYVVLc?vq=hd1080&hd=1&rel=0"
                title="Demo video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                onError={() => setVideoError(true)}
              />
            ) : (
              <Image
                src="/demo.png"
                alt="Demo preview"
                fill
                className="object-cover"
                priority
              />
            )}
            
            {/* Subtle Texture Overlay */}
            <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
