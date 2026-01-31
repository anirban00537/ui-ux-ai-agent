import React, { memo } from "react";

interface EtherProps {
  primary: string;
  secondary?: string[];
}

// Helper to compare arrays
const arraysEqual = (a?: string[], b?: string[]) => {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a.length === b.length && a.every((v, i) => v === b[i]);
};

export const Ether = memo(function Ether({ primary, secondary = [] }: EtherProps) {
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
        <radialGradient id={`${id}-ether-glow`} cx="50%" cy="0%" r="80%">
          <stop offset="0%" stopColor={primary} stopOpacity="0.4" />
          <stop offset="100%" stopColor={primary} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-ether-shaft-1`} x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor={color1} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color1} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-ether-shaft-2`} x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor={color2} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color2} stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Top ambient glow */}
      <rect width="1000" height="600" fill={`url(#${id}-ether-glow)`} opacity="0.6" />
      
      {/* Volumetric Light Cones - Soft Edges */}
      <g filter="url(#ether-blur)"> 
         {/* Note: filter not defined in defs here intentionally to rely on simple gradient fading, 
             but let's actually ensure softness by strict gradient definitions above */}
         <path d="M 200 -100 L 800 -100 L 600 600 L 400 600 Z" fill={`url(#${id}-ether-shaft-1)`} transform="rotate(15, 500, 0)" />
         <path d="M 100 -100 L 500 -100 L 400 600 L 0 600 Z" fill={`url(#${id}-ether-shaft-2)`} transform="rotate(-10, 300, 0)" />
         
         {/* Subtle crossing beam */}
         <path d="M 600 -100 L 900 -100 L 1100 500 L 800 500 Z" fill={color3} opacity="0.05" transform="rotate(-5, 800, 0)" />
      </g>
    </svg>
  );
}, (prevProps, nextProps) => {
  return prevProps.primary === nextProps.primary && 
         arraysEqual(prevProps.secondary, nextProps.secondary);
});
