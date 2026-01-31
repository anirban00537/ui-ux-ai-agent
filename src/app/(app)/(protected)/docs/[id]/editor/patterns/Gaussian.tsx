import React, { memo } from "react";

interface GaussianProps {
  primary: string;
  secondary?: string[];
}

// Helper to compare arrays
const arraysEqual = (a?: string[], b?: string[]) => {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a.length === b.length && a.every((v, i) => v === b[i]);
};

export const Gaussian = memo(function Gaussian({ primary, secondary = [] }: GaussianProps) {
  const color1 = secondary[0] || primary;
  const color2 = secondary[1] || primary;
  const color3 = secondary[2] || primary;
  const color4 = secondary[3] || primary;

  const id = React.useId().replace(/:/g, "");

  return (
    <svg 
      viewBox="0 0 1000 600" 
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full opacity-[0.5] pointer-events-none"
    >
      <defs>
        <filter id={`${id}-heavy-blur`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="100" />
        </filter>
        <filter id={`${id}-noise`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
             <feFuncA type="linear" slope="0.1" /> 
          </feComponentTransfer>
        </filter>
      </defs>
      
      {/* Texture Overlay */}
      <rect width="100%" height="100%" filter={`url(#${id}-noise)`} opacity="0.4" />

      <g filter={`url(#${id}-heavy-blur)`}>
        {/* Deformed blobs instead of circles */}
        <path d="M 100 0 Q 400 200 600 0 L 0 0 Z" fill={primary} opacity="0.6" />
        <path d="M 800 600 Q 500 300 300 600 Z" fill={color1} opacity="0.5" />
        
        {/* Central wash */}
        <ellipse cx="500" cy="300" rx="600" ry="400" fill={color2} opacity="0.2" transform="rotate(20, 500, 300)" />
        
        {/* Corner bleeds */}
        <circle cx="0" cy="600" r="300" fill={color3} opacity="0.4" />
        <circle cx="1000" cy="0" r="300" fill={color4} opacity="0.4" />
      </g>
    </svg>
  );
}, (prevProps, nextProps) => {
  return prevProps.primary === nextProps.primary && 
         arraysEqual(prevProps.secondary, nextProps.secondary);
});
