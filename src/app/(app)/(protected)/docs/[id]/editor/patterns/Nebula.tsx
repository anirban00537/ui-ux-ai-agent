import React, { memo } from "react";

interface NebulaProps {
  primary: string;
  secondary?: string[];
}

// Helper to compare arrays
const arraysEqual = (a?: string[], b?: string[]) => {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a.length === b.length && a.every((v, i) => v === b[i]);
};

export const Nebula = memo(function Nebula({ primary, secondary = [] }: NebulaProps) {
  const color1 = secondary[0] || primary;
  const color2 = secondary[1] || primary;
  const color3 = secondary[2] || primary;
  const color4 = secondary[3] || primary;

  const id = React.useId().replace(/:/g, "");

  return (
    <svg 
      viewBox="0 0 1000 600" 
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full opacity-[0.6] pointer-events-none"
    >
      <defs>
        <filter id={`${id}-nebula-cloud`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="60" />
        </filter>
        <filter id={`${id}-nebula-core`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="30" />
        </filter>
      </defs>
      
      {/* Cluster Formation - Diagonal (Bottom-Left to Top-Right) */}
      <g filter={`url(#${id}-nebula-cloud)`}>
        {/* Large faint halos */}
        <circle cx="200" cy="500" r="350" fill={primary} opacity="0.3" />
        <circle cx="500" cy="300" r="300" fill={color1} opacity="0.25" />
        <circle cx="800" cy="100" r="350" fill={color2} opacity="0.2" />
      </g>
      
      <g filter={`url(#${id}-nebula-core)`}>
        {/* Denser Cores */}
        <circle cx="250" cy="450" r="100" fill={primary} opacity="0.4" />
        <circle cx="550" cy="250" r="80" fill={color3} opacity="0.3" />
        <circle cx="750" cy="150" r="120" fill={color4} opacity="0.25" />
      </g>
    </svg>
  );
}, (prevProps, nextProps) => {
  return prevProps.primary === nextProps.primary && 
         arraysEqual(prevProps.secondary, nextProps.secondary);
});
