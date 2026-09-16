import { api } from "@/lib/api";
import type { ApiResponse } from "@/types";

export interface Price {
  id: string;
  productId?: string;
  amountType?: string; // fixed, custom, free, seat_based, metered_unit
  priceAmount?: number; // in cents
  priceCurrency?: string;
  metadata?: Record<string, any>;
}

export interface Benefit {
  id: string;
  type?: string;
  description?: string;
  selectable?: boolean;
  metadata?: Record<string, any>;
  properties?: Record<string, any>;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  isArchived?: boolean;
  recurringInterval?: string; // day, week, month, year
  recurringIntervalCount?: number;
  prices?: Price[];
  benefits?: Benefit[];
  metadata?: Record<string, any>;
  features?: string[]; // Extracted feature list from benefits and metadata
  createdAt?: string;
  updatedAt?: string;
  monthlyCreditLimit?: number;
}

// Get all products/pricing plans
export const getProducts = () => api.get<Product[]>("/subscription/products");

// Get product by ID
export const getProduct = (id: string) => api.get<Product>(`/subscription/products/${id}`);

// Format price for display
export const formatPrice = (price: Price): string => {
  if (price.amountType === "free") {
    return "Free";
  }
  
  if (price.amountType === "custom") {
    return "Pay what you want";
  }

  if (price.priceAmount) {
    const amount = price.priceAmount / 100; // Convert cents to dollars
    const currency = price.priceCurrency?.toUpperCase() || "USD";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  }

  return "Custom";
};

// Get recurring interval display text
export const getRecurringText = (product: Product): string => {
  if (!product.recurringInterval) {
    return "One-time";
  }

  const interval = product.recurringInterval;
  const count = product.recurringIntervalCount || 1;

  if (count === 1) {
    return `per ${interval}`;
  }

  return `every ${count} ${interval}s`;
};

// Create checkout session for a product
export const createCheckout = (
  productId: string,
  successUrl?: string
) => api.post<{ checkoutUrl: string; checkoutId: string }>("/subscription/checkout", {
  productId,
  successUrl,
});
