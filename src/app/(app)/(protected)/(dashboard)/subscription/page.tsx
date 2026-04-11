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
} from "@/store/slices/subscriptionSlice";
import { PageSkeleton, PageHeader } from "@/components/shared";
import { Skeleton, Button } from "@/components/ui";
import { trackEvent } from "@/components/analytics/trackEvent";
import { IconPlus } from "@tabler/icons-react";

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

  useEffect(() => {
    const checkoutStatus = searchParams.get("checkout");
    const customerSessionToken = searchParams.get("customer_session_token");

    if (checkoutStatus === "success" && !hasVerified.current) {
      hasVerified.current = true;
      setIsVerifying(true);
      
      const verify = async () => {
        try {
          await verifyCheckoutMutation.mutateAsync(customerSessionToken || undefined);
          trackEvent('checkout_success', 'engagement', 'subscription');
        } catch (error) {
          console.error("Checkout verification failed", error);
        } finally {
          setIsVerifying(false);
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

  if (isVerifying) {
    return (
      <div className="relative flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-16 w-full bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border border-border border-t-foreground mx-auto" />
          <h2 className="font-mono text-xl text-foreground">Activating your subscription...</h2>
          <p className="font-sans text-muted-foreground">This will only take a moment.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="relative flex-1 flex flex-col items-center min-h-[calc(100vh-80px)] px-4 py-16 w-full bg-background">
        <div className="relative z-10 w-full max-w-7xl">
          <PageSkeleton>
            <Skeleton className="h-12 w-1/3 border border-border" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Skeleton className="h-64 border border-border" />
              <Skeleton className="h-64 border border-border" />
            </div>
            <Skeleton className="h-12 w-full border border-border" />
          </PageSkeleton>
        </div>
      </div>
    );
  }

  return (
      <div className="relative flex-1 flex flex-col items-center min-h-[calc(100vh-80px)] overflow-y-auto px-6 py-12 lg:py-20 bg-background">
      <div className="relative z-10 w-full max-w-5xl flex flex-col gap-12">
        <PageHeader
          title={
            <>Subscription & Billing</>
          }
          subtitle="View and manage your plan, usage, and billing history."
          action={
            <Button
              onClick={() => router.push("/home")}
              className="font-mono"
            >
              <IconPlus size={18} className="mr-2" />
              New Design
            </Button>
          }
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
