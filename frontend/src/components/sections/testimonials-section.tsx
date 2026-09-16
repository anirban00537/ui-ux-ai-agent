"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    quote: "Butterfast transformed our mobile app design workflow. What took days now takes minutes.",
    author: "Sarah Chen",
    role: "Marketing Director @ TechCorp",
  },
  {
    quote: "The layout engine is eerily smart. It just knows where to put things.",
    author: "Mark Davis",
    role: "Founder, ScaleAI",
  },
  {
    quote: "Finally, an AI design tool that understands clean mobile UI/UX principles.",
    author: "Elena Rodriguez",
    role: "Creative Lead",
  },
  {
    quote: "It feels like having a professional designer sitting right next to you.",
    author: "David Kim",
    role: "Product Manager",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-background">
      <div className="container mx-auto px-4 mb-20 text-center relative z-10 flex flex-col items-center">
        <h2 className="font-mono text-4xl md:text-5xl text-foreground leading-tight max-w-2xl">
          Love letters from creators
        </h2>
      </div>

      <div className="relative w-full overflow-hidden">
        <motion.div
          className="flex gap-8 w-max pl-4"
          animate={{ x: "-50%" }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {[...testimonials, ...testimonials].map((t, i) => (
            <div
              key={i}
              className="relative w-[350px] md:w-[450px] p-10 border border-border bg-card shrink-0 hover:border-border-strong transition-colors duration-500"
            >
              <span className="absolute top-4 left-6 font-mono text-9xl text-foreground/5 leading-none select-none">
                &ldquo;
              </span>

              <div className="relative z-10">
                <p className="font-sans text-lg md:text-xl text-foreground/80 leading-relaxed mb-8">
                  {t.quote}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-px bg-border" />
                  <div>
                    <p className="font-sans text-sm text-foreground">{t.author}</p>
                    <p className="font-mono text-xs uppercase tracking-[1px] text-muted-foreground/50">{t.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
