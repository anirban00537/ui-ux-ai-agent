"use client";

import { motion } from "framer-motion";
import { useProducts } from "@/hooks/use-pricing";
import { PricingCard } from "@/components/pricing-card";

export function PricingSection() {
  const { data: products, isLoading } = useProducts();

  // Only show real products from API, no dummy data
  const displayPlans = products || [];

  return (
    <section className="py-32 relative" id="pricing">
      {/* Torch Light Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[1200px] pointer-events-none z-0">
        {/* Core spotlight beam - Increased intensity */}
        <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_0%,var(--color-primary)_0%,transparent_100%)] blur-[100px] opacity-[0.3]" />
        {/* Secondary glow - Wider spread */}
        <div className="absolute inset-0 h-[800px] -top-[100px] bg-[radial-gradient(50%_50%_at_50%_0%,var(--color-primary)_0%,transparent_100%)] blur-[80px] opacity-[0.2]" />
        {/* Center hot spot - Brightest point */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[800px] h-[400px] bg-[radial-gradient(50%_50%_at_50%_0%,var(--color-primary)_0%,transparent_100%)] blur-[50px] opacity-[0.4]" />
      </div>

      {/* Torch Light Effect - Bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[1200px] pointer-events-none z-0">
        {/* Core spotlight beam */}
        <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_100%,var(--color-primary)_0%,transparent_100%)] blur-[100px] opacity-[0.3]" />
        {/* Secondary glow */}
        <div className="absolute inset-0 h-[800px] -bottom-[100px] bg-[radial-gradient(50%_50%_at_50%_100%,var(--color-primary)_0%,transparent_100%)] blur-[80px] opacity-[0.2]" />
        {/* Center hot spot */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[800px] h-[400px] bg-[radial-gradient(50%_50%_at_50%_100%,var(--color-primary)_0%,transparent_100%)] blur-[50px] opacity-[0.4]" />
      </div>



      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-border backdrop-blur-md mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(30,157,241,0.5)]"></span>
            <span className="text-xs font-medium tracking-widest uppercase text-foreground/70">
              Simple Investment
            </span>
          </motion.div>
          <h2 className="font-serif text-5xl md:text-7xl text-foreground mb-6 tracking-tight leading-[1]">
            Invest in your <span className="italic text-primary/70">impact.</span>
          </h2>
          <p className="text-xl text-muted-foreground/80 font-light leading-relaxed">
            Simple, transparent pricing that grows with you. No hidden fees, ever.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col lg:flex-row flex-wrap justify-center gap-8 items-center max-w-6xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-3xl p-8 h-[450px] w-full lg:w-[calc(33.333%-2rem)] max-w-sm animate-pulse border border-border">
                <div className="h-6 w-24 bg-secondary/20 rounded mb-4" />
                <div className="h-4 w-48 bg-secondary/10 rounded mb-8" />
                <div className="h-12 w-32 bg-secondary/20 rounded mb-8" />
                <div className="space-y-3">
                  <div className="h-4 w-full bg-secondary/10 rounded" />
                  <div className="h-4 w-3/4 bg-secondary/10 rounded" />
                  <div className="h-4 w-5/6 bg-secondary/10 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && displayPlans.length > 0 && (
          <div className="flex flex-col lg:flex-row flex-wrap justify-center gap-8 items-stretch max-w-6xl mx-auto">
            {displayPlans.slice(0, 3).map((plan: any, i) => {
              const isPlus = plan.name?.toLowerCase().includes("plus");

              return (
                <div key={plan.id || i} className="w-full lg:w-[calc(33.333%-2rem)] max-w-sm">
                  <PricingCard
                    product={plan}
                    index={i}
                    isPopular={isPlus}
                    isCurrentPlan={false}
                    onSelect={undefined}
                    href="/signup"
                    loading={false}
                    cta={isPlus ? "Get Started Now" : "Get Started"}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && displayPlans.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              Pricing plans are being loaded. Please check back soon.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
