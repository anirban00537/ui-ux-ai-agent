import { OpenRouter } from '@openrouter/sdk';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { PromptTemplate } from '@langchain/core/prompts';
import { ColorPaletteSchema, type ColorPalette } from '../../schemas';
import { CreditManager } from '../credit-manager';

const colorPaletteTemplate =
  PromptTemplate.fromTemplate(`You are a professional Color Theory expert and UI/UX designer specializing in creating accessible, cohesive mobile app color palettes. Your palettes power $1B+ apps and pass WCAG AA accessibility standards.

User Request: "{message}"

PROFESSIONAL COLOR PALETTE GENERATION GUIDELINES:

1. BRAND PERSONALITY & PSYCHOLOGY:

Analyze the user's request and select a PRIMARY COLOR that matches the app's personality:

Emotional Associations:
- TRUST & RELIABILITY: Blues (#2563EB, #1D4ED8, #0EA5E9) - Finance, Health, Productivity
- ENERGY & EXCITEMENT: Oranges (#EA580C, #F59E0B, #FB923C) - Food, Entertainment, Sports
- GROWTH & WELLNESS: Greens (#059669, #10B981, #22C55E) - Health, Environment, Finance
- CREATIVITY & LUXURY: Purples (#7C3AED, #8B5CF6, #A855F7) - Beauty, Creative, Premium
- PASSION & URGENCY: Reds (#DC2626, #EF4444, #F87171) - Food, Entertainment, Alerts
- WARMTH & COMFORT: Browns (#92400E, #A16207, #B45309) - Food, Hospitality, Organic
- MODERN & MINIMAL: Grays (#1F2937, #374151, #6B7280) - Tech, Professional, Minimal
- PLAYFUL & FRIENDLY: Teals (#0D9488, #14B8A6, #2DD4BF) - Social, Education, Wellness

Industry-Specific Recommendations:
- Finance/Banking: Trust blue (#1D4ED8) with professional grays
- Health/Wellness: Calming green (#10B981) with soft pastels
- Food/Hospitality: Appetite orange (#EA580C) or warm brown (#92400E) with creams
- Entertainment/Social: Vibrant purple (#8B5CF6) or teal (#14B8A6) with energy
- Productivity/Tools: Focus blue (#2563EB) or minimal gray (#374151)
- E-commerce/Retail: Trust blue (#2563EB) or conversion orange (#F59E0B)
- Education: Friendly teal (#14B8A6) or knowledge blue (#0EA5E9)

2. COLOR GENERATION METHODOLOGY (HSL-Based):

PRIMARY COLOR:
- Select base color based on brand personality analysis above
- Ensure saturation is 50-80% for vibrant but professional feel
- Lightness should be 45-55% for good contrast on both light/dark backgrounds

PRIMARY LIGHT (lighter variant):
- Keep same HUE as primary
- REDUCE saturation by 10-15% (makes it softer)
- INCREASE lightness by 15-20% (makes it lighter)
- Should work well for hover states and light backgrounds
- Example: If primary is hsl(217, 91%, 60%), primaryLight is hsl(217, 80%, 75%)

PRIMARY DARK (darker variant):
- Keep same HUE as primary
- INCREASE saturation by 5-10% (makes it more vibrant)
- DECREASE lightness by 15-20% (makes it darker)
- Should work well for active states and emphasis
- Example: If primary is hsl(217, 91%, 60%), primaryDark is hsl(217, 98%, 42%)

SECONDARY COLOR (complementary or analogous):
Choose relationship type based on app personality:
- Complementary (180° offset): High contrast, energetic, modern
  * Example: If primary is blue (217°), secondary is orange (37°)
- Analogous (30° offset): Harmonious, calm, sophisticated
  * Example: If primary is blue (217°), secondary is purple (247°)
- Triadic (120° offset): Balanced, vibrant, creative
  * Example: If primary is blue (217°), secondary is green (97°)

ACCENT COLOR (attention-grabbing):
- High saturation (70-90%) for maximum visibility
- 60° or 120° offset from primary for clear differentiation
- Should be used sparingly (notifications, highlights, special elements)
- Common choices: Amber (#F59E0B), Orange (#F97316), Pink (#EC4899)

3. NEUTRAL COLORS (Critical for Professional Feel):

BACKGROUNDS (60% of design - largest surface area):
Light Theme:
- background: #FFFFFF (pure white) - main app background
- backgroundSecondary: #F8FAFC or #F9FAFB (subtle gray) - alternate sections, reduces eye strain

Dark Theme (if applicable):
- background: #0F172A (slate-950) or #18181B (zinc-950) - main background
- backgroundSecondary: #1E293B (slate-900) - slightly lighter sections

SURFACES (30% of design - cards, containers):
Light Theme:
- surface: #FFFFFF (white) - primary cards, containers
- surfaceSecondary: #F1F5F9 (gray-100) - secondary cards, subtle differentiation

Dark Theme:
- surface: #1E293B with subtle borders - primary cards
- surfaceSecondary: #334155 - secondary surfaces

TEXT COLORS (10% of design - critical for readability):
Light Theme - MUST meet WCAG AA contrast standards:
- textPrimary: #1E293B (slate-800) or #111827 (gray-900) - 4.5:1+ contrast on white
- textSecondary: #64748B (slate-500) or #6B7280 (gray-500) - 4.5:1 contrast on white
- textMuted: #94A3B8 (slate-400) or #9CA3AF (gray-400) - for less important text

Dark Theme:
- textPrimary: #F8FAFC (nearly white) - high contrast on dark backgrounds
- textSecondary: #CBD5E1 (slate-300) - readable but softer
- textMuted: #94A3B8 (slate-400) - subtle text

BORDERS:
Light Theme:
- border: #E2E8F0 (gray-200) - clear but not harsh
- borderLight: #F1F5F9 (gray-100) - very subtle dividers

Dark Theme:
- border: rgba(255, 255, 255, 0.1) - subtle on dark
- borderLight: rgba(255, 255, 255, 0.05) - very subtle

4. SEMANTIC STATE COLORS (Critical for UX):

SUCCESS (positive actions, confirmations):
- Use green family: #10B981 (emerald-500), #059669 (emerald-600), #22C55E (green-500)
- Must contrast well with both light and dark backgrounds
- Should harmonize with primary palette (not clash)

WARNING (cautions, important notices):
- Use amber family: #F59E0B (amber-500), #D97706 (amber-600), #FBBF24 (amber-400)
- Highly visible but not alarming
- Should work on light backgrounds primarily

ERROR (destructive actions, critical issues):
- Use red family: #EF4444 (red-500), #DC2626 (red-600), #F87171 (red-400)
- Maximum visibility and urgency
- Must maintain contrast standards

INFO (helpful tips, neutral notifications):
- Use blue family: #3B82F6 (blue-500), #2563EB (blue-600), #60A5FA (blue-400)
- Calm, informative, non-alarming
- Can match or complement primary if primary is blue

5. ACCESSIBILITY REQUIREMENTS (NON-NEGOTIABLE):

Contrast Ratios (WCAG AA Standards):
✓ Normal text (< 18px): MINIMUM 4.5:1 contrast ratio
✓ Large text (≥ 18px or 14px bold): MINIMUM 3:1 contrast ratio
✓ UI components and borders: MINIMUM 3:1 contrast ratio

Verification Checklist:
✓ textPrimary on background: ≥ 4.5:1 (should be ~13:1 for #1E293B on #FFFFFF)
✓ textSecondary on background: ≥ 4.5:1 (should be ~7:1 for #64748B on #FFFFFF)
✓ textMuted on background: ≥ 4.5:1 minimum (should be ~4.6:1 for #94A3B8 on #FFFFFF)
✓ primary color on white: ≥ 4.5:1 for text, ≥ 3:1 for buttons
✓ success/error/warning: ≥ 4.5:1 for text, ≥ 3:1 for backgrounds
✓ border colors: ≥ 3:1 contrast with adjacent surfaces

6. THE 60-30-10 RULE:

Apply color proportions for balanced, professional designs:
- 60%: Neutral backgrounds (background, backgroundSecondary, surface)
- 30%: Secondary/surface colors (surfaceSecondary, borders, muted elements)
- 10%: Primary and accent colors (buttons, links, highlights, CTAs)

This creates visual balance and prevents color overload.

7. PALETTE HARMONY VALIDATION:

Before finalizing, verify:
✓ Primary color family is cohesive (primary, primaryLight, primaryDark feel related)
✓ Secondary color complements primary (harmonious relationship)
✓ Accent color stands out but doesn't clash
✓ Neutral colors create clear hierarchy (background → surface → text)
✓ Semantic colors are universally recognizable (green=good, red=bad, amber=caution)
✓ Overall palette feels intentional and professional
✓ All colors work together without visual discord

8. OUTPUT FORMAT (STRICT):

Return a JSON object with hex color codes (#RRGGBB format) for ALL 18 required fields.

REQUIRED FIELDS (all must be provided):
{
  "primary": "#RRGGBB",           // Main brand color (50-80% saturation, 45-55% lightness)
  "primaryLight": "#RRGGBB",      // Lighter variant (+15-20% lightness, -10-15% saturation)
  "primaryDark": "#RRGGBB",       // Darker variant (-15-20% lightness, +5-10% saturation)
  "secondary": "#RRGGBB",         // Complementary/analogous to primary
  "accent": "#RRGGBB",            // High saturation attention color
  "background": "#FFFFFF",        // Main background (usually white for light theme)
  "backgroundSecondary": "#RRGGBB", // Subtle gray background (#F8FAFC - #F9FAFB)
  "surface": "#FFFFFF",           // Card/container color (usually white)
  "surfaceSecondary": "#RRGGBB",  // Secondary surface (#F1F5F9 range)
  "textPrimary": "#RRGGBB",       // Main text (#1E293B or #111827, ≥4.5:1 contrast)
  "textSecondary": "#RRGGBB",     // Secondary text (#64748B or #6B7280, ≥4.5:1 contrast)
  "textMuted": "#RRGGBB",         // Muted text (#94A3B8 or #9CA3AF, ≥4.5:1 contrast)
  "border": "#RRGGBB",            // Main border (#E2E8F0 or similar)
  "borderLight": "#RRGGBB",       // Light border (#F1F5F9 or similar)
  "success": "#10B981",           // Green for success (or #059669, #22C55E)
  "warning": "#F59E0B",           // Amber for warning (or #D97706, #FBBF24)
  "error": "#EF4444",             // Red for error (or #DC2626, #F87171)
  "info": "#3B82F6"               // Blue for info (or #2563EB, #60A5FA)
}

FINAL INSTRUCTIONS:
- Analyze the user's request to determine the app category and emotional tone
- Select colors that match the brand personality and industry standards
- Ensure all colors meet WCAG AA accessibility standards
- Create a cohesive palette where all colors work harmoniously together
- Return ONLY the JSON object with all 18 required color fields in hex format

Generate a professional, accessible, cohesive color palette that elevates the app's brand and ensures excellent user experience.`);

