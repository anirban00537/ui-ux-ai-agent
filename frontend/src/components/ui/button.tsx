"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "ghost" | "outline" | "link" | "destructive" | "frosted" | "blue";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    const baseStyles = "inline-flex items-center justify-center gap-2 font-sans text-[15px] font-medium transition-all duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";
    
    const variants = {
      default: "bg-foreground text-background hover:bg-foreground/90 active:scale-[0.98] rounded-full",
      frosted: "bg-[rgba(255,255,255,0.1)] text-foreground hover:bg-[rgba(255,255,255,0.15)] active:scale-[0.98] rounded-[40px] backdrop-blur-md",
      blue: "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] rounded-full",
      ghost: "bg-transparent text-foreground hover:bg-accent active:scale-[0.98] rounded-full",
      outline: "bg-transparent text-foreground border border-border hover:border-border-strong hover:bg-accent active:scale-[0.98] rounded-full",
      link: "bg-transparent text-primary underline-offset-4 hover:underline active:scale-[0.98]",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-[0.98] rounded-full",
    };
    
    const sizes = {
      default: "h-12 px-6 py-3",
      sm: "h-10 px-5 py-2",
      lg: "h-14 px-8 py-4",
      icon: "h-10 w-10",
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
