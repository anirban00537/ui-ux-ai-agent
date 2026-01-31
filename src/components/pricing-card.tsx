"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { IconSparkles, IconCheck, IconRocket } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { formatPrice, type Product, type Price } from "@/services/pricing";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated } from "@/store/slices/userSlice";
import { trackEvent } from "@/components/analytics/trackEvent";

interface PricingCardProps {
  product: {
    id?: string;
    name: string;
    description?: string | null;
    prices?: Price[];
    recurringInterval?: string;
    monthlyCreditLimit?: number;
    features?: string[];
    benefits?: Array<{ description?: string }>;
    metadata?: Record<string, any>;
  };
  isPopular?: boolean;
  isCurrentPlan?: boolean;
  isCanceled?: boolean;
  index?: number;
  onSelect?: (productId: string, priceId?: string) => void;
  href?: string;
  cta?: string;
  loading?: boolean;
  className?: string;
}

export function PricingCard({
  product,
  isPopular = false,
  isCurrentPlan = false,
  isCanceled = false,
  index = 0,
  onSelect,
  href,
  cta,
  loading = false,
  className,
}: PricingCardProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Only use href redirect if href is explicitly passed AND no onSelect handler is provided
  // This ensures checkout flow works when onSelect is passed (dashboard pricing page)
  const targetHref = onSelect
    ? undefined
    : isAuthenticated
    ? "/subscription"
    : href;

  const primaryPrice = product.prices?.[0];

  // Get features from product.features (extracted from feature_1, feature_2, feature_3, etc. metadata keys)
  // Fallback to benefits if features array is not available
  const features =
    product.features && product.features.length > 0
      ? product.features
      : (product.benefits
          ?.map((b) => b.description)
          .filter(Boolean) as string[]) || [];

  const handleClick = () => {
    trackEvent('plan_selection_click', 'engagement', product.name);
    if (isCurrentPlan) {
      window.location.href = "/subscription";
      return;
    }
    if (onSelect && product.id) {
      onSelect(product.id, primaryPrice?.id);
    }
  };

  const cardContent = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
      className={cn(
        "relative rounded-3xl p-8 transition-all duration-300 transform",
        isPopular
          ? "bg-card shadow-depth-3 border border-border md:scale-105 z-10"
          : "bg-card/80 border border-border shadow-sm hover:shadow-md hover:bg-card",
        className
      )}
    >
      {/* Pro Glow Effect */}
      {isPopular && (
        <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-b from-primary/20 via-secondary/20 to-transparent blur-xl opacity-60" />
      )}

      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-coral-glow flex items-center gap-1">
          <IconSparkles size={12} fill="currentColor" />
          Most Popular
        </div>
      )}

      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="mb-8">
          <h3 className="font-serif text-2xl text-foreground mb-2">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-sm text-muted-foreground min-h-[40px] leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-1 mb-8">
          {primaryPrice ? (
            <>
              <span className="text-4xl font-bold text-foreground tracking-tight">
                {formatPrice(primaryPrice)}
              </span>
              {product.recurringInterval && (
                <span className="text-muted-foreground text-sm">
                  /{product.recurringInterval}
                </span>
              )}
            </>
          ) : (
            <span className="text-2xl font-bold">Custom</span>
          )}
        </div>

        {/* Features List */}
        <div className="flex-1 mb-8">
          {features && features.length > 0 ? (
            <ul className="space-y-4">
              {features.map((feature: string, idx: number) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 text-sm text-foreground/80"
                >
                  <span className="mt-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-secondary/30 text-secondary-foreground shrink-0">
                    <IconCheck size={12} strokeWidth={3} />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground/50 italic">
              No features listed
            </p>
          )}
        </div>

        {/* CTA Button */}
        <div className="mt-auto">
          {targetHref ? (
            <Button
              asChild
              variant={isPopular ? "default" : "outline"}
              className={cn(
                "w-full h-12 rounded-full text-base transition-all",
                isPopular
                  ? "bg-primary hover:bg-primary/90 text-white shadow-coral-glow"
                  : "border-secondary/20 hover:bg-secondary/10 text-foreground"
              )}
            >
              <Link 
                href={targetHref || "#"}
                onClick={() => trackEvent('plan_selection_click', 'engagement', product.name)}
              >
                {cta || "Get Started"}
              </Link>
            </Button>
          ) : (
            <Button
              onClick={handleClick}
              disabled={
                (isCurrentPlan && !isCanceled) || loading || !primaryPrice
              }
              variant={isPopular ? "default" : "outline"}
              className={cn(
                "w-full h-12 rounded-full text-base transition-all",
                isCurrentPlan && !isCanceled
                  ? "bg-secondary/20 text-secondary-foreground cursor-not-allowed hover:bg-secondary/20 border-transparent"
                  : isPopular
                  ? "bg-primary hover:bg-primary/90 text-white shadow-coral-glow"
                  : "border-secondary/20 hover:bg-secondary/10 text-foreground"
              )}
            >
              {loading
                ? "Loading..."
                : isCurrentPlan
                ? isCanceled
                  ? cta || "Renew Plan"
                  : "Current Plan"
                : primaryPrice
                ? cta || `Choose ${product.name}`
                : "Contact for Quote"}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );

  return cardContent;
}
