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
    active: { label: "Active", class: "bg-accent text-foreground border-border" },
    trialing: { label: "Trialing", class: "bg-accent text-foreground border-border" },
    canceled: { label: "Canceled", class: "bg-accent text-muted-foreground border-border" },
    past_due: { label: "Past Due", class: "bg-accent text-foreground border-border" },
  };

  const config = configs[status] || { label: status, class: "bg-accent text-muted-foreground border-border" };

  return (
    <div className={cn("px-4 py-1.5 font-mono text-[10px] uppercase tracking-[1.4px] border backdrop-blur-md", config.class)}>
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
        className="relative flex flex-col p-8 border border-border bg-card transition-colors duration-500 hover:border-border-strong"
      >
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-20 h-20 border border-border flex items-center justify-center mb-8 text-foreground">
            <IconCreditCard size={40} />
          </div>
          <h2 className="font-mono text-3xl text-foreground tracking-tight">No active membership</h2>
          <p className="font-sans text-base text-muted-foreground mt-4 max-w-[280px] leading-relaxed">
            Unlock pro features and skyrocket your design productivity today.
          </p>
          <Button 
            onClick={() => {
              trackEvent('nav_pricing_click', 'engagement', 'subscription_empty');
              window.location.href = "/pricing";
            }} 
            className="mt-10 font-mono"
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
      className="relative flex flex-col p-8 border border-border bg-card transition-colors duration-500 hover:border-border-strong"
    >
      <div className="relative z-10 flex items-center justify-between mb-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 border border-border flex items-center justify-center text-foreground">
            <IconCreditCard size={28} />
          </div>
          <div>
            <h2 className="font-mono text-3xl text-foreground tracking-tight">Plan Status</h2>
            <p className="font-mono text-[10px] uppercase tracking-[1.4px] text-muted-foreground mt-0.5">
              {features?.metadata?.plan_name || features?.productName}
            </p>
          </div>
        </div>
        {getStatusBadge(subscription.status)}
      </div>

      <div className="relative z-10 flex-1 space-y-8">
        {features?.features && features.features.length > 0 && (
          <div className="p-6 border border-border">
            <p className="font-mono text-[10px] uppercase tracking-[1.4px] text-muted-foreground mb-5">Plan Capabilities</p>
            <div className="grid grid-cols-1 gap-4">
              {features.features.slice(0, 4).map((feature: string, idx: number) => (
                <div key={idx} className="flex items-center gap-4 font-sans text-sm text-muted-foreground">
                  <div className="w-6 h-6 border border-border flex items-center justify-center shrink-0">
                    <IconSparkles size={12} className="text-foreground" />
                  </div>
                  <span className="text-sm tracking-tight">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-2">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[1.4px] text-muted-foreground mb-1.5">Next Renewal</p>
            <div className="font-sans text-xl text-foreground tabular-nums tracking-tight">
              {subscription.currentPeriodEnd
                ? new Date(subscription.currentPeriodEnd).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
                : "N/A"}
            </div>
          </div>
          <div className="h-12 w-px bg-border" />
          <div className="text-right">
             <p className="font-mono text-[10px] uppercase tracking-[1.4px] text-muted-foreground mb-1.5">Billing Type</p>
             <div className="font-sans text-xl text-foreground tracking-tight">
               Monthly
             </div>
          </div>
        </div>

        <div className="pt-4 mt-auto">
          {subscription.cancelAtPeriodEnd ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 border border-border bg-card"
            >
              <p className="font-sans text-sm text-foreground">Scheduled Termination</p>
              <p className="font-sans text-xs text-muted-foreground mt-1 leading-relaxed">Access remains active until the current period expires. We&apos;d love to have you back!</p>
            </motion.div>
          ) : isActive ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="font-mono text-xs text-muted-foreground/30 hover:text-foreground h-10 px-4 hover:bg-muted border border-transparent hover:border-border">Cancel Membership</Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border border-border bg-popover p-8 max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-mono text-2xl text-foreground tracking-tight">Time to part ways?</AlertDialogTitle>
                  <AlertDialogDescription className="font-sans text-base text-muted-foreground mt-4 leading-relaxed">
                    Your premium access will continue until the end of your current cycle. We&apos;d hate to see you stop building amazing mobile experiences.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-3 mt-8">
                  <AlertDialogCancel className="font-mono h-12 px-6 border border-border hover:bg-accent">Keep Plan</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => {
                      trackEvent('subscription_cancel_confirm', 'engagement', 'subscription_card');
                      onCancel();
                    }} 
                    disabled={isCanceling} 
                    className="font-mono h-12 px-6 bg-red-500 hover:bg-red-600 text-white"
                  >
                    {isCanceling ? "Processing..." : "Confirm Cancellation"}
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
