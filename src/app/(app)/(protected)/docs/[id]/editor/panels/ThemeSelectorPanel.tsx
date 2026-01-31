import React, { useEffect, useState, useCallback, useRef, memo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectTheme,
  setTheme,
  Theme,
  DEFAULT_THEME,
} from "@/store/slices/cardsSlice";
import { X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getAdminThemes } from "@/services/themes";
import { applyCardStylePreset } from "@/lib/editor/card-styles";
import { GOOGLE_FONT_NAMES } from "@/lib/constants";
import { trackEvent } from "@/components/analytics/trackEvent";

// Pattern options as a const array for type safety
const PATTERN_OPTIONS = [
  "none", "gaussian", "fractal", "fluid", "prism", "beams", 
  "aurora", "nebula", "ether", "lumina", "horizon", "pulse", 
  "vortex", "echo", "apex", "arch"
] as const;

type PatternOption = typeof PATTERN_OPTIONS[number];

interface ThemeSelectorPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// API theme response type
interface ApiTheme {
  name?: string;
  themeData?: Theme;
}

export const ThemeSelectorPanel = memo(function ThemeSelectorPanel({ isOpen, onClose }: ThemeSelectorPanelProps) {
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const isDark = currentTheme.themeType === "dark";
  const [themes, setThemes] = useState<Array<{ name: string; theme: Theme }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"presets" | "customize">("presets");

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        setIsLoading(true);
        const response = await getAdminThemes();

        if (
          response.success &&
          response.data?.list &&
          Array.isArray(response.data.list)
        ) {
          const themePalettes = response.data.list
            .map((theme: ApiTheme) => {
              const themeDataObj = (theme.themeData as Theme) || {};
              const themeData: Theme = {
                ...DEFAULT_THEME,
                ...themeDataObj,
              };

              return {
                name: theme.name || "Unnamed Theme",
                theme: themeData,
              };
            })
            .filter((palette) => palette && palette.theme && palette.name);

          if (themePalettes.length > 0) {
            setThemes(themePalettes);
          } else {
            setThemes([{ name: "Default", theme: DEFAULT_THEME }]);
          }
        } else {
          setThemes([{ name: "Default", theme: DEFAULT_THEME }]);
        }
      } catch (error) {
        console.error("Failed to fetch themes:", error);
        setThemes([{ name: "Default", theme: DEFAULT_THEME }]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchThemes();
    }
  }, [isOpen]);

  const panelVariants = {
    hidden: { opacity: 0, x: 20, scale: 0.98 },
    visible: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: 20, scale: 0.98 },
  };

  if (!isOpen) return null;

  const handleThemeSelect = (selectedTheme: Theme) => {
    dispatch(setTheme(selectedTheme));
  };

  // Debounced theme update for high-frequency changes (cardrs)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const updateThemeProperty = useCallback((updates: Partial<Theme>) => {
    dispatch(setTheme({ ...currentTheme, ...updates }));
  }, [dispatch, currentTheme]);

  // Debounced version for cardr changes
  const debouncedUpdateThemeProperty = useCallback((updates: Partial<Theme>) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      dispatch(setTheme({ ...currentTheme, ...updates }));
    }, 50); // 50ms debounce for smooth cardr updates
  }, [dispatch, currentTheme]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const isThemeActive = (paletteTheme: Theme) => {
    return (
      paletteTheme.primary === currentTheme.primary &&
      paletteTheme.headingColor === currentTheme.headingColor &&
      paletteTheme.bodyColor === currentTheme.bodyColor &&
      paletteTheme.cardBackground === currentTheme.cardBackground &&
      paletteTheme.pageBackground === currentTheme.pageBackground
    );
  };

  const cardStyleOptions = [
    { id: "standard", label: "Standard", desc: "Subtle rounding and shadows" },
    { id: "flat", label: "Flat", desc: "Clean design with no borders" },
    { id: "outline", label: "Outline", desc: "Outlined boxes with hard edges" },
    { id: "sharp", label: "Sharp", desc: "Flat design with sharp edges" },
    { id: "blocky", label: "Blocky", desc: "Square cards with a 3D effect" },
    { id: "glass", label: "Glass", desc: "Soft and transparent" },
    { id: "rounded", label: "Rounded", desc: "Gentle, inviting corners" },
    { id: "soft-cloud", label: "Soft Cloud", desc: "Soft shadows with subtle contrast" },
    { id: "capsule", label: "Capsule", desc: "Rounded corners with playful blocks" },
  ];

  const CardrControl = memo(function CardrControl({ 
    label, 
    value, 
    onChange, 
    min = 0, 
    max, 
    step = 1, 
    unit = "",
    isDark 
  }: { 
    label: string, 
    value: number, 
    onChange: (val: number) => void, 
    min?: number, 
    max: number, 
    step?: number, 
    unit?: string,
    isDark: boolean
  }) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label 
            className="text-[10px] font-bold opacity-50 uppercase tracking-wider" 
            style={{ color: isDark ? "#fff" : "#000" }}
            id={`cardr-label-${label.replace(/\s+/g, '-').toLowerCase()}`}
          >
            {label}
          </label>
          <div className="px-1.5 py-0.5 rounded bg-neutral-500/10 text-[10px] font-mono opacity-80" style={{ color: isDark ? "#fff" : "#000" }}>
            {value}{unit}
          </div>
        </div>
        <input 
          type="range" 
          min={min} 
          max={max} 
          step={step} 
          value={value} 
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-neutral-500/10 rounded-lg appearance-none cursor-pointer accent-primary border-none outline-none" 
          aria-labelledby={`cardr-label-${label.replace(/\s+/g, '-').toLowerCase()}`}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
        />
      </div>
    );
  });

  const parsePx = (val: string | undefined, fallback = 0): number => {
    if (!val) return fallback;
    if (typeof val === 'number') return val;
    return parseInt(val.replace("px", "")) || 0;
  };

  const getPreviewStyles = (styleId: string): React.CSSProperties => {
    const primary = currentTheme.primary;
    switch (styleId) {
      case "standard": return { borderRadius: "4px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", border: "1px solid rgba(0,0,0,0.05)" };
      case "flat": return { borderRadius: "3px", border: "none" };
      case "outline": return { borderRadius: "2px", border: `1.5px solid ${primary}` };
      case "sharp": return { borderRadius: "0px", border: "1px solid rgba(0,0,0,0.1)" };
      case "blocky": return { borderRadius: "0px", boxShadow: `2px 2px 0px ${primary}`, border: `1.5px solid ${primary}` };
      case "glass": return { borderRadius: "4px", backgroundColor: "rgba(255,255,255,0.4)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.5)" };
      case "rounded": return { borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.05)" };
      case "soft-cloud": return { borderRadius: "6px", boxShadow: "0 4px 10px rgba(0,0,0,0.05)", border: "none" };
      case "capsule": return { borderRadius: "14px", boxShadow: `2px 2px 0px ${primary}`, border: `1.5px solid ${primary}` };
      default: return {};
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="theme-panel"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={panelVariants}
          transition={{ duration: 0.15 }}
          className="relative z-40"
        >
          <div
            className={`relative w-80 max-h-[70vh] flex flex-col rounded-2xl overflow-hidden backdrop-blur-xl border shadow-2xl ${
              isDark ? "bg-[#1a1a1f]/95 border-white/10" : "bg-white/95 border-black/10"
            }`}
          >
            {/* Header */}
            <div className="px-4 pt-4 pb-2">
              <div className="flex items-center justify-between mb-4">
                <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-black"}`}>
                  Design & Theme
                </span>
                <button
                  onClick={onClose}
                  className={`p-1.5 rounded-lg transition-all ${isDark ? "text-white/40 hover:text-white hover:bg-white/10" : "text-black/40 hover:text-black hover:bg-black/5"}`}
                  aria-label="Close theme panel"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Tab Switcher */}
              <div className={`flex p-1 rounded-xl gap-1 mb-2 ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                <button
                  onClick={() => {
                    trackEvent('theme_tab_switch', 'engagement', 'presets');
                    setActiveTab("presets");
                  }}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    activeTab === "presets" 
                      ? isDark ? "bg-white/10 shadow-sm text-white" : "bg-white shadow-sm text-black"
                      : isDark ? "text-white/50 hover:text-white/70" : "text-black/50 hover:text-black/70"
                  }`}
                >
                  Presets
                </button>
                <button
                  onClick={() => {
                    trackEvent('theme_tab_switch', 'engagement', 'customize');
                    setActiveTab("customize");
                  }}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    activeTab === "customize" 
                      ? isDark ? "bg-white/10 shadow-sm text-white" : "bg-white shadow-sm text-black"
                      : isDark ? "text-white/50 hover:text-white/70" : "text-black/50 hover:text-black/70"
                  }`}
                >
                  Customize
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-4 pb-6 custom-scrollbar-dark">
              {activeTab === "presets" ? (
                /* THEMES LIST */
                <div className="space-y-1 py-2">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-40">
                      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: isDark ? "#fff" : "#000", borderTopColor: "transparent" }} />
                      <span className="text-xs" style={{ color: isDark ? "#fff" : "#000" }}>Loading palettes...</span>
                    </div>
                  ) : themes.map((palette, index) => {
                    const isActive = isThemeActive(palette.theme);
                    return (
                      <motion.button
                        key={`${palette.name}-${index}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        onClick={() => {
                          trackEvent('theme_preset_select', 'engagement', palette.name);
                          handleThemeSelect(palette.theme);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl transition-all"
                        style={{
                          backgroundColor: isActive ? `${currentTheme.primary}15` : "transparent",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-1.5">
                            <div className="w-5 h-5 rounded-full border-2" style={{ backgroundColor: palette.theme.pageBackground, borderColor: isDark ? "#000" : "#fff" }} />
                            <div className="w-5 h-5 rounded-full border-2" style={{ backgroundColor: palette.theme.primary, borderColor: isDark ? "#000" : "#fff" }} />
                            {(palette.theme.secondaryColors || []).map((color, colorIndex) => (
                              <div 
                                key={colorIndex}
                                className="w-5 h-5 rounded-full border-2" 
                                style={{ backgroundColor: color, borderColor: isDark ? "#000" : "#fff" }} 
                              />
                            ))}
                          </div>
                          <span className="text-xs font-medium" style={{ color: isDark ? "#e5e7eb" : "#374151" }}>{palette.name}</span>
                        </div>
                        {isActive && <Check size={14} style={{ color: currentTheme.primary }} />}
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                /* CUSTOMIZATION CONTROLS */
                <div className="py-2 space-y-6">
                  {/* Card Design Section */}
                  <div className="space-y-4">
                    <label className="text-[11px] uppercase tracking-wider font-bold opacity-50 block" style={{ color: isDark ? "#fff" : "#000" }}>Card Design</label>
                    <div className="grid grid-cols-3 gap-3">
                      {cardStyleOptions.map((opt) => {
                        return (
                          <button
                            key={opt.id}
                            onClick={() => {
                              trackEvent('theme_card_style_select', 'engagement', opt.id);
                              const updatedTheme = applyCardStylePreset(currentTheme, opt.id);
                              dispatch(setTheme(updatedTheme));
                            }}
                            className="group relative flex flex-col items-center gap-2 p-1.5 rounded-2xl transition-all duration-300 hover:bg-neutral-500/5"
                          >
                            <div 
                              className="w-full aspect-[4/3] rounded-lg transition-all duration-300 flex items-center justify-center overflow-hidden border border-transparent"
                              style={{ 
                                backgroundColor: isDark ? "#121216" : "#f8fafc",
                              }}
                            >
                              <div 
                                className="w-[70%] h-[50%] bg-white border border-transparent transition-transform duration-300 group-hover:scale-110" 
                                style={{
                                  ...getPreviewStyles(opt.id),
                                  backgroundColor: opt.id === "glass" ? undefined : (isDark ? "#2a2a35" : "#fff"),
                                  borderColor: (opt.id === "outline" || opt.id === "blocky" || opt.id === "capsule") 
                                    ? currentTheme.primary 
                                    : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)")
                                }}
                              />
                            </div>
                            <div className="flex flex-col items-center">
                              <span className={`text-[10px] font-bold ${isDark ? 'text-white/70' : 'text-neutral-700'}`}>{opt.label}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card Design Pattern */}
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-wider font-bold opacity-50 block" style={{ color: isDark ? "#fff" : "#000" }}>Background Pattern</label>
                    <div className="relative group">
                      <select
                        value={currentTheme.cardDesignPattern || "none"}
                        onChange={(e) => {
                          trackEvent('theme_pattern_change', 'engagement', e.target.value);
                          updateThemeProperty({ cardDesignPattern: e.target.value as PatternOption });
                        }}
                        className={`w-full py-2.5 px-4 text-[12px] appearance-none rounded-xl border transition-all cursor-pointer outline-none ${
                          isDark 
                            ? "bg-neutral-900 border-white/10 text-white hover:border-white/20" 
                            : "bg-white border-black/5 text-black hover:border-black/10"
                        }`}
                        aria-label="Select background pattern"
                      >
                        {PATTERN_OPTIONS.map((pattern) => (
                          <option key={pattern} value={pattern}>
                            {pattern.charAt(0).toUpperCase() + pattern.slice(1)}
                          </option>
                        ))}
                      </select>
                      <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-30 group-hover:opacity-60 transition-opacity`}>
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                    
                    {currentTheme.cardDesignPattern && currentTheme.cardDesignPattern !== "none" && (
                      <div className="pt-2 px-1">
                        <CardrControl 
                          label="Pattern Intensity"
                          value={currentTheme.cardDesignPatternOpacity !== undefined ? Math.round(currentTheme.cardDesignPatternOpacity * 100) : 100}
                          onChange={(val) => debouncedUpdateThemeProperty({ cardDesignPatternOpacity: val / 100 })}
                          min={0}
                          max={100}
                          unit="%"
                          isDark={isDark}
                        />
                      </div>
                    )}
                  </div>

                  {/* Typography Selection */}
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-wider font-bold opacity-50 block" style={{ color: isDark ? "#fff" : "#000" }}>Typography</label>
                    <div className="relative group">
                      <select
                        value={currentTheme.fontFamily || "Inter"}
                        onChange={(e) => {
                          trackEvent('theme_font_change', 'engagement', e.target.value);
                          updateThemeProperty({ fontFamily: e.target.value });
                        }}
                        className={`w-full py-2.5 px-4 text-[12px] appearance-none rounded-xl border transition-all cursor-pointer outline-none ${
                          isDark 
                            ? "bg-neutral-900 border-white/10 text-white hover:border-white/20" 
                            : "bg-white border-black/5 text-black hover:border-black/10"
                        }`}
                        style={{ fontFamily: currentTheme.fontFamily }}
                      >
                        {GOOGLE_FONT_NAMES.map((font: string) => (
                          <option key={font} value={font} style={{ fontFamily: font }}>
                            {font}
                          </option>
                        ))}
                      </select>
                      <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-30 group-hover:opacity-60 transition-opacity`}>
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Granular Controls */}
                  <div className="space-y-4 pt-2 border-t border-neutral-500/10">
                    <label className="text-[11px] uppercase tracking-wider font-bold opacity-50 block" style={{ color: isDark ? "#fff" : "#000" }}>Fine Tuning</label>
                    <div className="p-4 rounded-2xl space-y-5" style={{ backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.03)" }}>
                      <CardrControl 
                        label="Roundness"
                        value={parsePx(currentTheme.cardBorderRadius, 12)}
                        onChange={(val) => debouncedUpdateThemeProperty({ cardBorderRadius: `${val}px` })}
                        max={60}
                        unit="px"
                        isDark={isDark}
                      />

                      <CardrControl 
                        label="Transparency"
                        value={currentTheme.cardOpacity !== undefined ? Math.round(currentTheme.cardOpacity * 100) : 100}
                        onChange={(val) => debouncedUpdateThemeProperty({ cardOpacity: val / 100 })}
                        min={0}
                        max={100}
                        unit="%"
                        isDark={isDark}
                      />

                      <CardrControl 
                        label="Backdrop Blur"
                        value={parsePx(currentTheme.cardBackdropBlur, 0)}
                        onChange={(val) => debouncedUpdateThemeProperty({ cardBackdropBlur: `${val}px` })}
                        max={20}
                        unit="px"
                        isDark={isDark}
                      />

                      <CardrControl 
                        label="Border Width"
                        value={parsePx(currentTheme.cardBorderWidth, 1)}
                        onChange={(val) => debouncedUpdateThemeProperty({ cardBorderWidth: `${val}px` })}
                        max={5}
                        unit="px"
                        isDark={isDark}
                      />

                      <CardrControl 
                        label="Grain Intensity"
                        value={currentTheme.cardNoiseOpacity !== undefined ? Math.round(currentTheme.cardNoiseOpacity * 100) : 0}
                        onChange={(val) => debouncedUpdateThemeProperty({ cardNoiseOpacity: val / 100 })}
                        min={0}
                        max={40}
                        unit="%"
                        isDark={isDark}
                      />

                      <CardrControl 
                        label="Vignette"
                        value={currentTheme.cardVignetteOpacity !== undefined ? Math.round(currentTheme.cardVignetteOpacity * 100) : 0}
                        onChange={(val) => debouncedUpdateThemeProperty({ cardVignetteOpacity: val / 100 })}
                        min={0}
                        max={60}
                        unit="%"
                        isDark={isDark}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
