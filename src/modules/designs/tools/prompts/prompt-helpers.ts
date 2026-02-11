import { ColorPalette } from '../../schemas';

export const THEME_CLASSES_BLOCK = `
STRICT THEME MAPPINGS (use ONLY these Tailwind classes; they map to CSS vars):
- Background: bg-background | Foreground: text-foreground
- Primary: bg-primary | Primary Foreground: text-primary-foreground
- Secondary: bg-secondary | Secondary Foreground: text-secondary-foreground
- Muted Foreground: text-muted-foreground (hints, captions)
- Card: bg-card | Card Foreground: text-card-foreground
- Border: border-border | Input: bg-input, border-input
- Also available: muted (bg-muted, text-muted), accent, destructive, popover, ring, chart-1…chart-5. Use Material Icons: <span class="material-icons">home</span>. (e.g. settings, add, menu, search, person, arrow_back).
- Use Shadcn-style component patterns: rounded-md for buttons/inputs, rounded-lg for cards, inline-flex for buttons, semantic theme classes only.

On bg-primary use text-primary-foreground and primary-foreground icons. On bg-secondary use text-secondary-foreground. On bg-card use text-card-foreground. On images use scrim (bg-black/40) + text-foreground. DO NOT use arbitrary colors (e.g. bg-[#...]). WCAG contrast everywhere.`;

export const generateColorPaletteInstructions = (
  colorPalette?: ColorPalette | null | any,
): string => {
  if (!colorPalette) {
    return `COLOR PALETTE: Use the full theme system: bg-background, text-foreground, bg-primary, text-primary-foreground, bg-secondary, text-secondary-foreground, text-muted-foreground, bg-card, text-card-foreground, border-border, bg-input. On primary/secondary/card use the matching foreground class for text/icons. On images use scrim + text-foreground. DO NOT use arbitrary Tailwind color values (e.g. bg-[#...]).`;
  }

  const themeModeInstruction = colorPalette.themeMode === 'dark' 
    ? "🌑 MODE: DARK. Backgrounds must be dark (slate-950). Text must be light."
    : "☀️ MODE: LIGHT. Backgrounds must be white/slate-50. Text must be dark.";

  return `
${themeModeInstruction}

🎨 ACTIVE COLOR PALETTE (For your visual understanding only - use semantic classes):
- background: ${colorPalette.background}
- foreground: ${colorPalette.foreground}
- primary: ${colorPalette.primary} (BRAND COLOR)
- primaryForeground: ${colorPalette.primaryForeground}
- secondary: ${colorPalette.secondary}
- secondaryForeground: ${colorPalette.secondaryForeground}
- card: ${colorPalette.card}
- cardForeground: ${colorPalette.cardForeground}
- border: ${colorPalette.border}
- mutedForeground: ${colorPalette.mutedForeground}
- input: ${colorPalette.input}

⚠️ CRITICAL RULE: You MUST use the semantic classes (e.g. 'bg-primary'), but knowing the hex code (${colorPalette.primary}) helps you avoid clashing colors.
例如: Since primary is ${colorPalette.primary}, do NOT put it next to a similar color.

${THEME_CLASSES_BLOCK}`;
};

export const generateFontInstructions = (colorPalette?: ColorPalette | null | any): string => {
  const headingFont = colorPalette?.fontHeading || 'Space Grotesk';
  const bodyFont = colorPalette?.fontBody || 'Plus Jakarta Sans';
  
  const googleFontsUrl = `https://fonts.googleapis.com/css2?family=${headingFont.replace(/ /g, '+')}:wght@300;400;500;600;700&family=${bodyFont.replace(/ /g, '+')}:wght@300;400;500;600;700&display=swap`;

  return `
<link href="${googleFontsUrl}" rel="stylesheet">
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
<style>
  .font-heading { font-family: '${headingFont}', sans-serif; }
  .font-sans { font-family: '${bodyFont}', sans-serif; }
</style>
`;
};
