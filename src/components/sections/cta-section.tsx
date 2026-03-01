"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-accent" id="cta">
      <div className="relative z-10 container mx-auto px-4 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative w-full max-w-4xl text-center flex flex-col items-center"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-foreground leading-tight">
            Ready to <span className="text-primary">launch</span>?
          </h2>
          <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
            Join thousands of designers who have switched to the effortless way of building mobile experiences.
          </p>

          <Link href="/login">
            <Button size="lg" className="rounded-full h-14 px-10 text-[17px] font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_8px_20px_var(--tw-shadow-color)] shadow-primary/20 hover:shadow-[0_12px_24px_var(--tw-shadow-color)] hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
              Start Creating Now
            </Button>
          </Link>

          <p className="mt-8 text-sm text-foreground/50 font-medium tracking-wide">
            Join our premium community today. Cancel anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
