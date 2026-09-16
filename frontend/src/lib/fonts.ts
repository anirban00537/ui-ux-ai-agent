// Google Fonts mapping - using Google Fonts CDN for cards
export const GOOGLE_FONTS = {
  Inter: "'Inter', system-ui, sans-serif",
  Poppins: "'Poppins', system-ui, sans-serif",
  Roboto: "'Roboto', system-ui, sans-serif",
  "Open Sans": "'Open Sans', system-ui, sans-serif",
  Montserrat: "'Montserrat', system-ui, sans-serif",
  Lato: "'Lato', system-ui, sans-serif",
  "Playfair Display": "'Playfair Display', serif",
  Merriweather: "'Merriweather', serif",
  Raleway: "'Raleway', system-ui, sans-serif",
  Ubuntu: "'Ubuntu', system-ui, sans-serif",
  "Great Vibes": "'Great Vibes', cursive",
  "Dancing Script": "'Dancing Script', cursive",
  Caveat: "'Caveat', cursive",
  "Abril Fatface": "'Abril Fatface', serif",
  Lora: "'Lora', serif",
  "Space Grotesk": "'Space Grotesk', system-ui, sans-serif",
  Outfit: "'Outfit', system-ui, sans-serif",
  "DM Sans": "'DM Sans', system-ui, sans-serif",
  "Plus Jakarta Sans": "'Plus Jakarta Sans', system-ui, sans-serif",
  Manrope: "'Manrope', system-ui, sans-serif",
  "Work Sans": "'Work Sans', system-ui, sans-serif",
  Sora: "'Sora', system-ui, sans-serif",
  Geist: "'Geist', system-ui, sans-serif",
  "Clash Display": "'Clash Display', system-ui, sans-serif",
  "JetBrains Mono": "'JetBrains Mono', monospace",
} as const;

export type FontName = keyof typeof GOOGLE_FONTS;

export const getFontFamily = (fontName: FontName | string): string => {
  if (fontName in GOOGLE_FONTS) {
    return GOOGLE_FONTS[fontName as FontName];
  }
  // Fallback for custom fonts or legacy format
  return fontName || GOOGLE_FONTS.Inter;
};
