"use client";

import { useState, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import { cn } from "@/lib/utils";

interface ColorPickerInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ColorPickerInput({ label, value, onChange, className }: ColorPickerInputProps) {
  const [localValue, setLocalValue] = useState(value);
  
  // Debounce the onChange callback
  const debouncedOnChange = useDebouncedCallback(onChange, 300);
  
  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    debouncedOnChange(newValue);
  };

  // Sync local value when prop changes (from external sources like reset or API updates)
  useEffect(() => {
    if (value) setLocalValue(value);
  }, [value]);

  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <label className="text-xs font-medium text-zinc-400 capitalize">
        {label.replace(/([A-Z])/g, ' $1').trim()}
      </label>
      <div className="flex items-center gap-2">
        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-zinc-700 shadow-sm flex-shrink-0">
          <input 
            type="color" 
            value={localValue || "#000000"}
            onChange={(e) => handleChange(e.target.value)}
            className="absolute -top-2 -left-2 w-16 h-16 p-0 border-0 cursor-pointer opacity-0"
          />
          <div 
            className="w-full h-full pointer-events-none" 
            style={{ backgroundColor: localValue || "#000000" }} 
          />
        </div>
        <input 
          type="text"
          value={localValue || ""}
          onChange={(e) => handleChange(e.target.value)}
          className="w-20 px-2 py-1.5 text-[11px] font-mono bg-zinc-900 border border-zinc-800 rounded text-zinc-300 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all uppercase"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}
