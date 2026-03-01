"use client";

import React from "react";
import { ColorPalette } from "@/store/slices/designEditorSlice";
import { ColorPickerInput } from "./ColorPickerInput";
import { FontSelector } from "./FontSelector";
import { ThemeSection } from "./ThemeSection";
import { RotateCcw, Palette } from "lucide-react";

interface ThemePanelProps {
  colorPalette?: ColorPalette;
  onColorChange: (key: keyof ColorPalette, value: string) => void;
  onFontChange: (font: string) => void;
  currentFont?: string;
  onResetTheme?: () => void;
}

export function ThemePanel({
  colorPalette,
  onColorChange,
  onFontChange,
  currentFont,
  onResetTheme
}: ThemePanelProps) {
  if (!colorPalette) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 opacity-70">
        <Palette className="w-10 h-10 text-slate-300" />
        <p className="text-[14px] font-bold text-[#0a0f1c]">No theme loaded</p>
        <p className="text-[12px] text-slate-500 font-medium">Generate a design to customize its theme.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white custom-scrollbar overflow-y-auto pb-20">
      {/* Reset Header */}
      <div className="p-5 border-b border-black/[0.04] sticky top-0 bg-white/95 backdrop-blur z-10 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Theme Settings
          </h3>
          {onResetTheme && (
            <button
              onClick={onResetTheme}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
              title="Reset to Original Theme"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-[12px] text-slate-500 font-medium leading-relaxed">
          Customize your app's visual identity. Changes are applied automatically.
        </p>
      </div>

      <div className="p-4 space-y-6">
        {/* Typography */}
        <ThemeSection title="Typography" defaultOpen={true}>
          <FontSelector
            value={currentFont || colorPalette.fontFamily || "Inter"}
            onChange={onFontChange}
          />
        </ThemeSection>

        {/* Colors */}
        <ThemeSection title="Base Colors" defaultOpen={true}>
          <ColorPickerInput
            label="Background"
            value={colorPalette.background}
            onChange={(v) => onColorChange("background", v)}
          />
          <ColorPickerInput
            label="Foreground (Text)"
            value={colorPalette.foreground}
            onChange={(v) => onColorChange("foreground", v)}
          />
        </ThemeSection>

        <ThemeSection title="Primary Brand" defaultOpen={true}>
          <ColorPickerInput
            label="Primary Color"
            value={colorPalette.primary}
            onChange={(v) => onColorChange("primary", v)}
          />
          <ColorPickerInput
            label="Primary Text"
            value={colorPalette.primaryForeground}
            onChange={(v) => onColorChange("primaryForeground", v)}
          />
        </ThemeSection>

        <ThemeSection title="Secondary / Accent">
          <ColorPickerInput
            label="Secondary Color"
            value={colorPalette.secondary}
            onChange={(v) => onColorChange("secondary", v)}
          />
          <ColorPickerInput
            label="Secondary Text"
            value={colorPalette.secondaryForeground}
            onChange={(v) => onColorChange("secondaryForeground", v)}
          />
        </ThemeSection>

        <ThemeSection title="Cards & Components">
          <ColorPickerInput
            label="Card Background"
            value={colorPalette.card}
            onChange={(v) => onColorChange("card", v)}
          />
          <ColorPickerInput
            label="Card Text"
            value={colorPalette.cardForeground}
            onChange={(v) => onColorChange("cardForeground", v)}
          />
          <ColorPickerInput
            label="Muted Text"
            value={colorPalette.mutedForeground}
            onChange={(v) => onColorChange("mutedForeground", v)}
          />
        </ThemeSection>

        <ThemeSection title="UI Elements">
          <ColorPickerInput
            label="Borders"
            value={colorPalette.border}
            onChange={(v) => onColorChange("border", v)}
          />
          <ColorPickerInput
            label="Inputs / Forms"
            value={colorPalette.input}
            onChange={(v) => onColorChange("input", v)}
          />
        </ThemeSection>
      </div>
    </div>
  );
}
