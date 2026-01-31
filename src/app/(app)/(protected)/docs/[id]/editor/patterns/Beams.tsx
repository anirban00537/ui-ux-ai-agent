import React, { memo } from "react";

interface BeamsProps {
  primary: string;
  secondary?: string[];
}

// Helper to compare arrays
const arraysEqual = (a?: string[], b?: string[]) => {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a.length === b.length && a.every((v, i) => v === b[i]);
};

export const Beams = memo(function Beams({ primary, secondary = [] }: BeamsProps) {
  const color1 = secondary[0] || primary;
  const color2 = secondary[1] || primary;
  const color3 = secondary[2] || primary;
  const color4 = secondary[3] || primary;

  const id = React.useId().replace(/:/g, "");

  return (
    <svg 
      viewBox="0 0 1000 600" 
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full opacity-[0.4] pointer-events-none mix-blend-overlay"
    >
      <defs>
        <linearGradient id={`${id}-beam-fade`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.8" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g transform="rotate(-30, 500, 300)">
        {/* Light Ray 1 */}
        <polygon points="400,-200 600,-200 550,800 450,800" fill={primary} opacity="0.15" />
        
        {/* Light Ray 2 */}
        <polygon points="700,-200 800,-200 780,800 720,800" fill={color1} opacity="0.12" />
        
        {/* Light Ray 3 */}
        <polygon points="200,-200 250,-200 240,800 210,800" fill={color2} opacity="0.1" />
        
        {/* Light Ray 4 (Wide) */}
        <polygon points="0,-200 100,-200 80,800 20,800" fill={color3} opacity="0.08" />

        {/* Faintest ambient ray */}
        <polygon points="850,-200 1000,-200 950,800 880,800" fill={color4} opacity="0.05" />
      </g>
    </svg>
  );
}, (prevProps, nextProps) => {
  return prevProps.primary === nextProps.primary && 
         arraysEqual(prevProps.secondary, nextProps.secondary);
});
