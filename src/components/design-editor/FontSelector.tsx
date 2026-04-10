"use client";

import { cn } from "@/lib/utils";
import { Type } from "lucide-react";

const AVAILABLE_FONTS = [
  { value: 'Inter', label: 'Inter', category: 'Sans-serif' },
  { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', category: 'Sans-serif' },
  { value: 'Space Grotesk', label: 'Space Grotesk', category: 'Sans-serif' },
  { value: 'Outfit', label: 'Outfit', category: 'Sans-serif' },
  { value: 'DM Sans', label: 'DM Sans', category: 'Sans-serif' },
  { value: 'Poppins', label: 'Poppins', category: 'Sans-serif' },
  { value: 'Playfair Display', label: 'Playfair Display', category: 'Serif' },
  { value: 'Cormorant Garamond', label: 'Cormorant Garamond', category: 'Serif' },
  { value: 'Lora', label: 'Lora', category: 'Serif' },
  { value: 'Source Code Pro', label: 'Source Code Pro', category: 'Monospace' },
];

interface FontSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function FontSelector({ value, onChange, className }: FontSelectorProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2 mb-1">
        <Type className="w-3.5 h-3.5 text-white/40" />
        <label className="text-[12px] font-bold text-white/50 uppercase tracking-widest font-mono">
          Primary Font
        </label>
      </div>
      <div className="relative group">
        <select
          value={value || "Inter"}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 text-[13px] font-semibold bg-white/5 border border-white/10 rounded text-white/70 focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all appearance-none cursor-pointer hover:border-white/20 font-mono"
        >
          {AVAILABLE_FONTS.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label} ({font.category})
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
