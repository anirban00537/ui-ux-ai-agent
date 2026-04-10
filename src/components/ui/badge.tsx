import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-white text-[#1f2228] font-mono text-xs uppercase tracking-[1px]",
    secondary: "bg-white/10 text-white font-mono text-xs uppercase tracking-[1px]",
    destructive: "bg-red-500 text-white font-mono text-xs uppercase tracking-[1px]",
    outline: "border border-white/20 text-white font-mono text-xs uppercase tracking-[1px]",
  };

  return (
    <div
      data-slot="badge"
      className={cn(
        "inline-flex items-center justify-center px-2.5 py-1 transition-colors duration-200",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
