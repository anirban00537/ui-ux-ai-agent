import React, { memo } from "react";

interface FluidProps {
  primary: string;
  secondary?: string[];
}

// Helper to compare arrays
const arraysEqual = (a?: string[], b?: string[]) => {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a.length === b.length && a.every((v, i) => v === b[i]);
};

export const Fluid = memo(function Fluid({ primary, secondary = [] }: FluidProps) {
  const color1 = secondary[0] || primary;
  const color2 = secondary[1] || primary;
  const color3 = secondary[2] || primary;

  const id = React.useId().replace(/:/g, "");

  return (
    <svg 
      viewBox="0 0 1000 600" 
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full opacity-[0.4] pointer-events-none"
    >
      <defs>
        <linearGradient id={`${id}-fluid-1`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={primary} stopOpacity="0.6" />
          <stop offset="100%" stopColor={color1} stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id={`${id}-fluid-2`} x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={color2} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color3} stopOpacity="0.4" />
        </linearGradient>
      </defs>
      
      {/* Background Deep Wave */}
      <path 
        d="M 0 400 Q 250 250 500 400 T 1000 400 L 1000 600 L 0 600 Z" 
        fill={color1} 
        opacity="0.2"
      />

      {/* Mid Layer - Complex Bezier */}
      <path 
        d="M 0 500 C 300 400, 400 600, 700 400 S 1100 300, 1100 500 L 1100 600 L 0 600 Z" 
        fill={`url(#${id}-fluid-2)`}
        opacity="0.3" 
      />
      
      {/* Top Layer - Liquid Metal Flow */}
      <path 
        d="M 0 550 C 200 500, 500 350, 800 500 S 1000 550, 1000 600 L 0 600 Z" 
        fill={`url(#${id}-fluid-1)`}
        opacity="0.5" 
      />
    </svg>
  );
}, (prevProps, nextProps) => {
  return prevProps.primary === nextProps.primary && 
         arraysEqual(prevProps.secondary, nextProps.secondary);
});
