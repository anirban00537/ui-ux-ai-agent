import React, { memo } from "react";

interface HorizonProps {
  primary: string;
  secondary?: string[];
}

// Helper to compare arrays
const arraysEqual = (a?: string[], b?: string[]) => {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a.length === b.length && a.every((v, i) => v === b[i]);
};

export const Horizon = memo(function Horizon({ primary, secondary = [] }: HorizonProps) {
  const color1 = secondary[0] || primary;
  const color2 = secondary[1] || primary;
  const color3 = secondary[2] || primary;

  const id = React.useId().replace(/:/g, "");

  return (
    <svg 
      viewBox="0 0 1000 600" 
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full opacity-[0.5] pointer-events-none"
    >
      <defs>
        <linearGradient id={`${id}-horizon-fade`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id={`${id}-horizon-mask`}>
          <rect width="1000" height="600" fill={`url(#${id}-horizon-fade)`} />
        </mask>
      </defs>
      
      <g mask={`url(#${id}-horizon-mask)`}>
        {/* Layer 1 - Furthest */}
        <path 
            d="M 0 600 L 0 540 Q 500 520 1000 540 L 1000 600 Z" 
            fill={primary} 
            opacity="0.3" 
        />
        
        {/* Layer 2 - Mid */}
        <path 
            d="M 0 600 L 0 560 Q 500 550 1000 560 L 1000 600 Z" 
            fill={color1} 
            opacity="0.4" 
        />
        
        {/* Layer 3 - Closest */}
        <path 
            d="M 0 600 L 0 580 Q 500 575 1000 580 L 1000 600 Z" 
            fill={color2} 
            opacity="0.5" 
        />
        
        {/* Atmosphere Haze */}
        <rect x="0" y="500" width="1000" height="100" fill={color3} opacity="0.2" />
      </g>
    </svg>
  );
}, (prevProps, nextProps) => {
  return prevProps.primary === nextProps.primary && 
         arraysEqual(prevProps.secondary, nextProps.secondary);
});
