import React, { memo } from "react";

interface FractalProps {
  primary: string;
  secondary?: string[];
}

// Helper to compare arrays
const arraysEqual = (a?: string[], b?: string[]) => {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a.length === b.length && a.every((v, i) => v === b[i]);
};

export const Fractal = memo(function Fractal({ primary, secondary = [] }: FractalProps) {
  const color1 = secondary[0] || primary;
  const color2 = secondary[1] || primary;
  const color3 = secondary[2] || primary;

  return (
    <svg 
      viewBox="0 0 1000 600" 
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full opacity-[0.5] pointer-events-none mix-blend-plus-lighter"
    >
      <g>
        {/* Large Base Planes */}
        <path d="M 0 600 L 600 200 L 400 600 Z" fill={primary} opacity="0.3" />
        <path d="M 1000 600 L 400 300 L 700 600 Z" fill={color1} opacity="0.25" />
        
        {/* Crossing Plane from Top */}
        <path d="M 800 0 L 500 400 L 1000 200 Z" fill={color2} opacity="0.2" />
        
        {/* Smaller Detail Shards */}
        <path d="M 500 400 L 600 500 L 450 500 Z" fill={color3} opacity="0.4" />
        
        {/* Highlight Edges */}
        <line x1="600" y1="200" x2="400" y2="600" stroke="white" strokeWidth="0.5" opacity="0.3" />
        <line x1="400" y1="300" x2="800" y2="0" stroke="white" strokeWidth="0.5" opacity="0.2" />
      </g>
    </svg>
  );
}, (prevProps, nextProps) => {
  return prevProps.primary === nextProps.primary && 
         arraysEqual(prevProps.secondary, nextProps.secondary);
});
