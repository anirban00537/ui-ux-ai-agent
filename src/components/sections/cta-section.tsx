"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="relative py-32 bg-[#1a1a1a] overflow-hidden text-center text-white">
      {/* Dark Texture */}
      <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none mix-blend-overlay" />
      
      {/* Central Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4">
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
        >
            <h2 className="font-serif text-5xl md:text-7xl mb-8 tracking-tight">
                Ready to <span className="text-primary italic">launch</span>?
            </h2>
            <p className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto mb-12 font-light">
                Join thousands of designers who have switched to the effortless way of building UI.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                 <Link href="/signup">
                    <Button size="lg" className="h-16 px-10 rounded-full text-lg bg-primary hover:bg-primary/90 text-white shadow-coral-glow hover:scale-105 transition-all duration-300">
                        Start Creating for Free
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                 </Link>
            </div>
            
            <p className="mt-8 text-sm text-white/30">
                No credit card required. Cancel anytime.
            </p>
        </motion.div>
      </div>
    </section>
  );
}
