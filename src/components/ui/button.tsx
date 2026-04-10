"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "ghost" | "outline" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    const baseStyles = "inline-flex items-center justify-center gap-2.5 font-mono text-sm font-normal uppercase tracking-[1.4px] transition-all duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[rgb(59,130,246/0.5)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1f2228] disabled:pointer-events-none disabled:opacity-50";
    
    const variants = {
      default: "bg-white text-[#1f2228] hover:bg-white/90 active:scale-[0.98]",
      ghost: "bg-transparent text-white border border-white/20 hover:bg-white/5 active:scale-[0.98]",
      outline: "bg-transparent text-white border border-white/20 hover:bg-white/5 active:scale-[0.98]",
      link: "bg-transparent text-white underline-offset-4 hover:underline active:scale-[0.98]",
      destructive: "bg-red-500 text-white hover:bg-red-500/90 active:scale-[0.98]",
    };
    
    const sizes = {
      default: "h-11 px-6 py-3",
      sm: "h-9 px-4 py-2",
      lg: "h-12 px-8 py-4",
      icon: "h-9 w-9",
    };

    return (
      <Comp
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
