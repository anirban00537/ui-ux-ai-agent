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
    <section className="py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-4 mb-20 text-center">
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-border backdrop-blur-md mb-6"
          >
              <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(30,157,241,0.5)]"></span>
              <span className="text-xs font-medium tracking-widest uppercase text-foreground/70">
                  Community Love
              </span>
          </motion.div>
        <h2 className="font-serif text-5xl md:text-7xl text-foreground tracking-tight">
            Love letters from <span className="text-primary/70 italic">creators.</span>
        </h2>
      </div>

      <div className="relative w-full overflow-hidden mask-linear-fade">
         <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-background to-transparent" />
         <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-background to-transparent" />

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
              className="relative w-[350px] md:w-[450px] p-10 bg-black/10 backdrop-blur-sm rounded-[32px] shadow-sm border border-border shrink-0 hover:bg-black/20 transition-all duration-500"
            >
              {/* Giant Quote Mark */}
              <span className="absolute top-4 left-6 text-9xl text-primary/5 font-serif leading-none select-none">
                &ldquo;
              </span>

              <div className="relative z-10">
                <p className="font-serif text-xl md:text-2xl text-foreground leading-relaxed mb-6 italic font-light">
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
