import React, { memo } from "react";

interface LuminaProps {
  primary: string;
  secondary?: string[];
}

// Helper to compare arrays
const arraysEqual = (a?: string[], b?: string[]) => {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a.length === b.length && a.every((v, i) => v === b[i]);
};

export const Lumina = memo(function Lumina({ primary, secondary = [] }: LuminaProps) {
  const color1 = secondary[0] || primary;
  const color2 = secondary[1] || primary;
  const color3 = secondary[2] || primary;

  const id = React.useId().replace(/:/g, "");

  return (
    <svg 
      viewBox="0 0 1000 600" 
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full opacity-[0.6] pointer-events-none mix-blend-screen"
    >
      <defs>
        <radialGradient id={`${id}-lumina-core`} cx="20%" cy="20%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.8" />
          <stop offset="20%" stopColor={primary} stopOpacity="0.4" />
          <stop offset="100%" stopColor={primary} stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-lumina-flare`} x="-50%" y="-50%" width="200%" height="200%">
           <feGaussianBlur in="SourceGraphic" stdDeviation="15" />
        </filter>
      </defs>

      {/* Main Light Source - Top Left */}
      <rect width="1000" height="600" fill={`url(#${id}-lumina-core)`} opacity="0.7" />

      {/* Cinematic Lens Flare Artifacts (Diagonal path) */}
      <g filter={`url(#${id}-lumina-flare)`}>
          <circle cx="400" cy="350" r="80" fill={color1} opacity="0.08" />
          <circle cx="600" cy="500" r="120" fill={color2} opacity="0.05" />
          <circle cx="250" cy="250" r="40" fill={color3} opacity="0.1" />
          
          {/* Anamorphic streak */}
          <ellipse cx="200" cy="200" rx="400" ry="5" fill={primary} opacity="0.1" transform="rotate(-45, 200, 200)" />
      </g>
    </svg>
  );
}, (prevProps, nextProps) => {
  return prevProps.primary === nextProps.primary && 
         arraysEqual(prevProps.secondary, nextProps.secondary);
});
