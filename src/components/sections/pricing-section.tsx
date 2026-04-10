"use client";

import { motion } from "framer-motion";
import { useProducts } from "@/hooks/use-pricing";
import { PricingCard } from "@/components/pricing-card";

export function PricingSection() {
  const { data: products, isLoading } = useProducts();

  const displayPlans = products || [];

  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-[#1f2228]" id="pricing">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20 flex flex-col items-center">
          <h2 className="font-mono text-4xl md:text-5xl text-white mb-6 tracking-tight leading-tight">
            Invest in your impact
          </h2>
          <p className="font-sans text-lg md:text-xl text-white/70 leading-relaxed max-w-xl mx-auto">
            Simple, transparent pricing that grows with you. No hidden fees, ever.
          </p>
        </div>

        {isLoading && (
          <div className="flex flex-col lg:flex-row flex-wrap justify-center gap-8 items-center max-w-6xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-white/10 bg-white/[0.03] p-8 h-[450px] w-full lg:w-[calc(33.333%-2rem)] max-w-sm">
                <div className="h-6 w-24 bg-white/10 rounded mb-4" />
                <div className="h-4 w-48 bg-white/5 rounded mb-8" />
                <div className="h-12 w-32 bg-white/10 rounded mb-8" />
                <div className="space-y-3">
                  <div className="h-4 w-full bg-white/5 rounded" />
                  <div className="h-4 w-3/4 bg-white/5 rounded" />
                  <div className="h-4 w-5/6 bg-white/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

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

        {!isLoading && displayPlans.length === 0 && (
          <div className="text-center py-16">
            <p className="font-sans text-lg text-white/50">
              Pricing plans are being loaded. Please check back soon.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
