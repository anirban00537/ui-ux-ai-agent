import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full border border-white/20 bg-transparent px-4 py-2 text-sm text-white font-sans transition-colors duration-200",
          "placeholder:text-white/30",
          "focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-[rgb(59,130,246/0.5)] focus:ring-offset-2 focus:ring-offset-[#1f2228]",
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
