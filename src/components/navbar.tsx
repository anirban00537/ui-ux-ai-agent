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
      className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className={cn(
          "pointer-events-auto flex items-center justify-between gap-8 h-14 pl-6 pr-2 rounded-full transition-all duration-300",
          "bg-card/80 backdrop-blur-xl border border-card/50 shadow-sm",
          isScrolled ? "w-full max-w-4xl shadow-depth-2" : "w-full max-w-5xl"
        )}
      >
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

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors relative group"
            >
              {item.name}
              <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full transition-all duration-300 group-hover:w-4" />
            </Link>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {user ? (
            <Link href="/home">
              <Button
                size="sm"
                onClick={() => trackEvent("button_click", "engagement", "nav_dashboard")}
                className="rounded-full bg-primary hover:bg-primary/90 text-white px-5 shadow-coral-glow transition-all hover:scale-105"
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
                  className="hidden sm:inline-flex text-foreground/70 hover:text-foreground hover:bg-foreground/5 rounded-full px-5"
                >
                  Log in
                </Button>
              </Link>
              <Link href="/home">
                <Button
                  size="sm"
                  onClick={() => trackEvent("button_click", "engagement", "nav_get_started")}
                  className="rounded-full bg-primary hover:bg-primary/90 text-white px-5 shadow-coral-glow transition-all hover:scale-105"
                >
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
