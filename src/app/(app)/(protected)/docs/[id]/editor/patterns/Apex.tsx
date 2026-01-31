import React, { memo } from "react";

interface ApexProps {
  primary: string;
  secondary?: string[];
}

// Helper to compare arrays
const arraysEqual = (a?: string[], b?: string[]) => {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a.length === b.length && a.every((v, i) => v === b[i]);
};

export const Apex = memo(function Apex({ primary, secondary = [] }: ApexProps) {
  const color1 = secondary[0] || primary;
  const color2 = secondary[1] || primary;
  const color3 = secondary[2] || primary;
  const color4 = secondary[3] || primary;

  // Generate a unique ID for gradients to avoid conflicts if multiple patterns exist
  const id = React.useId().replace(/:/g, ""); 

  return (
    <svg 
      viewBox="0 0 1000 600" 
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full opacity-[0.6] pointer-events-none mix-blend-overlay"
    >
      <defs>
        <linearGradient id={`${id}-grad-primary`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={primary} stopOpacity="1" />
          <stop offset="100%" stopColor={primary} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-grad-1`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={color1} stopOpacity="1" />
          <stop offset="100%" stopColor={color1} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-grad-2`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={color2} stopOpacity="0.8" />
          <stop offset="100%" stopColor={color2} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-grad-fill`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={primary} stopOpacity="0.1" />
          <stop offset="100%" stopColor={primary} stopOpacity="0" />
        </linearGradient>
      </defs>

      <g transform="translate(100, 50)">
        {/* Main Base Triangle */}
        <path 
          d="M 800 600 L 400 600 L 600 200 Z" 
          fill={`url(#${id}-grad-fill)`}
          stroke="none"
        />

        {/* Structural Lines - Fading Upwards */}
        <path d="M 850 600 L 600 100 L 350 600" fill="none" stroke={`url(#${id}-grad-primary)`} strokeWidth="2" />
        <path d="M 950 600 L 600 0 L 250 600" fill="none" stroke={`url(#${id}-grad-1)`} strokeWidth="1.5" opacity="0.8" />
        <path d="M 750 600 L 600 300 L 450 600" fill="none" stroke={`url(#${id}-grad-2)`} strokeWidth="1" opacity="0.6" />
        
        {/* Background Echoes */}
        <path d="M 1050 600 L 600 -100 L 150 600" fill="none" stroke={color3} strokeWidth="0.5" opacity="0.3" />
        <path d="M 1150 600 L 600 -200 L 50 600" fill="none" stroke={color4} strokeWidth="0.5" opacity="0.15" />
      </g>
    </svg>
  );
}, (prevProps, nextProps) => {
  return prevProps.primary === nextProps.primary && 
         arraysEqual(prevProps.secondary, nextProps.secondary);
});
