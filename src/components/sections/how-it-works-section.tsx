"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const steps = [
  {
    id: "01",
    title: "Input",
    description: "Type a concept, paste requirements, or enter a URL. Our engine reads it all.",
    align: "left",
  },
  {
    id: "02",
    title: "Generate",
    description: "The AI structures your narrative, selects layouts, and writes the copy.",
    align: "center",
  },
  {
    id: "03",
    title: "Refine",
    description: "Make quick edits with our intuition tools, then share your design instantly.",
    align: "right",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-slate-950" id="how-it-works">
      <div className="container mx-auto px-4 relative z-10">
        <div className="mb-20 text-center max-w-3xl mx-auto flex flex-col items-center">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight">
            Getting started?
          </h3>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
            Oh, that's easy!
          </h2>
          <p className="text-lg md:text-xl text-white/70 font-medium leading-relaxed max-w-xl mx-auto mb-8">
            Three simple steps to generate professional mobile app UI. No learning curve, just pure creation.
          </p>
          <a href="/home" className="inline-flex items-center justify-center rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-primary/20">
            Start Building Free
          </a>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-white/10 -translate-y-1/2" />

          {steps.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className={cn(
                "group relative z-10 flex flex-col gap-4 p-8 rounded-[24px] bg-white border border-black/5 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl",
                step.align === "center" ? "md:items-center md:text-center" :
                  step.align === "right" ? "md:items-end md:text-right" : "md:items-start md:text-left"
              )}
            >
              <div className="relative w-full flex flex-col">
                <div className={cn("w-14 h-14 flex items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-2xl mb-6 shadow-inner",
                  step.align === "center" && "mx-auto",
                  step.align === "right" && "ml-auto"
                )}>
                  {step.id}
                </div>
                <h3 className="text-2xl font-bold text-foreground tracking-tight mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground/90 text-[16px] leading-relaxed font-medium">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
