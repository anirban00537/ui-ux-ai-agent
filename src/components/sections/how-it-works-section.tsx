"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
    <section className="py-24 md:py-32 relative overflow-hidden bg-[#1f2228]" id="how-it-works">
      <div className="container mx-auto px-4 relative z-10">
        <div className="mb-20 text-center max-w-3xl mx-auto flex flex-col items-center">
          <h3 className="font-mono text-xl md:text-2xl text-white mb-2 tracking-tight">
            Getting started?
          </h3>
          <h2 className="font-mono text-4xl md:text-6xl text-white mb-6 tracking-tight leading-tight">
            Oh, that&apos;s easy!
          </h2>
          <p className="font-sans text-lg md:text-xl text-white/70 leading-relaxed max-w-xl mx-auto mb-8">
            Three simple steps to generate professional mobile app UI. No learning curve, just pure creation.
          </p>
          <Link href="/home">
            <Button className="font-mono">
              Start Building Free
            </Button>
          </Link>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-white/10 -translate-y-1/2" />

          {steps.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className={cn(
                "group relative z-10 flex flex-col gap-4 p-8 border border-white/10 bg-white/[0.03] transition-colors duration-500 hover:border-white/20",
                step.align === "center" ? "md:items-center md:text-center" :
                  step.align === "right" ? "md:items-end md:text-right" : "md:items-start md:text-left"
              )}
            >
              <div className="relative w-full flex flex-col">
                <div className={cn(
                  "w-14 h-14 flex items-center justify-center border border-white/20 text-white font-mono text-2xl mb-6",
                  step.align === "center" && "mx-auto",
                  step.align === "right" && "ml-auto"
                )}>
                  {step.id}
                </div>
                <h3 className="font-sans text-2xl text-white tracking-tight mb-2">
                  {step.title}
                </h3>
                <p className="font-sans text-white/60 text-base leading-relaxed">
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
