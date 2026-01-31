"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconDashboard,
  IconSettings,
  IconPhoto,
  IconFileText,
  IconSparkles,
  IconLogout,
  IconChevronRight,
  IconMenu2,
  IconX,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Navigation items
const navItems = [
  { title: "Home", url: "/home", icon: IconDashboard },
  { title: "My Presentations", url: "/my-docs", icon: IconFileText },
  { title: "Media", url: "/media", icon: IconPhoto },
  { title: "Pricing", url: "/pricing", icon: IconSparkles },
];

const secondaryItems = [
  { title: "Subscription", url: "/subscription", icon: IconCreditCard },
];

// Helper functions
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

// App Sidebar Component
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
      {/* Mobile Menu Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2.5 rounded-full md:hidden bg-card/90 backdrop-blur-xl border border-border shadow-sm text-foreground/80 hover:bg-card transition-all custom-shadow"
      >
        <IconMenu2 size={20} />
      </motion.button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Fixed */}
      <motion.aside
        initial={false}
        animate={{ x: isMobile ? (isMobileOpen ? 0 : "-100%") : 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300, mass: 0.8 }}
        className="fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col border-r border-border"
      >
        {/* Main Glass Container - Updated Gradient */}
        <div className="absolute inset-0 w-full h-full overflow-hidden " />

        {/* Content wrapper */}
        <div className="relative z-10 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4">
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src="/logo.svg"
                alt="Butterfast Logo"
                width={130}
                height={32}
                className="h-8 w-auto"
              />
            </Link>

            {/* Mobile close button */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-2 rounded-full md:hidden hover:bg-secondary/10 transition-colors text-foreground/60"
            >
              <IconX size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-2 space-y-1.5 overflow-y-auto custom-scrollbar-light">
            <p className="px-3 text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-3 select-none">
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
                      "relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-300 ease-out",
                      isActive
                        ? "bg-primary/10"
                        : "hover:bg-secondary/10 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      <item.icon
                        size={20}
                        stroke={1.5}
                        className={cn(
                          "transition-colors duration-300 text-foreground/50 group-hover:text-foreground/80"
                        )}
                      />
                    </span>

                    <span
                      className={cn(
                        "relative z-10 text-[14px] font-medium tracking-tight transition-all duration-300",
                        isActive ? "font-semibold" : ""
                      )}
                    >
                      {item.title}
                    </span>
                  </div>
                </Link>
              );
            })}

            {/* Secondary Section Label */}
            <div className="pt-8 pb-3">
              <p className="px-3 text-[10px] font-bold text-foreground/40 uppercase tracking-widest select-none">
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
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-secondary/10 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon
                    size={20}
                    stroke={1.5}
                    className={cn(
                      "transition-colors duration-300",
                      isActive
                        ? "text-primary"
                        : "text-foreground/50 group-hover:text-foreground/80"
                    )}
                  />
                  <span className="text-[14px] font-medium">{item.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 space-y-4">
            {/* Premium/Credits Card - Updated Design */}
            <div className="relative overflow-hidden rounded-2xl p-[1px] group">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/20 via-card to-secondary/20 opacity-100" />
              <div className="relative rounded-[15px] p-5 bg-card/80 backdrop-blur-md overflow-hidden border border-border">
                {!isSubscribed ? (
                  <Link 
                    href="/pricing" 
                    className="block w-full mb-4"
                    onClick={() => trackEvent('upgrade_click', 'engagement', 'sidebar_premium_card')}
                  >
                    <Button
                      size="sm"
                      className="w-full justify-center h-10 rounded-full text-xs font-semibold bg-primary text-white shadow-coral-glow hover:bg-primary/90 hover:scale-[1.02] transition-all"
                    >
                      Upgrade to Pro
                    </Button>
                  </Link>
                ) : null}

                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20">
                    <IconSparkles size={20} className="" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-serif font-bold text-foreground leading-none mb-1.5">
                      {isSubscribed
                        ? subscriptionStatus?.features?.productName ||
                          "Pro Plan"
                        : "Free Plan"}
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-tight flex items-center gap-1.5">
                      <span className="font-bold text-primary">
                        {creditBalance?.balance ?? 0}
                      </span>{" "}
                      credits remaining
                    </p>
                  </div>
                </div>

                {isSubscribed ? (
                  <div className="w-full h-2 bg-secondary/20 rounded-full overflow-hidden mt-4">
                    <motion.div
                      className="h-full bg-primary"
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
            </div>

            {/* User Section - Minimal Glass */}
            <div className="pt-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-full group flex items-center gap-3 p-2 rounded-xl transition-all duration-200 hover:bg-secondary/40 outline-none focus-visible:ring-2 focus-visible:ring-primary/20">
                    <Avatar className="h-10 w-10 rounded-xl shadow-sm border-secondary/30 ring-2 ring-secondary/20 group-hover:ring-secondary/40 transition-all">
                      {user?.image ? (
                        <AvatarImage
                          src={user.image}
                          alt={primaryName}
                          className="rounded-xl object-cover"
                        />
                      ) : null}

                      <AvatarFallback className="rounded-xl bg-secondary/40 text-primary text-xs font-bold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 text-left min-w-0 flex flex-col justify-center">
                      <p className="text-xs font-semibold text-foreground truncate leading-tight group-hover:text-primary transition-colors">
                        {primaryName}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                        {primaryEmail}
                      </p>
                    </div>

                    <div className="bg-secondary/30 p-1.5 rounded-lg text-foreground/40 group-hover:text-foreground/70 group-hover:bg-secondary/60 transition-all">
                      <IconSettings size={14} />
                    </div>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="start"
                  side="right"
                  sideOffset={16}
                  className="w-56 rounded-2xl border-0 p-1.5 popover-glass"
                >
                  <div className="px-2 py-1.5 mb-1 bg-secondary/20 rounded-xl">
                    <p className="text-xs font-medium text-foreground">
                      {primaryName}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {primaryEmail}
                    </p>
                  </div>

                  <DropdownMenuItem className="rounded-lg cursor-pointer text-xs font-medium py-2 focus:bg-secondary/40 focus:text-primary">
                    <IconSettings size={14} className="mr-2" />
                    Account Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-black/5" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="rounded-lg cursor-pointer text-xs font-medium py-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <IconLogout size={14} className="mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Spacer for fixed sidebar on desktop */}
      <div className="hidden md:block w-[280px] shrink-0 transform-gpu" />
    </>
  );
}
