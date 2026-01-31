"use client";

import React from "react";
import { motion } from "framer-motion";
import { IconCreditCard, IconSparkles } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/components/analytics/trackEvent";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface PlanStatusCardProps {
  subscription: any;
  features: any;
  isActive: boolean;
  onCancel: () => void;
  isCanceling: boolean;
}

const getStatusBadge = (status: string) => {
  const configs: Record<string, { label: string; class: string }> = {
    active: { label: "Active", class: "bg-green-500/10 text-green-600 border-green-500/20" },
    trialing: { label: "Trialing", class: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
    canceled: { label: "Canceled", class: "bg-red-500/10 text-red-600 border-red-500/20" },
    past_due: { label: "Past Due", class: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  };

  const config = configs[status] || { label: status, class: "bg-muted text-muted-foreground border-border" };

  return (
    <div className={cn("px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border", config.class)}>
      {config.label}
    </div>
  );
};

export const PlanStatusCard: React.FC<PlanStatusCardProps> = ({
  subscription,
  features,
  isActive,
  onCancel,
  isCanceling,
}) => {
  if (!subscription) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="relative flex flex-col p-6 rounded-2xl overflow-hidden group bg-card border border-border shadow-sm hover:shadow-depth-3 transition-all duration-300"
      >
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
            <IconCreditCard size={24} className="text-muted-foreground/50" />
          </div>
          <p className="text-lg font-bold text-foreground tracking-tight">No active membership</p>
          <p className="text-sm text-muted-foreground/70 mt-1.5 max-w-[200px] leading-relaxed">
            Unlock pro features and more credits today.
          </p>
          <Button 
            onClick={() => {
              trackEvent('nav_pricing_click', 'engagement', 'subscription_empty');
              window.location.href = "/pricing";
            }} 
            className="mt-4 rounded-xl h-10 px-5 font-semibold shadow-coral-glow hover:scale-105 transition-transform"
          >
            Explore Plans
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="relative flex flex-col p-6 rounded-2xl overflow-hidden group bg-white/40 border border-secondary/20 shadow-sm hover:shadow-depth-3 hover:bg-white transition-all duration-300"
    >
      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-600">
            <IconCreditCard size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">Plan Status</h2>
            <p className="text-xs text-primary font-semibold mt-0.5">
              {features?.metadata?.plan_name || features?.productName}
            </p>
          </div>
        </div>
        {getStatusBadge(subscription.status)}
      </div>

      <div className="relative z-10 flex-1 space-y-4">
        {features?.features && features.features.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">Plan Features</p>
            <div className="space-y-1.5">
              {features.features.slice(0, 4).map((feature: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-foreground/80">
                  <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <IconSparkles size={10} className="text-primary" />
                  </div>
                  <span className="font-medium text-xs">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Next Renewal</p>
          <div className="text-base font-bold text-foreground">
            {subscription.currentPeriodEnd
              ? new Date(subscription.currentPeriodEnd).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
              : "N/A"}
          </div>
        </div>

        <div className="pt-2 mt-auto">
          {subscription.cancelAtPeriodEnd ? (
            <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
              <p className="text-sm font-bold text-orange-700">Scheduled Termination</p>
              <p className="text-xs text-orange-700/70 mt-0.5 font-medium leading-relaxed">Access remains active until the current period expires.</p>
            </div>
          ) : isActive ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="text-red-500 hover:text-red-600 h-9 px-3 text-sm hover:bg-destructive/10 rounded-lg">Cancel Subscription</Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl border border-border shadow-2xl bg-card backdrop-blur-3xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-bold tracking-tight">Cancel Subscription?</AlertDialogTitle>
                  <AlertDialogDescription className="text-sm font-medium text-muted-foreground/80 leading-relaxed">
                    Your access will continue until the end of your current billing period. Are you sure you want to stop building amazing docs?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2 mt-4">
                  <AlertDialogCancel className="rounded-xl">Keep Plan</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => {
                      trackEvent('subscription_cancel_confirm', 'engagement', 'subscription_card');
                      onCancel();
                    }} 
                    disabled={isCanceling} 
                    className="rounded-xl bg-red-500 hover:bg-red-600"
                  >
                    {isCanceling ? "Ending..." : "Confirm Cancellation"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
};
