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
    active: { label: "Active", class: "bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.15)]" },
    trialing: { label: "Trialing", class: "bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]" },
    canceled: { label: "Canceled", class: "bg-red-500/10 text-red-500 border-red-500/20" },
    past_due: { label: "Past Due", class: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  };

  const config = configs[status] || { label: status, class: "bg-muted text-muted-foreground border-border" };

  return (
    <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border backdrop-blur-md", config.class)}>
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
        className="relative flex flex-col p-8 rounded-[32px] overflow-hidden group bg-card border border-border/50 shadow-2xl ring-1 ring-white/5 transition-all duration-300"
      >
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-6 ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-500">
            <IconCreditCard size={32} className="text-muted-foreground/30" />
          </div>
          <p className="text-2xl font-black text-foreground tracking-tighter uppercase italic">No active membership</p>
          <p className="text-sm text-muted-foreground/60 mt-3 max-w-[240px] leading-relaxed font-medium">
            Unlock pro features and skyrocket your design productivity today.
          </p>
          <Button 
            onClick={() => {
              trackEvent('nav_pricing_click', 'engagement', 'subscription_empty');
              window.location.href = "/pricing";
            }} 
            className="mt-8 rounded-2xl h-12 px-8 font-black uppercase tracking-widest bg-primary text-white hover:bg-primary/90 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all active:scale-95"
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
      className="relative flex flex-col p-8 rounded-[32px] overflow-hidden group bg-card border border-border/50 shadow-2xl ring-1 ring-white/5 transition-all duration-300"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors duration-500" />

      <div className="relative z-10 flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary/10 text-primary ring-1 ring-primary/20">
            <IconCreditCard size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tighter uppercase italic line-height-none">Plan Status</h2>
            <p className="text-xs text-primary font-black mt-1 uppercase tracking-[0.1em]">
              {features?.metadata?.plan_name || features?.productName}
            </p>
          </div>
        </div>
        {getStatusBadge(subscription.status)}
      </div>

      <div className="relative z-10 flex-1 space-y-6">
        {features?.features && features.features.length > 0 && (
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">Plan Features</p>
            <div className="grid grid-cols-1 gap-2.5">
              {features.features.slice(0, 4).map((feature: string, idx: number) => (
                <div key={idx} className="flex items-center gap-3 text-sm text-foreground/80 group/feat transition-colors">
                  <div className="w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 ring-1 ring-primary/20 group-hover/feat:bg-primary/20 transition-colors">
                    <IconSparkles size={11} className="text-primary" />
                  </div>
                  <span className="font-bold text-xs tracking-tight text-foreground/70 group-hover/feat:text-foreground transition-colors">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1.5">Next Renewal</p>
          <div className="text-xl font-black text-foreground tracking-tight">
            {subscription.currentPeriodEnd
              ? new Date(subscription.currentPeriodEnd).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
              : "N/A"}
          </div>
        </div>

        <div className="pt-4 mt-auto">
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
                    Your access will continue until the end of your current billing period. Are you sure you want to stop building amazing designs?
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
