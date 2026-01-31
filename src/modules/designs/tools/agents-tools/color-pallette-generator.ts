import { OpenRouter } from '@openrouter/sdk';
import { PromptTemplate } from '@langchain/core/prompts';
import { type ColorPalette } from '../../schemas';
import { CreditManager } from '../credit-manager';
import { coreConstant } from '../../../../shared/helpers/coreConstant';
import { AiUsageService } from '../../../subscription/services/ai-usage.service';

// JSON Schema for ColorPalette (replaces Zod schema)
const colorPaletteJsonSchema = {
  type: 'object',
  properties: {
    // --- System Design Tokens ---
    background: { type: 'string', description: 'Main page background color' },
    foreground: { type: 'string', description: 'The default text color for the background' },
    card: { type: 'string', description: 'Background color for cards and major containers' },
    cardForeground: { type: 'string', description: 'Text color for text inside cards' },
    popover: { type: 'string', description: 'Background color for popovers and tooltips' },
    popoverForeground: { type: 'string', description: 'Text color for text inside popovers' },
    primary: { type: 'string', description: 'Primary brand color (hex code)' },
    primaryForeground: { type: 'string', description: 'Default text color for elements using primary background' },
    secondary: { type: 'string', description: 'Secondary brand color (hex code)' },
    secondaryForeground: { type: 'string', description: 'Default text color for elements using secondary background' },
    muted: { type: 'string', description: 'Muted background color (e.g. for input fields)' },
    mutedForeground: { type: 'string', description: 'Muted text color' },
    accent: { type: 'string', description: 'Accent color for highlights' },
    accentForeground: { type: 'string', description: 'Text color for elements with accent background' },
    destructive: { type: 'string', description: 'Background color for destructive actions (reds)' },
    destructiveForeground: { type: 'string', description: 'Text color for elements with destructive background' },
    border: { type: 'string', description: 'Main border color' },
    input: { type: 'string', description: 'Border color for input fields' },
    ring: { type: 'string', description: 'Focus ring color' },
    radius: { type: 'string', description: 'Default border radius (e.g. 0.5rem)' },

    // --- Chart Colors ---
    chart1: { type: 'string', description: 'Color for first chart data point' },
    chart2: { type: 'string', description: 'Color for second chart data point' },
    chart3: { type: 'string', description: 'Color for third chart data point' },
    chart4: { type: 'string', description: 'Color for fourth chart data point' },
    chart5: { type: 'string', description: 'Color for fifth chart data point' },
  },
  required: [
    'background', 'foreground', 'card', 'cardForeground', 'popover', 'popoverForeground',
    'primary', 'primaryForeground', 'secondary', 'secondaryForeground', 'muted', 'mutedForeground',
    'accent', 'accentForeground', 'destructive', 'destructiveForeground',
    'border', 'input', 'ring', 'radius',
    'chart1', 'chart2', 'chart3', 'chart4', 'chart5'
  ],
  additionalProperties: false,
};

const colorPaletteTemplate =
  PromptTemplate.fromTemplate(`You are a top-tier Design System Architect. Your goal is to generate a comprehensive, premium, and accessible color palette for a mobile application.

User Request: "{message}"

DESIGN SYSTEM ARCHITECTURE GUIDELINES:

1. THEME VARIABLES (CSS VARIABLE DRIVEN):
Generate a palette that works as a cohesive "Design System as a Runtime".
- "Background" vs "Foreground": Ensure extreme contrast (WCAG AA).
- "Primary" vs "PrimaryForeground": Text must be readable on the primary color.
- "Card" vs "CardForeground": Text must be readable inside cards.
- "Muted": Typically a soft background variant (e.g. #F1F5F9).

2. BRAND PERSONALITY:
{message}

Emotional Associations:
- Trust: Blues, Professional Grays
- Energy: Oranges, Vibrant Reds
- Growth: Emeralds, Soft Greens
- Luxury: Deep Purples, Gold
- Modern: Slate, Zinc, Neutral Pure White

3. COMPONENT-SPECIFIC TOKENS:
- "Ring": Focus state color (usually primary with opacity or lighter).
- "Input": Border color for form fields.
- "Radius": The "Roundness" of the app (e.g. "0.5rem" for modern, "0px" for brutalist).

4. CHART COLORS:
Provide 5 distinct but harmonious colors for data visualization that follow the theme's mood.

5. OUTPUT FORMAT (STRICT):
Return a JSON object with 26+ design system tokens in hex color codes (or rem/px for radius).

Verification Checklist:
✓ All Foreground variants have contrast ratio > 4.5:1 against their Background parent.
✓ The primary color is vibrant but professional.
✓ All state colors (destructive) are identifiable.
✓ Radius matches the requested "vibe" (curved vs sharp).

Generate the full Design System Color Palette JSON now.`);

export class ColorPaletteGenerator {
  private openrouter = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
  });

  constructor(
    private creditManager: CreditManager,
    private aiUsageService: AiUsageService,
  ) {}

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
      model: coreConstant.AI_MODELS.DESIGN.NAME,
      messages: [
        { role: 'system', content: colorPrompt },
        { role: 'user', content: message },
      ],
      responseFormat: {
        type: 'json_schema',
        jsonSchema: {
          name: 'colorPalette',
          strict: true,
          schema: colorPaletteJsonSchema,
        },
      },
      temperature: 0.7,
      stream: false,
    });

    const content = response.choices[0]?.message?.content;
    const colorPalette = (typeof content === 'object' ? content : JSON.parse(content ?? '{}')) as ColorPalette;

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

    // Cost logging
    await this.aiUsageService.logUsage({
      userId,
      modelName: coreConstant.AI_MODELS.DESIGN.NAME,
      inputTokens: tokenUsage.inputTokens,
      outputTokens: tokenUsage.outputTokens,
      type: 'color_palette',
      designId,
    } as any);

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
      // --- System Tokens ---
      background: '#FFFFFF',
      foreground: '#1E293B',
      card: '#FFFFFF',
      cardForeground: '#1E293B',
      popover: '#FFFFFF',
      popoverForeground: '#1E293B',
      primary: '#3B82F6',
      primaryForeground: '#FFFFFF',
      secondary: '#F1F5F9',
      secondaryForeground: '#1E293B',
      muted: '#F1F5F9',
      mutedForeground: '#64748B',
      accent: '#F1F5F9',
      accentForeground: '#1E293B',
      destructive: '#EF4444',
      destructiveForeground: '#FFFFFF',
      border: '#E2E8F0',
      input: '#E2E8F0',
      ring: '#3B82F6',
      radius: '0.5rem',

      // --- Charts ---
      chart1: '#3B82F6',
      chart2: '#8B5CF6',
      chart3: '#10B981',
      chart4: '#F59E0B',
      chart5: '#EF4444',
    };
  }
}
