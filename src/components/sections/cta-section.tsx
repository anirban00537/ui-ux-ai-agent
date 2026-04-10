"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-[#1f2228]" id="cta">
      <div className="relative z-10 container mx-auto px-4 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative w-full max-w-4xl text-center flex flex-col items-center"
        >
          <h2 className="font-mono text-4xl md:text-6xl font-light mb-8 tracking-tight text-white leading-tight">
            Ready to launch?
          </h2>
          <p className="font-sans text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-12 leading-relaxed">
            Join thousands of designers who have switched to the effortless way of building mobile experiences.
          </p>

          <Link href="/login">
            <Button size="lg" className="font-mono">
              Start Creating Now
            </Button>
          </Link>

          <p className="mt-8 font-sans text-sm text-white/50">
            Join our premium community today. Cancel anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
