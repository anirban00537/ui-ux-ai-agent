"use client";

import React, { useState } from "react";
import { useProducts } from "@/hooks";
import { useAppSelector } from "@/store/hooks";
import { selectSubscriptionStatus } from "@/store/slices/subscriptionSlice";
import { createCheckout } from "@/services";
import { PricingCard } from "@/components/pricing-card";
import { PageSkeleton } from "@/components/shared";
import { Skeleton } from "@/components/ui";
import { trackEvent } from "@/components/analytics/trackEvent";
import { toast } from "sonner";

// Sub-components
import { PricingHeader, PricingFooter } from "@/components/pricing";

export default function PricingPage() {
  const { data: products, isLoading: productsLoading } = useProducts();
  const subscriptionStatus = useAppSelector(selectSubscriptionStatus);
  const currentSubscription = subscriptionStatus?.subscription;
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);



  const handleSelectPlan = async (productId: string, priceId?: string) => {
    if (!priceId) {
      trackEvent('plan_select_fail', 'engagement', 'no_price_id');
      toast.error("No price available for this product");
      return;
    }

    trackEvent('plan_select_start', 'engagement', productId);

    try {
      setLoadingCheckout(productId);
      toast.info("Creating checkout session...");
      const successUrl = `${window.location.origin}/subscription?checkout=success`;
      const response = await createCheckout(productId, successUrl);

      if (response.success && response.data?.checkoutUrl) {
        trackEvent('checkout_session_success', 'engagement', productId);
        window.location.href = response.data.checkoutUrl;
      } else {
        const errorMessage = response.message || "Failed to create checkout session";
        trackEvent('checkout_session_fail', 'engagement', errorMessage);
        if (errorMessage.toLowerCase().includes("already have an active subscription")) {
          toast.error(errorMessage, {
            action: { label: "Manage Subscription", onClick: () => {
              trackEvent('already_subscribed_manage_click', 'engagement', 'pricing_page');
              window.location.href = "/subscription";
            } },
          });
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to create checkout session";
      trackEvent('checkout_session_error', 'engagement', errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoadingCheckout(null);
    }
  };

  if (productsLoading) {
    return (
      <div className="relative flex-1 min-h-screen overflow-auto bg-background">
        <div className="flex flex-col items-center px-4 py-16 w-full min-h-full">
          <div className="w-full max-w-7xl">
            <PageSkeleton>
              <Skeleton className="h-12 w-1/3 mx-auto rounded-2xl border border-border" />
              <div className="flex flex-col md:flex-row flex-wrap justify-center gap-8 w-full pt-10">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[500px] w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-2rem)] max-w-sm rounded-3xl border border-border" />
                ))}
              </div>
            </PageSkeleton>
          </div>
        </div>
      </div>
    );
  }

  const hasAccess = subscriptionStatus?.hasAccess || false;
  const isSubscriptionActive = subscriptionStatus?.isActive || false;
  const isCanceled = currentSubscription?.status === "canceled" || currentSubscription?.cancelAtPeriodEnd || false;

  const availableProducts = products?.filter((p) => !p.isArchived) || [];
  const sortedProducts = [...availableProducts].sort((a, b) => {
    const priceA = a.prices?.[0]?.priceAmount || 0;
    const priceB = b.prices?.[0]?.priceAmount || 0;
    return priceA - priceB;
  });

  return (
    <div className="relative flex-1 min-h-screen">
      <div className="flex flex-col items-center px-4 py-16 min-h-full w-full">
        <div className="w-full mt-16 max-w-7xl flex flex-col gap-16">
          <PricingHeader />

          <div className="flex flex-col md:flex-row flex-wrap justify-center gap-8 items-stretch pt-8">
            {sortedProducts.map((product, index) => {
              const isCurrentPlan = hasAccess && currentSubscription?.productId === product.id;
              const isPopular = index === 1;
              const hasBlockingSubscription = isSubscriptionActive && !isCanceled;

              return (
                <div key={product.id} className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-2rem)] max-w-sm">
                  <PricingCard
                    product={product}
                    isPopular={isPopular}
                    isCurrentPlan={false}
                    isCanceled={false}
                    index={index}
                    onSelect={handleSelectPlan}
                    loading={loadingCheckout === product.id}
                    href={undefined}
                    cta={undefined}
                  />
                </div>
              );
            })}
          </div>

          <PricingFooter />
        </div>
      </div>
    </div>
  );
}
