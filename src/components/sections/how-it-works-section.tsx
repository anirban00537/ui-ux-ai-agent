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
    <section className="py-32 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="mb-24 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-border backdrop-blur-md mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(30,157,241,0.5)]"></span>
            <span className="text-xs font-medium tracking-widest uppercase text-foreground/70">
              Seamless Workflow
            </span>
          </motion.div>
          <h2 className="font-serif text-5xl md:text-7xl text-foreground mb-6 tracking-tight leading-[1]">
            From idea to design <br />
            <span className="italic text-primary/60">in seconds.</span>
          </h2>
          <p className="text-xl text-muted-foreground/80 font-light leading-relaxed">
            Three simple steps to generate professional mobile app UI.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-24 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />

          {steps.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className={cn(
                "group relative z-10 flex flex-col gap-6 p-8 rounded-3xl bg-black/5 backdrop-blur-sm border-3d transition-all duration-500 hover:bg-black/10 hover:border-primary/20",
                step.align === "center" ? "md:items-center md:text-center" :
                  step.align === "right" ? "md:items-end md:text-right" : "md:items-start md:text-left"
              )}
            >
              <div className="relative">
                <span className="font-serif text-[100px] leading-none text-primary/5 select-none absolute -top-12 -left-4 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  {step.id}
                </span>
                <div className="relative z-10 w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xl mb-4 group-hover:scale-110 transition-transform duration-500">
                  {step.id}
                </div>
                <h3 className="relative z-10 text-2xl font-serif font-medium text-foreground">
                  {step.title}
                </h3>
              </div>

              <p className="text-muted-foreground text-sm relative z-10 leading-relaxed font-light">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
