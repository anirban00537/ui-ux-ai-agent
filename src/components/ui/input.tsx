import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full border border-white/10 bg-[rgba(255,255,255,0.05)] px-4 py-3 text-[15px] text-white font-sans transition-all duration-200 rounded-[8px]",
          "placeholder:text-[rgba(255,255,255,0.4)]",
          "focus:border-[#0099ff] focus:outline-none focus:ring-2 focus:ring-[rgba(0,153,255,0.15)] focus:ring-offset-2 focus:ring-offset-[#000000]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
