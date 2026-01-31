import React, { memo } from "react";

interface AuroraProps {
  primary: string;
  secondary?: string[];
}

// Helper to compare arrays
const arraysEqual = (a?: string[], b?: string[]) => {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a.length === b.length && a.every((v, i) => v === b[i]);
};

export const Aurora = memo(function Aurora({ primary, secondary = [] }: AuroraProps) {
  const color1 = secondary[0] || primary;
  const color2 = secondary[1] || primary;
  const color3 = secondary[2] || primary;
  const color4 = secondary[3] || primary;

  const id = React.useId().replace(/:/g, "");

  return (
    <svg 
      viewBox="0 0 1000 600" 
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full opacity-[0.6] pointer-events-none mix-blend-screen"
    >
      <defs>
        <filter id={`${id}-aurora-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="50" />
        </filter>
        <linearGradient id={`${id}-aurora-mesh`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primary} stopOpacity="0.4" />
            <stop offset="50%" stopColor={color1} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color2} stopOpacity="0.2" />
        </linearGradient>
      </defs>
      
      <g filter={`url(#${id}-aurora-blur)`}>
        {/* Horizontal Stretched Bands */}
        <ellipse cx="500" cy="100" rx="600" ry="100" fill={primary} opacity="0.3" transform="rotate(-5, 500, 100)" />
        <ellipse cx="200" cy="500" rx="700" ry="120" fill={color1} opacity="0.25" transform="rotate(2, 500, 500)" />
        <ellipse cx="800" cy="400" rx="500" ry="150" fill={color2} opacity="0.2" transform="rotate(-3, 800, 300)" />
        
        {/* Deep ambient wash */}
        <rect x="-200" y="200" width="1400" height="300" fill={`url(#${id}-aurora-mesh)`} opacity="0.15" transform="rotate(10, 500, 300)" />
        
        {/* Subtle highlight */}
        <ellipse cx="300" cy="200" rx="300" ry="80" fill={color3} opacity="0.2" transform="rotate(5, 500, 200)" />
        <ellipse cx="700" cy="500" rx="300" ry="80" fill={color4} opacity="0.15" transform="rotate(-2, 500, 200)" />
      </g>
    </svg>
  );
}, (prevProps, nextProps) => {
  return prevProps.primary === nextProps.primary && 
         arraysEqual(prevProps.secondary, nextProps.secondary);
});
