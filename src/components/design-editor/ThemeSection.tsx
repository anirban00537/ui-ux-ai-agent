"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeSectionProps { 
  title: string; 
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function ThemeSection({ title, children, defaultOpen = true }: ThemeSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border-b border-zinc-800/30 pb-4 last:border-0 last:pb-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-2 hover:bg-zinc-900/40 rounded transition-colors px-1 -mx-1"
      >
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
          {title}
        </span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-zinc-600 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>
      {isOpen && <div className="space-y-3 pt-2 animate-in slide-in-from-top-1 fade-in duration-200">{children}</div>}
    </div>
  );
}