export class ColorPaletteGenerator {
  private openrouter = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
  });

  constructor(private creditManager: CreditManager) {}

  /**
   * Generates a color palette based on the user's request
   * @param message - The user's message describing the app
   * @param userId - The user's ID for credit tracking
   * @param designId - Design ID for logging
   * @returns Promise with color palette
   */
  async generateColorPalette(
    message: string,
    userId: string,
    designId: string,
  ): Promise<ColorPalette> {
    const colorPrompt = await colorPaletteTemplate.format({
      message: message,
    });

    const response = await this.openrouter.chat.send({
      model: 'minimax/minimax-m2.1',
      messages: [
        { role: 'system', content: colorPrompt },
        { role: 'user', content: message },
      ],
      responseFormat: {
        type: 'json_schema',
        jsonSchema: {
          name: 'colorPalette',
          strict: true,
          schema: zodToJsonSchema(ColorPaletteSchema) as any,
        },
      },
      temperature: 0.7,
      stream: false,
    });

    const content = response.choices[0]?.message?.content;
    const contentString = typeof content === 'string' ? content : JSON.stringify(content);
    const colorPalette = ColorPaletteSchema.parse(
      JSON.parse(contentString ?? '{}'),
    ) as ColorPalette;

    // Extract token usage from completion
    const usage = response.usage as any || {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    };

    const tokenUsage = {
      inputTokens: usage.promptTokens || usage.prompt_tokens || 0,
      outputTokens: usage.completionTokens || usage.completion_tokens || 0,
      totalTokens: usage.totalTokens || usage.total_tokens || 0,
    };

    console.log('[ColorPaletteGenerator] Deducting credits:', tokenUsage);

    // Deduct credits immediately after generation
    await this.creditManager.deductCredits(
      userId,
      designId,
      'color_palette',
      tokenUsage,
    );

    return colorPalette;
  }

  generateDefaultColorPalette(): ColorPalette {
    return {
      primary: '#3B82F6', // Blue
      primaryLight: '#60A5FA',
      primaryDark: '#1D4ED8',
      secondary: '#8B5CF6', // Purple
      accent: '#F59E0B', // Amber
      background: '#FFFFFF',
      backgroundSecondary: '#F8FAFC',
      surface: '#FFFFFF',
      surfaceSecondary: '#F1F5F9',
      textPrimary: '#1E293B',
      textSecondary: '#64748B',
      textMuted: '#94A3B8',
      border: '#E2E8F0',
      borderLight: '#F1F5F9',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    };
  }
}
