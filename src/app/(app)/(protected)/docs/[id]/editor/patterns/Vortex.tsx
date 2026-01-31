import React, { memo } from "react";

interface VortexProps {
  primary: string;
  secondary?: string[];
}

// Helper to compare arrays
const arraysEqual = (a?: string[], b?: string[]) => {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a.length === b.length && a.every((v, i) => v === b[i]);
};

export const Vortex = memo(function Vortex({ primary, secondary = [] }: VortexProps) {
  const color1 = secondary[0] || primary;
  const color2 = secondary[1] || primary;
  const color3 = secondary[2] || primary;

  const id = React.useId().replace(/:/g, "");

  return (
    <svg 
      viewBox="0 0 1000 600" 
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full opacity-[0.5] pointer-events-none"
    >
      <defs>
        <filter id={`${id}-motion-blur`}>
            {/* Directional blur to simulate rotation */}
            <feGaussianBlur in="SourceGraphic" stdDeviation="4 0" />
        </filter>
        <radialGradient id={`${id}-vortex-grad`} cx="50%" cy="50%" r="50%">
             <stop offset="40%" stopColor={primary} stopOpacity="0" /> 
             <stop offset="100%" stopColor={color1} stopOpacity="0.5" />
        </radialGradient>
      </defs>
      
      {/* Logarithmic Spiral Approximation */}
      <g filter={`url(#${id}-motion-blur)`} transform="translate(500, 300)">
         {/* Main Spiral Arm 1 */}
         <path 
            d="M 0 0 m 0 -50 q 150 0 250 150 t 350 350" 
            fill="none" 
            stroke={primary} 
            strokeWidth="80" 
            opacity="0.1" 
            transform="rotate(0)"
         />
         {/* Main Spiral Arm 2 */}
         <path 
            d="M 0 0 m 0 -50 q 150 0 250 150 t 350 350" 
            fill="none" 
            stroke={color2} 
            strokeWidth="60" 
            opacity="0.1" 
            transform="rotate(120)"
         />
         {/* Main Spiral Arm 3 */}
         <path 
            d="M 0 0 m 0 -50 q 150 0 250 150 t 350 350" 
            fill="none" 
            stroke={color3} 
            strokeWidth="40" 
            opacity="0.08" 
            transform="rotate(240)"
         />
      </g>
      
      {/* Central Void Glow */}
      <circle cx="500" cy="300" r="150" fill={`url(#${id}-vortex-grad)`} opacity="0.3" />
    </svg>
  );
}, (prevProps, nextProps) => {
  return prevProps.primary === nextProps.primary && 
         arraysEqual(prevProps.secondary, nextProps.secondary);
});
