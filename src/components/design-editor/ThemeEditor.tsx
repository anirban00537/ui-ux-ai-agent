"use client";

import React, { useState, useCallback } from "react";
import { Palette, Type, ChevronDown, ChevronUp } from "lucide-react";

interface ColorPalette {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  radius: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
}

interface ThemeEditorProps {
  colorPalette?: ColorPalette;
  onColorChange?: (key: keyof ColorPalette, value: string) => void;
  onFontChange?: (fontFamily: string) => void;
}

const FONT_OPTIONS = [
  { label: "DM Sans", value: "DM Sans, sans-serif" },
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Poppins", value: "Poppins, sans-serif" },
  { label: "Roboto", value: "Roboto, sans-serif" },
  { label: "Plus Jakarta Sans", value: "Plus Jakarta Sans, sans-serif" },
  { label: "Space Grotesk", value: "Space Grotesk, sans-serif" },
  { label: "Outfit", value: "Outfit, sans-serif" },
  { label: "Bricolage Grotesque", value: "Bricolage Grotesque, sans-serif" },
];

const COLOR_GROUPS = [
  {
    title: "Core Colors",
    colors: [
      { key: "background", label: "Background" },
      { key: "foreground", label: "Foreground" },
      { key: "primary", label: "Primary" },
      { key: "primaryForeground", label: "Primary Text" },
      { key: "secondary", label: "Secondary" },
      { key: "secondaryForeground", label: "Secondary Text" },
    ],
  },
  {
    title: "Surface Colors",
    colors: [
      { key: "card", label: "Card" },
      { key: "cardForeground", label: "Card Text" },
      { key: "muted", label: "Muted" },
      { key: "mutedForeground", label: "Muted Text" },
      { key: "accent", label: "Accent" },
      { key: "accentForeground", label: "Accent Text" },
    ],
  },
  {
    title: "Utility Colors",
    colors: [
      { key: "border", label: "Border" },
      { key: "input", label: "Input" },
      { key: "ring", label: "Ring" },
      { key: "destructive", label: "Destructive" },
      { key: "destructiveForeground", label: "Destructive Text" },
    ],
  },
  {
    title: "Chart Colors",
    colors: [
      { key: "chart1", label: "Chart 1" },
      { key: "chart2", label: "Chart 2" },
      { key: "chart3", label: "Chart 3" },
      { key: "chart4", label: "Chart 4" },
      { key: "chart5", label: "Chart 5" },
    ],
  },
];

// Default dark theme
const DEFAULT_PALETTE: ColorPalette = {
  background: "#1c1917",
  foreground: "#f5f5f4",
  card: "#292524",
  cardForeground: "#f5f5f4",
  popover: "#292524",
  popoverForeground: "#f5f5f4",
  primary: "#6366f1",
  primaryForeground: "#faf7f5",
  secondary: "#4f46e5",
  secondaryForeground: "#ffffff",
  muted: "#1f1c1a",
  mutedForeground: "#d6d3d1",
  accent: "#4338ca",
  accentForeground: "#e0f2fe",
  destructive: "#ef4444",
  destructiveForeground: "#ffffff",
  border: "#44403c",
  input: "#44403c",
  ring: "#6366f1",
  radius: "0.5rem",
  chart1: "#6366f1",
  chart2: "#8b5cf6",
  chart3: "#a855f7",
  chart4: "#f7d76a",
  chart5: "#e89b3f",
};

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5">
      <label className="text-xs text-white/70 flex-1 truncate">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-20 px-2 py-1 text-xs bg-zinc-800/50 border border-zinc-700/50 rounded text-white/90 font-mono focus:outline-none focus:border-indigo-500/50"
        />
        <div className="relative">
          <input
            type="color"
            value={value.startsWith("#") ? value : "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border border-zinc-700/50 bg-transparent"
            style={{ 
              backgroundColor: value,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-zinc-800/50 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-2.5 text-xs font-medium text-white/80 hover:text-white/95 transition-colors"
      >
        {title}
        {isOpen ? (
          <ChevronUp className="w-3.5 h-3.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
      </button>
      {isOpen && <div className="pb-3">{children}</div>}
    </div>
  );
}

export function ThemeEditor({
  colorPalette,
  onColorChange,
  onFontChange,
}: ThemeEditorProps) {
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[0].value);
  const palette = colorPalette || DEFAULT_PALETTE;

  const handleFontChange = useCallback(
    (value: string) => {
      setSelectedFont(value);
      onFontChange?.(value);
    },
    [onFontChange]
  );

  const handleColorChange = useCallback(
    (key: keyof ColorPalette, value: string) => {
      onColorChange?.(key, value);
    },
    [onColorChange]
  );

  return (
    <div className="relative flex flex-col h-full font-sans bg-zinc-900/20 backdrop-blur-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800/50 bg-zinc-900/20 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <h2 className="text-sm font-medium text-white/90">Theme</h2>
        </div>
        <p className="text-[11px] text-white/50 mt-1">
          Customize colors and typography
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-600/30 scrollbar-track-transparent">
        {/* Font Selection */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Type className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-medium text-white/80">Typography</span>
          </div>
          <select
            value={selectedFont}
            onChange={(e) => handleFontChange(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white/90 focus:outline-none focus:border-indigo-500/50 transition-colors cursor-pointer"
          >
            {FONT_OPTIONS.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
        </div>

        {/* Color Palette */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-medium text-white/80">Color Palette</span>
          </div>

          {COLOR_GROUPS.map((group, idx) => (
            <CollapsibleSection
              key={group.title}
              title={group.title}
              defaultOpen={idx === 0}
            >
              {group.colors.map((color) => (
                <ColorPicker
                  key={color.key}
                  label={color.label}
                  value={palette[color.key as keyof ColorPalette] || "#000000"}
                  onChange={(value) =>
                    handleColorChange(color.key as keyof ColorPalette, value)
                  }
                />
              ))}
            </CollapsibleSection>
          ))}
        </div>
      </div>

      {/* Quick Presets Footer */}
      <div className="p-4 border-t border-zinc-800/50 bg-zinc-900/20 backdrop-blur-sm">
        <p className="text-[11px] text-white/50 mb-2">Quick Presets</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              // Dark preset
              handleColorChange("background", "#1c1917");
              handleColorChange("foreground", "#f5f5f4");
              handleColorChange("card", "#292524");
              handleColorChange("primary", "#6366f1");
            }}
            className="flex-1 px-3 py-2 text-xs bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/50 rounded-lg text-white/80 hover:text-white transition-all"
          >
            Dark
          </button>
          <button
            onClick={() => {
              // Light preset
              handleColorChange("background", "#ffffff");
              handleColorChange("foreground", "#1c1917");
              handleColorChange("card", "#f5f5f4");
              handleColorChange("primary", "#6366f1");
            }}
            className="flex-1 px-3 py-2 text-xs bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/50 rounded-lg text-white/80 hover:text-white transition-all"
          >
            Light
          </button>
          <button
            onClick={() => {
              // Ocean preset
              handleColorChange("background", "#0f172a");
              handleColorChange("foreground", "#e2e8f0");
              handleColorChange("card", "#1e293b");
              handleColorChange("primary", "#0ea5e9");
            }}
            className="flex-1 px-3 py-2 text-xs bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/50 rounded-lg text-white/80 hover:text-white transition-all"
          >
            Ocean
          </button>
        </div>
      </div>
    </div>
  );
}
