"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { IconSparkles, IconCheck } from "@tabler/icons-react";
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

  const targetHref = onSelect
    ? undefined
    : isAuthenticated
      ? "/subscription"
      : href;

  const primaryPrice = product.prices?.[0];

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
        "relative p-8 transition-all duration-500 border",
        isPopular
          ? "border-white bg-white/[0.05] md:scale-105 z-10"
          : "border-white/10 bg-white/[0.03] hover:border-white/20",
        className
      )}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 border border-white/20 font-mono text-xs uppercase tracking-[1.4px] flex items-center gap-1">
          <IconSparkles size={12} />
          Most Popular
        </div>
      )}

      <div className="flex flex-col h-full">
        <div className="mb-8">
          <h3 className="font-sans text-2xl text-white mb-2">
            {product.name}
          </h3>
          {product.description && (
            <p className="font-sans text-sm text-white/70 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        <div className="flex items-baseline gap-1 mb-8">
          {primaryPrice ? (
            <>
              <span className="font-mono text-4xl text-white tracking-tight">
                {formatPrice(primaryPrice)}
              </span>
              {product.recurringInterval && (
                <span className="font-sans text-white/50 text-sm">
                  /{product.recurringInterval}
                </span>
              )}
            </>
          ) : (
            <span className="font-mono text-2xl text-white">Custom</span>
          )}
        </div>

        <div className="flex-1 mb-8">
          {features && features.length > 0 ? (
            <ul className="space-y-4">
              {features.map((feature: string, idx: number) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 font-sans text-sm text-white/70"
                >
                  <span className="mt-0.5 flex items-center justify-center w-5 h-5 border border-white/20 shrink-0">
                    <IconCheck size={12} strokeWidth={3} />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-sans text-sm text-white/30 italic">
              No features listed
            </p>
          )}
        </div>

        <div className="mt-auto">
          {targetHref ? (
            <Button
              asChild
              variant={isPopular ? "default" : "outline"}
              className="w-full font-mono"
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
              className="w-full font-mono"
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
