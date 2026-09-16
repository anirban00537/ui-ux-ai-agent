"use client";

import React, { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { 
  selectIsSubscribed, 
  selectSubscriptionLoading,
  selectSubscriptionStatus 
} from "@/store/slices/subscriptionSlice";
import { useProducts } from "@/hooks/use-pricing";
import { createCheckout } from "@/services/pricing";
import { syncSubscription } from "@/services/subscription";
import { PricingCard } from "@/components/pricing-card";
import { PricingHeader } from "@/components/pricing";
import { toast } from "sonner";
import { trackEvent } from "@/components/analytics/trackEvent";
import { IconLoader2, IconSparkles, IconRefresh } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { DotPattern } from "@/components/ui/dot-pattern";

interface PlanGateProps {
  children: React.ReactNode;
}

export function PlanGate({ children }: PlanGateProps) {
  const pathname = usePathname();
  const isSubscribed = useAppSelector(selectIsSubscribed);
  const isLoadingSubscription = useAppSelector(selectSubscriptionLoading);
  const subscriptionStatus = useAppSelector(selectSubscriptionStatus);
  const { data: products, isLoading: productsLoading } = useProducts();
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);

  const handleSelectPlan = async (productId: string, priceId?: string) => {
    if (!priceId) {
      toast.error("No price available for this product");
      return;
    }

    try {
      setLoadingCheckout(productId);
      toast.info("Creating checkout session...");
      const successUrl = `${window.location.origin}/subscription?checkout=success`;
      const response = await createCheckout(productId, successUrl);

      if (response.success && response.data?.checkoutUrl) {
        trackEvent('checkout_gate_start', 'engagement', productId);
        window.location.href = response.data.checkoutUrl;
      } else {
        toast.error(response.message || "Failed to create checkout session");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Checkout failed");
    } finally {
      setLoadingCheckout(null);
    }
  };

  const handleSync = async () => {
    toast.info("Syncing subscription...");
    try {
      await syncSubscription();
      toast.success("Subscription synced successfully");
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Sync failed");
    }
  };

  // Allow the subscription page to bypass the gate
  // This is critical for the checkout verification flow
  if (pathname === "/subscription") {
    return <>{children}</>;
  }

  // If still loading subscription status, show a loader
  if (isLoadingSubscription && !subscriptionStatus) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not subscribed, show the pricing gate
  if (!isSubscribed) {
    const sortedProducts = [...(products || [])].sort((a, b) => {
      const priceA = a.prices?.[0]?.priceAmount || 0;
      const priceB = b.prices?.[0]?.priceAmount || 0;
      return priceA - priceB;
    });

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background overflow-auto py-12 px-4">
        {/* Animated Background Pattern */}
        <DotPattern 
          className="opacity-40 [mask-image:radial-gradient(900px_circle_at_center,white,transparent)]" 
          glow
          width={32}
          height={32}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-7xl"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-neutral-600/30 mb-6">
              <IconSparkles size={14} className="text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Premium Access Required</span>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl mb-6 tracking-tight">
              Ready to <span className="italic text-primary">create?</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose a plan to unlock the full power of Butterfast and start designing stunning mobile apps today.
            </p>
            <button
              onClick={handleSync}
              className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <IconRefresh size={16} />
              Sync subscription
            </button>
          </div>

          {productsLoading ? (
            <div className="flex justify-center p-20">
              <IconLoader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex flex-col md:flex-row flex-wrap justify-center gap-8 items-stretch">
              {sortedProducts.map((product, index) => {
                const isPopular = product.name?.toLowerCase().includes("plus") || index === 1;
                return (
                  <div key={product.id} className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-2rem)] max-w-sm">
                    <PricingCard
                      product={{
                        ...product,
                        recurringInterval: product.recurringInterval || 'month'
                      }}
                      isPopular={isPopular}
                      isCurrentPlan={false}
                      index={index}
                      onSelect={handleSelectPlan}
                      loading={loadingCheckout === product.id}
                      cta={isPopular ? "Get Started Now" : "Get Started"}
                    />
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              All plans include professional design system exports and high-fidelity prototypes.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // User is subscribed, render the application
  return <>{children}</>;
}
