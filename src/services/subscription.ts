import { api } from "@/lib/api";

export interface SubscriptionStatus {
  isActive: boolean;
  hasAccess: boolean; // For legacy or feature-based access
  status: string;
  planId: string;
  subscription?: Subscription | null;
  features?: {
    maxCards: number;
    hasWatermark: boolean;
    isPremium: boolean;
    productName?: string;
  } | null;
  creditBalance?: CreditBalance | null;
  slideLimit: number;
  storageLimit: number;
  storageUsage: number;
  planName: string;
}

export interface Subscription {
  id: string;
  userId: string;
  status: string;
  priceId?: string;
  productId?: string;
  currentPeriodStart?: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreditBalance {
  balance: number;
  quota: number;
  usedCredits: number;
  lastResetAt: string;
}

export interface UseCreditsDto {
  amount: number;
  reason?: string;
}



export interface PlanTier {
  name: string;
  planName: string;
  slideLimit: number;
}

export interface PlanTiersResponse {
  tiers: PlanTier[];
  freeTier: PlanTier;
}

export const getSubscriptionStatus = () => api.get<SubscriptionStatus>("/subscription/status");
export const getCreditBalance = () => api.get<CreditBalance>("/subscription/credits");

export const getPlanTiers = () => api.get<PlanTiersResponse>("/subscription/plan-tiers");
export const useCredits = (payload: UseCreditsDto) => api.post<CreditBalance>("/subscription/use-credits", payload);
export const cancelSubscription = () => api.post<void>("/subscription/cancel");
export const verifyCheckout = (customerSessionToken?: string) =>
  api.post<SubscriptionStatus>("/subscription/verify-checkout", { customerSessionToken });
export const syncSubscription = () => api.get<SubscriptionStatus>("/subscription/sync");

