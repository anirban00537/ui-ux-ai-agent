"use client";

import { useQuery } from "@tanstack/react-query";
import { getCreditBalance } from "@/services/subscription";

interface CreditBalanceDisplay {
  remainingCredits: number;
  usagePercentage: number;
}

interface UseCreditBalanceResult {
  balance: CreditBalanceDisplay | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  isRefetching: boolean;
}

export function useCreditBalance(): UseCreditBalanceResult {
  const {
    data,
    isLoading: loading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["creditBalance"],
    queryFn: async () => {
      const response = await getCreditBalance();
      const bal = response?.data;
      if (!bal) throw new Error("Failed to fetch credit balance");
      const quota = bal.quota || 1;
      return {
        remainingCredits: bal.balance,
        usagePercentage: quota > 0 ? (bal.usedCredits / quota) * 100 : 0,
      };
    },
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  return {
    balance: data || null,
    loading,
    error: error as Error | null,
    refetch,
    isRefetching,
  };
}
