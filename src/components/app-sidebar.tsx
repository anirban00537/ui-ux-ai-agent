"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconDashboard,
  IconSettings,
  IconFileText,
  IconSparkles,
  IconLogout,
  IconX,
  IconMenu2,
  IconCreditCard,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/components/analytics/trackEvent";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/userSlice";
import {
  selectCreditBalance,
  selectIsSubscribed,
  selectSubscriptionStatus,
} from "@/store/slices/subscriptionSlice";
import { useSignOut } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { formatCredits, getCreditColor } from "@/lib/credit-utils";

const navItems = [
  { title: "Home", url: "/home", icon: IconDashboard },
  { title: "My Designs", url: "/my-designs", icon: IconFileText },
  { title: "Pricing", url: "/pricing", icon: IconSparkles },
];

const secondaryItems = [
  { title: "Subscription", url: "/subscription", icon: IconCreditCard },
];

const getInitials = (name?: string, email?: string) => {
  if (name) {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0]?.charAt(0)?.toUpperCase() ?? "U";
    return (
      (parts[0]?.charAt(0) ?? "") + (parts[parts.length - 1]?.charAt(0) ?? "")
    ).toUpperCase();
  }
  if (email) return email.charAt(0).toUpperCase();
  return "U";
};

const formatName = (user: any) => {
  if (user?.name) return user.name;
  if (user?.user_name) return user.user_name;
  if (user?.email) return user.email.split("@")[0];
  return "User";
};

