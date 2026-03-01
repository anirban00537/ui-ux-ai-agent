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
    <section className="py-24 md:py-32 relative overflow-hidden bg-muted/30">
      <div className="container mx-auto px-4 mb-20 text-center relative z-10 flex flex-col items-center">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight max-w-2xl">
          Love letters from creators
        </h2>
      </div>

      <div className="relative w-full overflow-hidden mask-linear-fade">
        <div className="absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-muted/30 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-muted/30 to-transparent pointer-events-none" />

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
              className="relative w-[350px] md:w-[450px] p-10 bg-secondary/20 backdrop-blur-sm rounded-[32px] shadow-sm border border-border shrink-0 hover:bg-white hover:shadow-xl hover:scale-[1.01] transition-all duration-500"
            >
              {/* Giant Quote Mark */}
              <span className="absolute top-4 left-6 text-9xl text-foreground/5 font-serif leading-none select-none">
                &ldquo;
              </span>

              <div className="relative z-10">
                <p className="text-[19px] md:text-[21px] text-foreground leading-relaxed mb-8 font-medium">
                  {t.quote}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-px bg-primary/20" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.author}</p>
                    <p className="text-xs text-muted-foreground/60 uppercase tracking-widest">{t.role}</p>
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
