import React, { memo } from "react";

interface ArchProps {
  primary: string;
  secondary?: string[];
}

// Helper to compare arrays
const arraysEqual = (a?: string[], b?: string[]) => {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a.length === b.length && a.every((v, i) => v === b[i]);
};

export const Arch = memo(function Arch({ primary, secondary = [] }: ArchProps) {
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
        <filter id="arch-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="arch-clip">
          <rect width="1000" height="600" />
        </clipPath>
      </defs>

      <g clipPath="url(#arch-clip)" filter="url(#arch-glow)">
        {/* Origin: Bottom Left, slightly off-canvas */}
        <g transform="translate(-100, 650)">
          {/* Main Arches with varying widths */}
          <path d="M 0 0 Q 600 -100 900 -650" fill="none" stroke={primary} strokeWidth="3" opacity="0.6" />
          <path d="M 50 0 Q 650 -100 950 -600" fill="none" stroke={color1} strokeWidth="2" opacity="0.5" />
          
          {/* Secondary Fainter Arches */}
          <path d="M 150 0 Q 750 -100 1050 -550" fill="none" stroke={color2} strokeWidth="1" opacity="0.4" />
          <path d="M 250 0 Q 850 -100 1150 -500" fill="none" stroke={color3} strokeWidth="0.5" opacity="0.3" />
          
          {/* Wide Atmospheric Arch */}
          <path d="M -100 0 Q 500 -200 800 -800" fill="none" stroke={color4} strokeWidth="15" opacity="0.05" />
        </g>
      </g>
    </svg>
  );
}, (prevProps, nextProps) => {
  return prevProps.primary === nextProps.primary && 
         arraysEqual(prevProps.secondary, nextProps.secondary);
});
