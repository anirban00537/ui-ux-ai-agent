"use client";

import React, { useState, useMemo, memo } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DynamicIcon, AVAILABLE_ICON_NAMES } from "./DynamicIcon";
import { IconSearch, IconIcons } from "@tabler/icons-react";
import type { Theme } from "@/types";

// Use the centralized icon list from DynamicIcon
const CURATED_ICONS = AVAILABLE_ICON_NAMES;


interface UniversalIconPickerProps {
  /** Current icon name (IconRocket) or emoji */
  value: string;
  /** Callback when icon is selected */
  onChange: (value: string) => void;
  /** Doc theme for styling */
  theme: Theme;
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Additional class names for the trigger button */
  className?: string;
  /** Size of the trigger button */
  size?: "sm" | "md" | "lg" | "xl";
  /** Custom styles */
  style?: React.CSSProperties;
  /** Fallback content if no icon is selected */
  children?: React.ReactNode;
}

const sizeClasses = {
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg",
  xl: "w-16 h-16 text-2xl",
};

export const UniversalIconPicker = memo(function UniversalIconPicker({
  value,
  onChange,
  theme,
  disabled = false,
  className = "",
  size = "md",
  style,
  children,
}: UniversalIconPickerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const isDark = theme.themeType === "dark";

  const filteredIcons = useMemo(() => {
    if (!searchTerm) return CURATED_ICONS;
    return CURATED_ICONS.filter(name => 
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  if (disabled) {
    return (
      <div
        className={`rounded-2xl flex items-center justify-center border shadow-sm ${sizeClasses[size]} ${className}`}
        style={{
          backgroundColor: theme.primary,
          color: theme.cardBackground || "#fff",
          ...style
        }}
      >
        {value ? (
          <DynamicIcon name={value} size={size === "xl" ? 32 : 20} stroke={2.5} />
        ) : (
          children
        )}
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`rounded-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 border shadow-sm outline-none group ${sizeClasses[size]} ${className}`}
          style={{
            backgroundColor: theme.primary,
            color: theme.cardBackground || "#fff",
            backdropFilter: "blur(8px)",
            ...style
          }}
        >
          {value ? (
            <DynamicIcon name={value} size={size === "xl" ? 32 : 20} stroke={2.5} />
          ) : (
            children
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 overflow-hidden border-none shadow-2xl rounded-3xl"
        style={{
          backgroundColor: isDark ? "rgba(15,15,18,0.98)" : "rgba(255,255,255,0.98)",
          backdropFilter: "blur(20px)",
          color: isDark ? "#ffffff" : "#000000",
        }}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold px-1">
            <IconIcons size={14} /> Select Icon
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={14} />
            <Input
              placeholder="Search icons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-black/5 dark:bg-white/5 border-white/10 rounded-xl h-9 text-xs"
            />
          </div>
          <div className="grid grid-cols-5 gap-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {filteredIcons.map((name) => (
              <button
                key={name}
                onClick={() => onChange(name)}
                className="aspect-square flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors p-2 group"
                style={{
                  color: value === name ? theme.primary : (isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.6)"),
                  backgroundColor: value === name ? `${theme.primary}20` : "transparent"
                }}
              >
                <DynamicIcon 
                  name={name} 
                  size={20} 
                  stroke={2.5} 
                  className="group-hover:scale-125 transition-transform"
                />
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}, (prevProps, nextProps) => {
  // Only re-render if these specific props change
  // Ignore full theme object changes for performance
  return prevProps.value === nextProps.value && 
         prevProps.disabled === nextProps.disabled &&
         prevProps.size === nextProps.size &&
         prevProps.theme.primary === nextProps.theme.primary &&
         prevProps.theme.themeType === nextProps.theme.themeType;
});
