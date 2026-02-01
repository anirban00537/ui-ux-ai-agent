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
  PromptTemplate.fromTemplate(`You are a top-tier Design System Architect. Your goal is to generate a MINIMALIST, CLEAN color palette for a mobile application, strictly following the "Competitor Style".

User Request: "{message}"

MINIMALIST THEME STRATEGY (Non-Negotiable):
1. **Primary Color**: This is the ONLY strong color. derived from user request (default to Green #13ec5b if unspecified).
2. **Backgrounds**:
   - Light Mode: Off-white / very light gray (e.g., #f6f8f6 or #f8fafc).
   - Dark Mode: Deep, rich dark (e.g., #102216 or #0f172a).
3. **Neutrals (Muted/Cards/Borders)**: 
   - STRICTLY use standard Tailwind Slate or Zinc values.
   - Do NOT generate custom pastel or tinted neutrals unless explicitly asked.
   - Example: Muted = #f1f5f9, Border = #e2e8f0.

OUTPUT GUIDELINES:
- "primary": The main brand color.
- "primaryForeground": Usually #ffffff or #000000 depending on primary brightness.
- "background": The light mode background.
- "foreground": The light mode text (usually #0f172a).
- "card": White #ffffff.
- "cardForeground": #0f172a.
- "muted": #f1f5f9.
- "mutedForeground": #64748b.
- "border": #e2e8f0.
- "radius": "0.5rem" or "1rem".

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
      temperature: 0.5,
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
      // --- System Tokens (Green Minimalist Default) ---
      background: '#f6f8f6',
      foreground: '#102216',
      card: '#FFFFFF',
      cardForeground: '#102216',
      popover: '#FFFFFF',
      popoverForeground: '#102216',
      primary: '#13ec5b',
      primaryForeground: '#000000',
      secondary: '#f1f5f9',
      secondaryForeground: '#102216',
      muted: '#f1f5f9', // Slate-100
      mutedForeground: '#64748b', // Slate-500
      accent: '#f1f5f9',
      accentForeground: '#102216',
      destructive: '#ef4444',
      destructiveForeground: '#FFFFFF',
      border: '#e2e8f0', // Slate-200
      input: '#e2e8f0',
      ring: '#13ec5b',
      radius: '0.75rem', // rounded-xl

      // --- Charts ---
      chart1: '#13ec5b',
      chart2: '#2a9d8f',
      chart3: '#e9c46a',
      chart4: '#f4a261',
      chart5: '#e76e50',
    };
  }
}
