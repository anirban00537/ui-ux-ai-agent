"use client";

import { useState, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import { cn } from "@/lib/utils";
import { HexAlphaColorPicker } from "react-colorful";
import * as Popover from "@radix-ui/react-popover";

interface ColorPickerInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ColorPickerInput({ label, value, onChange, className }: ColorPickerInputProps) {
  // Ensure we have a valid hex starting point. react-colorful needs valid hex.
  const sanitizeHex = (val: string) => {
    if (!val || val === "transparent") return "#000000";
    if (val.startsWith("rgba") || val.startsWith("rgb")) return val; // Should have been converted by parent but safety first
    return val;
  };

  const [localValue, setLocalValue] = useState(sanitizeHex(value));

  const debouncedOnChange = useDebouncedCallback(onChange, 100);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    debouncedOnChange(newValue);
  };

  useEffect(() => {
    if (value) setLocalValue(value);
  }, [value]);

  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      {label && (
        <label className="text-[10px] text-white/50 font-bold uppercase tracking-wide">
          {label.replace(/([A-Z])/g, ' $1').trim()}
        </label>
      )}

      <div className="flex items-center gap-2">
        <Popover.Root>
          <Popover.Trigger asChild>
            <button
              className="w-8 h-8 rounded overflow-hidden border border-white/10 flex-shrink-0 relative group"
              style={{ backgroundColor: localValue }}
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              className="z-[1000001] bg-[#1f2228] border border-white/10 rounded p-3 animate-in fade-in zoom-in duration-200"
              sideOffset={10}
              align="end"
              data-style-panel="true"
            >
              <div className="space-y-3 custom-color-picker">
                <HexAlphaColorPicker
                  color={localValue.startsWith('#') ? localValue : '#000000'}
                  onChange={handleChange}
                />

                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 flex items-center gap-2">
                    <span className="text-[10px] text-white/40 font-mono">HEX</span>
                    <input
                      type="text"
                      value={localValue}
                      onChange={(e) => handleChange(e.target.value)}
                      className="bg-transparent border-none text-[11px] font-mono text-white font-semibold focus:outline-none w-full uppercase"
                    />
                  </div>
                </div>
              </div>
              <Popover.Arrow className="fill-[#1f2228]" />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        <input
          type="text"
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          className="w-24 px-2 py-1.5 text-[11px] font-mono font-semibold bg-white/5 border border-white/10 rounded text-white shadow-sm focus:border-white/20 outline-none uppercase"
          placeholder="#000000"
        />
      </div>

      <style jsx global>{`
        .custom-color-picker .react-colorful {
          width: 200px;
          height: 160px;
          cursor: crosshair;
        }
        .custom-color-picker .react-colorful__saturation {
          border-radius: 8px;
          margin-bottom: 12px;
        }
        .custom-color-picker .react-colorful__hue,
        .custom-color-picker .react-colorful__alpha {
          height: 12px;
          border-radius: 6px;
          margin-bottom: 8px;
        }
        .custom-color-picker .react-colorful__last-control {
          margin-bottom: 0;
        }
        .custom-color-picker .react-colorful__pointer {
          width: 16px;
          height: 16px;
        }
      `}</style>
    </div>
  );
}
