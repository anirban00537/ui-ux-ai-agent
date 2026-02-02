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
    <section className="py-32 relative overflow-hidden bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-24 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border shadow-sm mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-primary/70"></span>
            <span className="text-xs font-bold tracking-widest uppercase text-foreground/70">
              Seamless Workflow
            </span>
          </motion.div>
          <h2 className="font-serif text-5xl md:text-7xl text-foreground mb-6 tracking-tight leading-[1]">
            From idea to design <br />
            <span className="italic text-secondary-foreground/60">in seconds.</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Three simple steps to generate professional mobile app UI.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-24 left-0 w-full h-0.5 bg-gradient-to-r from-secondary/20 via-primary/20 to-secondary/20" />

          {steps.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className={cn(
                "relative z-10 flex flex-col gap-4",
                step.align === "center" ? "md:items-center md:text-center" :
                  step.align === "right" ? "md:items-end md:text-right" : "md:items-start md:text-left"
              )}
            >
              <div className="relative">
                <span className="font-serif text-[120px] leading-none text-secondary/30 select-none absolute -top-16 -left-6 z-0 mix-blend-multiply opacity-50">
                  {step.id}
                </span>
                <h3 className="relative z-10 text-2xl font-bold px-4 py-1 inline-block">
                  {step.title}
                </h3>
              </div>

              <p className="text-muted-foreground relative z-10 max-w-xs leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
