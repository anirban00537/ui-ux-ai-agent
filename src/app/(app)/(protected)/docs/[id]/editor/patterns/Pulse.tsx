import React, { memo } from "react";

interface PulseProps {
  primary: string;
  secondary?: string[];
}

// Helper to compare arrays
const arraysEqual = (a?: string[], b?: string[]) => {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a.length === b.length && a.every((v, i) => v === b[i]);
};

export const Pulse = memo(function Pulse({ primary, secondary = [] }: PulseProps) {
  const color1 = secondary[0] || primary;
  const color2 = secondary[1] || primary;
  const color3 = secondary[2] || primary;
  const color4 = secondary[3] || primary;

  const id = React.useId().replace(/:/g, "");

  return (
    <svg 
      viewBox="0 0 1000 600" 
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full opacity-[0.5] pointer-events-none"
    >
      <defs>
        <mask id={`${id}-pulse-mask`}>
             <rect width="1000" height="600" fill="black" />
             <circle cx="0" cy="600" r="1000" fill="white" opacity="0.8" />
             <circle cx="0" cy="600" r="400" fill="black" />
        </mask>
      </defs>
      
      {/* Origin: Bottom Left Corner (0, 600) */}
      <g fill="none" transform="translate(0, 600)">
        
        {/* Core Ripple - Thick */}
        <circle cx="0" cy="0" r="200" stroke={primary} strokeWidth="3" opacity="0.6" />
        
        {/* Mid Ripples - Medium */}
        <circle cx="0" cy="0" r="350" stroke={color1} strokeWidth="2" opacity="0.5" />
        <circle cx="0" cy="0" r="500" stroke={color2} strokeWidth="1.5" opacity="0.4" />
        
        {/* Outer Ripples - Thin */}
        <circle cx="0" cy="0" r="700" stroke={color3} strokeWidth="1" opacity="0.3" />
        
        {/* Faint Distant Ripple */}
        <circle cx="0" cy="0" r="950" stroke={color4} strokeWidth="0.5" opacity="0.2" />
      </g>
    </svg>
  );
}, (prevProps, nextProps) => {
  return prevProps.primary === nextProps.primary && 
         arraysEqual(prevProps.secondary, nextProps.secondary);
});
