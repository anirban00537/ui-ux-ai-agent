import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "blue";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-foreground text-background font-sans text-[13px] font-medium",
    secondary: "bg-accent text-foreground font-sans text-[13px] font-medium",
    destructive: "bg-destructive text-destructive-foreground font-sans text-[13px] font-medium",
    outline: "border border-border text-foreground font-sans text-[13px] font-medium",
    blue: "bg-primary text-primary-foreground font-sans text-[13px] font-medium",
  };

  return (
    <div
      data-slot="badge"
      className={cn(
        "inline-flex items-center justify-center px-3 py-1.5 rounded-full transition-all duration-200",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
