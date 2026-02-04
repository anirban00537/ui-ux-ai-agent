"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="relative py-32 bg-background overflow-hidden" id="cta">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 flex justify-center">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative w-full max-w-5xl p-12 md:p-24 rounded-[48px] bg-white/[0.02] backdrop-blur-xl border-3d shadow-2xl overflow-hidden text-center"
        >
            {/* Inner Glow */}
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />

            <h2 className="relative z-10 font-serif text-5xl md:text-7xl mb-8 tracking-tight text-white leading-[1]">
                Ready to <span className="text-primary/80 italic">launch</span>?
            </h2>
            <p className="relative z-10 text-xl md:text-2xl text-white/50 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
                Join thousands of designers who have switched to the effortless way of building mobile experiences.
            </p>
            
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-6">
                 <Link href="/signup" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full h-16 px-10 rounded-full text-lg bg-primary hover:bg-primary/90 text-white shadow-coral-glow hover:scale-105 transition-all duration-500">
                        Start Creating for Free
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                 </Link>
            </div>
            
            <p className="relative z-10 mt-8 text-sm text-white/20 font-light tracking-wide">
                No credit card required. Cancel anytime.
            </p>
        </motion.div>
      </div>
    </section>
  );
}
