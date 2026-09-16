import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSubscriptionStatus,
  cancelSubscription,
  getCreditBalance,
  getPlanTiers,
  useCredits,
  verifyCheckout,
  type UseCreditsDto,
  type SubscriptionStatus,
  type CreditBalance,
  type Subscription,
  type PlanTiersResponse,
} from "@/services/subscription";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import {
  fetchCreditBalance,
  fetchSubscriptionInfo,
  setSubscriptionStatus,
  setCreditBalance,
} from "@/store/slices/subscriptionSlice";

// Query keys
export const subscriptionKeys = {
  all: ["subscription"] as const,
  status: () => [...subscriptionKeys.all, "status"] as const,
  credits: () => [...subscriptionKeys.all, "credits"] as const,
  planTiers: () => [...subscriptionKeys.all, "plan-tiers"] as const,
};

// Get subscription status
export const useSubscriptionStatus = () => {
  return useQuery({
    queryKey: subscriptionKeys.status(),
    queryFn: async () => {
      const response = await getSubscriptionStatus();
      return response.data;
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });
};

// Cancel subscription
export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelSubscription,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
      toast.success("Subscription canceled successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to cancel subscription"
      );
    },
  });
};

// Get credit balance
export const useCreditBalance = () => {
  return useQuery({
    queryKey: subscriptionKeys.credits(),
    queryFn: async () => {
      const response = await getCreditBalance();
      return response.data;
    },
    staleTime: 10000, // 10 seconds
    refetchOnWindowFocus: true,
  });
};



// Get plan tiers for UI (cached longer since tiers rarely change)
export const usePlanTiers = () => {
  return useQuery({
    queryKey: subscriptionKeys.planTiers(),
    queryFn: async () => {
      const response = await getPlanTiers();
      return response.data;
    },
    staleTime: 300000, // 5 minutes - tiers rarely change
    refetchOnWindowFocus: false, // Don't refetch on focus
  });
};

// Use credits
export const useUseCredits = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (payload: UseCreditsDto) => useCredits(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.credits() });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.status() });
      // Update credit balance in Redux
      dispatch(fetchCreditBalance());
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to use credits"
      );
    },
  });
};

// Verify checkout and sync subscription (for instant feedback after payment)
export const useVerifyCheckout = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (customerSessionToken?: string) => verifyCheckout(customerSessionToken),
    onSuccess: (response) => {
      const newStatus = response.data;
      
      // 1. Update React Query Cache immediately
      queryClient.setQueryData(subscriptionKeys.status(), newStatus);

      if (newStatus.creditBalance) {
        queryClient.setQueryData(
          subscriptionKeys.credits(),
          newStatus.creditBalance
        );
      }

      // 2. Invalidate status and plan tiers to refetch with new subscription data
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.status() });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.planTiers() });

      // 3. Update Redux Store synchronously (avoids extra API calls)
      dispatch(setSubscriptionStatus(newStatus));
      if (newStatus.creditBalance) {
        dispatch(setCreditBalance(newStatus.creditBalance));
      }
      
      toast.success("Subscription activated successfully!");
    },
    onError: (error: any) => {
      // Don't show error toast here - it might just mean the webhook hasn't arrived yet
      console.error("Checkout verification failed:", error);
    },
  });
};
