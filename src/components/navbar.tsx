"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { trackEvent } from "@/components/analytics/trackEvent";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/userSlice";

const menuItems = [
  { name: "Blog", href: "/blog" },
  { name: "About", href: "/about" },
  { name: "Pricing", href: "/pricing" },
];

export function Navbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const user = useAppSelector(selectUser);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) setIsScrolled(true);
    else setIsScrolled(false);
  });

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex justify-center px-4 sm:px-8 transition-all duration-300 pointer-events-none",
        isScrolled ? "bg-white/90 backdrop-blur-md border-b border-border/50 py-3" : "bg-transparent py-5"
      )}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="pointer-events-auto flex items-center justify-between w-full max-w-7xl mx-auto">
        <div className="flex items-center min-w-[150px]">
          <Link
            href="/"
            onClick={() => trackEvent('nav_logo_click', 'engagement', 'header')}
            className="group flex items-center gap-2"
          >
            <Image
              src="/logo.svg"
              alt="Butterfast Logo"
              width={130}
              height={32}
              className="h-8 w-auto"
            />
          </Link>
        </div>

        {/* Desktop Menu - Centered */}
        <nav className="hidden md:flex items-center justify-center gap-6 flex-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-[15px] font-medium text-foreground/70 hover:text-foreground transition-colors relative group py-2"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Action Buttons - Right */}
        <div className="flex items-center justify-end min-w-[150px] gap-3">
          {user ? (
            <Link href="/home">
              <Button
                size="sm"
                onClick={() => trackEvent("button_click", "engagement", "nav_dashboard")}
                className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-6 shadow-sm transition-all hover:scale-[1.02]"
              >
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => trackEvent("button_click", "engagement", "nav_login")}
                  className="hidden sm:inline-flex text-[15px] font-medium text-foreground/80 hover:text-foreground hover:bg-transparent px-2"
                >
                  Log In
                </Button>
              </Link>
              <Link href="/home">
                <Button
                  size="sm"
                  onClick={() => trackEvent("button_click", "engagement", "nav_get_started")}
                  className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-6 w-auto h-10 shadow-sm transition-all hover:scale-[1.02] text-[15px] font-medium"
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
