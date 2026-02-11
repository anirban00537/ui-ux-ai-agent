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
      className="relative flex flex-col p-8 rounded-[40px] overflow-hidden group bg-white/[0.02] backdrop-blur-xl border-3d shadow-2xl transition-all duration-500 hover:bg-white/[0.04]"
    >
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-20 h-20 rounded-[28px] bg-primary/10 flex items-center justify-center mb-8 border border-primary/20 shadow-[0_0_30px_rgba(30,157,241,0.2)] group-hover:scale-110 transition-transform duration-700">
          <IconCreditCard size={40} className="text-primary" />
        </div>
        <h2 className="text-3xl font-serif font-medium text-foreground tracking-tight italic">No active membership</h2>
        <p className="text-base text-muted-foreground/60 mt-4 max-w-[280px] leading-relaxed font-light">
          Unlock pro features and skyrocket your design productivity today.
        </p>
        <Button 
          onClick={() => {
            trackEvent('nav_pricing_click', 'engagement', 'subscription_empty');
            window.location.href = "/pricing";
          }} 
          className="mt-10 rounded-full h-14 px-10 font-bold text-lg bg-primary text-white hover:bg-primary/90 shadow-coral-glow transition-all hover:scale-105 active:scale-95"
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
    className="relative flex flex-col p-8 rounded-[40px] overflow-hidden group bg-white/[0.02] backdrop-blur-xl border-3d shadow-2xl transition-all duration-500 hover:bg-white/[0.04]"
  >
    {/* Background Ambient Glows */}
    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32 group-hover:bg-primary/20 transition-all duration-700" />
    <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/5 blur-[80px] rounded-full -ml-24 -mb-24 group-hover:bg-indigo-500/10 transition-all duration-700" />

    <div className="relative z-10 flex items-center justify-between mb-10">
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(30,157,241,0.2)] group-hover:scale-110 transition-transform duration-500">
          <IconCreditCard size={28} />
        </div>
        <div>
          <h2 className="text-3xl font-serif font-medium text-foreground tracking-tight italic line-height-none">Plan Status</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mt-0.5">
            {features?.metadata?.plan_name || features?.productName}
          </p>
        </div>
      </div>
      {getStatusBadge(subscription.status)}
    </div>

    <div className="relative z-10 flex-1 space-y-8">
      {features?.features && features.features.length > 0 && (
        <div className="p-6 rounded-[24px] bg-black/20 border-3d backdrop-blur-md">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-5">Plan Capabilities</p>
          <div className="grid grid-cols-1 gap-4">
            {features.features.slice(0, 4).map((feature: string, idx: number) => (
              <div key={idx} className="flex items-center gap-4 text-sm text-foreground/80 group/feat transition-colors">
                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-[0_0_10px_rgba(30,157,241,0.1)] group-hover/feat:bg-primary/20 transition-colors">
                  <IconSparkles size={12} className="text-primary" />
                </div>
                <span className="font-medium text-sm tracking-tight text-foreground/70 group-hover/feat:text-foreground transition-colors">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-1.5">Next Renewal</p>
          <div className="text-xl font-bold text-foreground tabular-nums tracking-tight">
            {subscription.currentPeriodEnd
              ? new Date(subscription.currentPeriodEnd).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
              : "N/A"}
          </div>
        </div>
        <div className="h-12 w-px bg-white/5" />
        <div className="text-right">
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-1.5">Billing Type</p>
           <div className="text-xl font-bold text-foreground tracking-tight">
              Monthly
           </div>
        </div>
      </div>

      <div className="pt-4 mt-auto">
        {subscription.cancelAtPeriodEnd ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 rounded-2xl border border-orange-500/20 bg-orange-500/5 backdrop-blur-sm"
          >
            <p className="text-sm font-bold text-orange-400">Scheduled Termination</p>
            <p className="text-xs text-orange-400/60 mt-1 font-medium leading-relaxed">Access remains active until the current period expires. We'd love to have you back!</p>
          </motion.div>
        ) : isActive ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="text-muted-foreground/40 hover:text-red-500 h-10 px-4 text-xs hover:bg-red-500/5 rounded-full transition-all border border-transparent hover:border-red-500/20">Cancel Membership</Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[32px] border-3d shadow-2xl bg-card/90 backdrop-blur-3xl p-8 max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl font-serif italic text-foreground tracking-tight">Time to part ways?</AlertDialogTitle>
                <AlertDialogDescription className="text-base font-light text-muted-foreground/70 mt-4 leading-relaxed">
                  Your premium access will continue until the end of your current cycle. We'd hate to see you stop building amazing mobile experiences.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-3 mt-8">
                <AlertDialogCancel className="rounded-full h-12 px-6 font-bold border-3d hover:bg-white/5">Keep Plan</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => {
                    trackEvent('subscription_cancel_confirm', 'engagement', 'subscription_card');
                    onCancel();
                  }} 
                  disabled={isCanceling} 
                  className="rounded-full h-12 px-6 font-bold bg-red-500 hover:bg-red-600 text-white shadow-xl"
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
