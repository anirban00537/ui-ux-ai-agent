import React, { memo } from "react";

interface EchoProps {
  primary: string;
  secondary?: string[];
}

// Helper to compare arrays
const arraysEqual = (a?: string[], b?: string[]) => {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a.length === b.length && a.every((v, i) => v === b[i]);
};

export const Echo = memo(function Echo({ primary, secondary = [] }: EchoProps) {
  const color1 = secondary[0] || primary;
  const color2 = secondary[1] || primary;
  const color3 = secondary[2] || primary;
  const color4 = secondary[3] || primary;

  return (
    <svg 
      viewBox="0 0 1000 600" 
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full opacity-[0.5] pointer-events-none"
    >
      <defs>
        <mask id="echo-mask">
            <rect width="1000" height="600" fill="white" />
            <rect width="1000" height="600" fill="black" opacity="0.1" /> 
        </mask>
      </defs>
      
      {/* Off-canvas origin: Top Right (1100, -100) */}
      <g transform="translate(900, -100)" fill="none" strokeWidth="2">
        
        {/* Tight inner stack */}
        <rect x="-100" y="0" width="200" height="200" rx="40" stroke={primary} opacity="0.6" />
        <rect x="-150" y="-50" width="300" height="300" rx="60" stroke={primary} opacity="0.5" />
        
        {/* Spreading outward */}
        <rect x="-250" y="-150" width="500" height="500" rx="100" stroke={color1} opacity="0.4" />
        <rect x="-350" y="-250" width="700" height="700" rx="140" stroke={color2} opacity="0.3" />
        <rect x="-500" y="-400" width="1000" height="1000" rx="200" stroke={color3} opacity="0.2" />
        
        {/* Distant Echo */}
        <rect x="-700" y="-600" width="1400" height="1400" rx="300" stroke={color4} opacity="0.1" />
      </g>
    </svg>
  );
}, (prevProps, nextProps) => {
  return prevProps.primary === nextProps.primary && 
         arraysEqual(prevProps.secondary, nextProps.secondary);
});