export function AppSidebar() {
  const pathname = usePathname();
  const user = useAppSelector(selectUser);
  const creditBalance = useAppSelector(selectCreditBalance);
  const isSubscribed = useAppSelector(selectIsSubscribed);
  const subscriptionStatus = useAppSelector(selectSubscriptionStatus);
  const signOutMutation = useSignOut();
  const isMobile = useIsMobile();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const primaryName = formatName(user);
  const primaryEmail = user?.email ?? "user@example.com";
  const userInitials = getInitials(primaryName, primaryEmail);

  const handleSignOut = () => {
    trackEvent('user_logout', 'engagement', 'sidebar');
    signOutMutation.mutate();
  };

  return (
    <>
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2.5 md:hidden border border-white/20 text-white hover:bg-white/5 transition-colors"
      >
        <IconMenu2 size={20} />
      </motion.button>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: isMobile ? (isMobileOpen ? 0 : "-100%") : 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300, mass: 0.8 }}
        className="fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col border-r border-white/10 bg-[#1f2228]"
      >
        <div className="relative z-10 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-4">
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src="/logo.svg"
                alt="Butterfast Logo"
                width={130}
                height={32}
                className="h-8 w-auto brightness-0 invert"
              />
            </Link>

            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-2 md:hidden text-white/50 hover:text-white transition-colors"
            >
              <IconX size={20} />
            </button>
          </div>

          <nav className="flex-1 px-2 py-2 space-y-1.5 overflow-y-auto">
            <p className="px-3 font-mono text-[10px] uppercase tracking-[1.4px] text-white/30 mb-3">
              Menu
            </p>
            {navItems.map((item) => {
              const isActive =
                pathname === item.url || pathname.startsWith(item.url + "/");

              return (
                <Link
                  key={item.url}
                  href={item.url}
                  onClick={() => {
                    trackEvent('nav_click', 'engagement', item.title.toLowerCase());
                    setIsMobileOpen(false);
                  }}
                  className="relative group block outline-none"
                >
                  <div
                    className={cn(
                      "relative flex items-center gap-3 px-3.5 py-2.5 transition-all duration-300",
                      isActive
                        ? "border border-white/20 bg-white/[0.05]"
                        : "hover:bg-white/[0.03] text-white/50 hover:text-white"
                    )}
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      <item.icon
                        size={20}
                        stroke={1.5}
                        className={cn(
                          "transition-colors duration-300",
                          isActive ? "text-white" : "text-white/50 group-hover:text-white"
                        )}
                      />
                    </span>

                    <span
                      className={cn(
                        "relative z-10 font-sans text-[14px] tracking-tight",
                        isActive ? "text-white" : ""
                      )}
                    >
                      {item.title}
                    </span>
                  </div>
                </Link>
              );
            })}

            <div className="pt-8 pb-3">
              <p className="px-3 font-mono text-[10px] uppercase tracking-[1.4px] text-white/30">
                Preferences
              </p>
            </div>
            {secondaryItems.map((item) => {
              const isActive = pathname === item.url;
              return (
                <Link
                  key={item.url}
                  href={item.url}
                  onClick={() => {
                    trackEvent('nav_click', 'engagement', item.title.toLowerCase());
                    setIsMobileOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 transition-all duration-200 group",
                    isActive
                      ? "border border-white/20 bg-white/[0.05]"
                      : "hover:bg-white/[0.03] text-white/50 hover:text-white"
                  )}
                >
                  <item.icon
                    size={20}
                    stroke={1.5}
                    className={cn(
                      "transition-colors duration-300",
                      isActive
                        ? "text-white"
                        : "text-white/50 group-hover:text-white"
                    )}
                  />
                  <span className="font-sans text-[14px]">{item.title}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 space-y-4">
            <div className="border border-white/10 bg-white/[0.03] p-5">
              {!isSubscribed ? (
                <Link 
                  href="/pricing" 
                  className="block w-full mb-4"
                  onClick={() => trackEvent('upgrade_click', 'engagement', 'sidebar_premium_card')}
                >
                  <Button
                    size="sm"
                    className="w-full justify-center font-mono"
                  >
                    Upgrade to Pro
                  </Button>
                </Link>
              ) : null}

              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 border border-white/20">
                  <IconSparkles size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-sans text-sm text-white leading-none mb-1.5">
                    {isSubscribed
                      ? subscriptionStatus?.features?.productName ||
                        "Pro Plan"
                      : "Restricted Access"}
                  </h4>
                  <p className="font-sans text-[11px] text-white/50 leading-tight flex items-center gap-1.5">
                    <span className={cn("font-bold", getCreditColor(creditBalance?.balance))}>
                      {formatCredits(creditBalance?.balance)}
                    </span>{" "}
                    credits remaining
                  </p>
                </div>
              </div>

              {isSubscribed ? (
                <div className="w-full h-2 bg-white/10 mt-4 overflow-hidden">
                  <motion.div
                    className="h-full bg-white/20"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(
                        100,
                        ((creditBalance?.balance ?? 0) /
                          (creditBalance?.quota ?? 1)) *
                          100
                      )}%`,
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              ) : null}
            </div>

            <div className="pt-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-full group flex items-center gap-3 p-2 transition-all duration-200 hover:bg-white/[0.03] outline-none">
                    <div className="h-10 w-10 border border-white/20 flex items-center justify-center">
                      {user?.image ? (
                        <img
                          src={user.image}
                          alt={primaryName}
                          className="h-10 w-10 object-cover"
                        />
                      ) : (
                        <span className="font-mono text-xs text-white">{userInitials}</span>
                      )}
                    </div>

                    <div className="flex-1 text-left min-w-0 flex flex-col justify-center">
                      <p className="font-sans text-xs text-white truncate leading-tight">
                        {primaryName}
                      </p>
                      <p className="font-sans text-[10px] text-white/50 truncate leading-tight mt-0.5">
                        {primaryEmail}
                      </p>
                    </div>

                    <div className="text-white/30 group-hover:text-white/50 transition-colors">
                      <IconSettings size={14} />
                    </div>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="start"
                  side="right"
                  sideOffset={16}
                  className="w-56 border border-white/10 bg-[#1f2228] p-1.5"
                >
                  <div className="px-2 py-1.5 mb-1 border border-white/10">
                    <p className="font-sans text-xs text-white">
                      {primaryName}
                    </p>
                    <p className="font-sans text-[10px] text-white/50 truncate">
                      {primaryEmail}
                    </p>
                  </div>

                  <DropdownMenuItem className="cursor-pointer font-sans text-xs py-2 hover:bg-white/[0.05] focus:bg-white/[0.05]">
                    <IconSettings size={14} className="mr-2 text-white/50" />
                    Account Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer font-sans text-xs py-2 hover:bg-white/[0.05] focus:bg-white/[0.05]"
                  >
                    <IconLogout size={14} className="mr-2 text-white/50" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </motion.aside>

      <div className="hidden md:block w-[280px] shrink-0" />
    </>
  );
}
