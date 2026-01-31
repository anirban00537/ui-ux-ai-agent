import React, { memo } from "react";

interface PrismProps {
  primary: string;
  secondary?: string[];
}

// Helper to compare arrays
const arraysEqual = (a?: string[], b?: string[]) => {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a.length === b.length && a.every((v, i) => v === b[i]);
};

export const Prism = memo(function Prism({ primary, secondary = [] }: PrismProps) {
  const color1 = secondary[0] || primary;
  const color2 = secondary[1] || primary;
  const color3 = secondary[2] || primary;

  return (
    <svg 
      viewBox="0 0 1000 600" 
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full opacity-[0.5] pointer-events-none mix-blend-overlay"
    >
      <g>
        {/* Main Refraction Planes */}
        <path d="M 0 0 L 1000 250 L 1000 0 Z" fill={primary} opacity="0.2" />
        <path d="M 0 600 L 350 600 L 0 150 Z" fill={color1} opacity="0.25" />
        <path d="M 650 600 L 1000 350 L 1000 600 Z" fill={color2} opacity="0.2" />
        
        {/* Spectral Dispersion Lines - Simulating Chromatic Aberration */}
        {/* Main White Cut */}
        <line x1="0" y1="150" x2="1000" y2="350" stroke="white" strokeWidth="1" opacity="0.4" />
        
        {/* Offset Red Tint */}
        <line x1="0" y1="152" x2="1000" y2="352" stroke={color3} strokeWidth="2" opacity="0.1" />
        
        {/* Offset Blue Tint */}
        <line x1="0" y1="148" x2="1000" y2="348" stroke={primary} strokeWidth="2" opacity="0.1" />
        
        {/* Vertical Cut */}
         <line x1="600" y1="600" x2="1000" y2="0" stroke="white" strokeWidth="0.8" opacity="0.2" />
      </g>
    </svg>
  );
}, (prevProps, nextProps) => {
  return prevProps.primary === nextProps.primary && 
         arraysEqual(prevProps.secondary, nextProps.secondary);
});
