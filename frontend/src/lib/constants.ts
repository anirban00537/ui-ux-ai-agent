export const CARD_MAX_WIDTH = 1000; // Maximum width for cards in pixels

export const GOOGLE_FONT_NAMES = [
  // Sans Serif
  "Albert Sans",
  "Figtree",
  "Geist",
  "Instrument Sans",
  "Inter",
  "Manrope",
  "Open Sans",
  "Outfit",
  "Poppins",
  "Questrial",
  "Rethink Sans",
  "Roboto Condensed",
  "Sora",
  "Space Grotesk",
  // Serif
  "DM Serif Display",
  "EB Garamond",
  "Fanwood Text",
  "Fraunces",
  "Hedvig Letters Serif",
  "Instrument Serif",
  "Cactus Classical Serif",
  "Crimson Text",
] as const;

export type GoogleFont = typeof GOOGLE_FONT_NAMES[number];
