"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  useCancelSubscription,
  useVerifyCheckout,
} from "@/hooks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectSubscriptionStatus,
  selectCreditBalance,
  selectIsSubscribed,
  selectSubscriptionLoading,
  fetchSubscriptionInfo,
} from "@/store/slices/subscriptionSlice";
import { PageSkeleton, PageHeader } from "@/components/shared";
import { Skeleton, Button } from "@/components/ui";
import { trackEvent } from "@/components/analytics/trackEvent";

// Sub-components
import {
  CreditBalanceCard,
  PlanStatusCard,
  UsageStatsBar
} from "@/components/subscription";

export default function SubscriptionPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const subscriptionStatus = useAppSelector(selectSubscriptionStatus);
  const creditBalance = useAppSelector(selectCreditBalance);
  const isSubscribed = useAppSelector(selectIsSubscribed);
  const isLoading = useAppSelector(selectSubscriptionLoading);

  const cancelMutation = useCancelSubscription();
  const verifyCheckoutMutation = useVerifyCheckout();

  const [isVerifying, setIsVerifying] = useState(false);
  const hasVerified = React.useRef(false);

  // Handle checkout success - verify and sync subscription immediately
  useEffect(() => {
    const checkoutStatus = searchParams.get("checkout");
    const customerSessionToken = searchParams.get("customer_session_token");

    if (checkoutStatus === "success" && !hasVerified.current) {
      hasVerified.current = true; // Mark as started immediately
      setIsVerifying(true);
      
      const verify = async () => {
        try {
          // Immediately verify the checkout and sync subscription
          await verifyCheckoutMutation.mutateAsync(customerSessionToken || undefined);
          trackEvent('checkout_success', 'engagement', 'subscription');
        } catch (error) {
          console.error("Checkout verification failed", error);
        } finally {
          setIsVerifying(false);
          // Clean up the URL (remove query params) content-preservingly
          // using history API avoids Next.js router re-renders/race conditions
          const url = new URL(window.location.href);
          url.searchParams.delete("checkout");
          url.searchParams.delete("customer_session_token");
          window.history.replaceState({}, "", url.toString());
        }
      };

      verify();
    }
  }, [searchParams, verifyCheckoutMutation]);

  const handleCancel = () => {
    trackEvent('subscription_cancel_click', 'engagement', 'subscription');
    cancelMutation.mutate(undefined, {
      onSuccess: () => {
        trackEvent('subscription_cancel_success', 'engagement', 'subscription');
      },
    });
  };

  // Show verifying state when processing checkout
  if (isVerifying) {
    return (
      <div className="relative flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-16 w-full">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <h2 className="text-xl font-semibold">Activating your subscription...</h2>
          <p className="text-muted-foreground">This will only take a moment.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="relative flex-1 flex flex-col items-center min-h-[calc(100vh-80px)] px-4 py-16 w-full">
        <div className="relative z-10 w-full max-w-7xl">
          <PageSkeleton>
            <Skeleton className="h-12 w-1/3 rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Skeleton className="h-64 rounded-[32px] border border-secondary/10 shadow-sm" />
              <Skeleton className="h-64 rounded-[32px] border border-secondary/10 shadow-sm" />
            </div>
            <Skeleton className="h-12 w-full rounded-2xl" />
          </PageSkeleton>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 flex flex-col items-center min-h-[calc(100vh-80px)] overflow-y-auto px-4 py-8 ">
      <div className="relative z-10 w-full max-w-7xl flex flex-col gap-4">
        <PageHeader
          title={<>Subscription & <span className="text-primary italic">Billing</span></>}
          subtitle="Manage your plan and usage."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CreditBalanceCard
            balance={creditBalance?.balance || 0}
            quota={creditBalance?.quota || 0}
          />
          <PlanStatusCard
            subscription={subscriptionStatus?.subscription}
            features={subscriptionStatus?.features}
            isActive={isSubscribed}
            onCancel={handleCancel}
            isCanceling={cancelMutation.isPending}
          />
        </div>

        <UsageStatsBar
          usedCredits={creditBalance?.usedCredits || 0}
          balance={creditBalance?.balance || 0}
          quota={creditBalance?.quota || 0}
          lastResetAt={creditBalance?.lastResetAt}
        />
      </div>
    </div>
  );
}
