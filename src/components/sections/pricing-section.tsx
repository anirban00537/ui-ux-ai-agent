"use client";

import { motion } from "framer-motion";
import { useProducts } from "@/hooks/use-pricing";
import { PricingCard } from "@/components/pricing-card";

export function PricingSection() {
  const { data: products, isLoading } = useProducts();

  // Only show real products from API, no dummy data
  const displayPlans = products || [];

  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-secondary/30" id="pricing">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20 flex flex-col items-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight leading-tight">
            Invest in your impact
          </h2>
          <p className="text-lg md:text-[20px] text-muted-foreground/90 font-medium leading-relaxed max-w-xl mx-auto">
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
