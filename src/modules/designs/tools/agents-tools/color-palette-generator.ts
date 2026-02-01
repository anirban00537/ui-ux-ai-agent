import { PromptTemplate } from '@langchain/core/prompts';
import { type ColorPalette } from '../../schemas';
import { CreditManager } from '../credit-manager';
import { coreConstant } from '../../../../shared/helpers/coreConstant';
import { AiUsageService } from '../../../subscription/services/ai-usage.service';
import { getOpenRouterClient, withTimeout, checkAborted, LLM_CONFIG } from '../llm-client';

// JSON Schema for ColorPalette - 11 theme tokens (shadcn-style theming)
const colorPaletteJsonSchema = {
  type: 'object',
  properties: {
    background: { type: 'string', description: 'Page/surface background (hex)' },
    foreground: { type: 'string', description: 'Default text color on background (hex)' },
    primary: { type: 'string', description: 'Primary brand/CTA color (hex)' },
    primaryForeground: { type: 'string', description: 'Text on primary (hex)' },
    secondary: { type: 'string', description: 'Secondary accent/surface (hex)' },
    secondaryForeground: { type: 'string', description: 'Text on secondary (hex)' },
    mutedForeground: { type: 'string', description: 'Muted/subtle text (hex)' },
    card: { type: 'string', description: 'Card/panel background (hex)' },
    cardForeground: { type: 'string', description: 'Text on card (hex)' },
    border: { type: 'string', description: 'Border color (hex)' },
    input: { type: 'string', description: 'Input background/border (hex)' },
  },
  required: [
    'background', 'foreground', 'primary', 'primaryForeground',
    'secondary', 'secondaryForeground', 'mutedForeground',
    'card', 'cardForeground', 'border', 'input',
  ],
  additionalProperties: false,
};

const colorPaletteTemplate =
  PromptTemplate.fromTemplate(`You are a Design System Architect. Generate a full theme color palette for a mobile app defined by this request: "{message}"

THEME ROLES (output all 11 as hex codes):
1. background - Page/surface background
2. foreground - Default text on background (must contrast with background, WCAG AA)
3. primary - Brand anchor, main CTAs, key interactive elements
4. primaryForeground - Text/icons on primary (must contrast with primary)
5. secondary - Secondary accent, alternate surfaces (e.g. hover states, badges)
6. secondaryForeground - Text on secondary
7. mutedForeground - Muted/subtle text (hints, captions, placeholders)
8. card - Card/panel/list item background (distinct from page background)
9. cardForeground - Text on card
10. border - Borders and dividers
11. input - Input field background and border

CONSIDERATIONS:
• Mood: trustworthy (finance), energetic (fitness), calm (wellness). Ensure primary contrasts with background (WCAG AA).
• primaryForeground must contrast with primary (e.g. white on dark primary). Same for secondary/secondaryForeground, card/cardForeground.
• mutedForeground should be readable but subordinate (e.g. gray one step lighter/darker than foreground).
• border and input can be subtle (e.g. same hue as background at lower opacity or neutral gray).

Return JSON with keys: background, foreground, primary, primaryForeground, secondary, secondaryForeground, mutedForeground, card, cardForeground, border, input.`);

export class ColorPaletteGenerator {
  private openrouter = getOpenRouterClient();

  constructor(
    private creditManager: CreditManager,
    private aiUsageService: AiUsageService,
  ) {}

  async generateColorPalette(
    message: string,
    userId: string,
    designId: string,
    signal?: AbortSignal,
  ): Promise<ColorPalette> {
    // Check for cancellation before starting
    checkAborted(signal, 'color_palette_generation');

    const colorPrompt = await colorPaletteTemplate.format({
      message: message,
    });

    // Check for cancellation before LLM call
    checkAborted(signal, 'color_palette_generation');

    const response = await withTimeout(
      this.openrouter.chat.send({
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
      }),
      LLM_CONFIG.REQUEST_TIMEOUT_MS,
      'Color Palette LLM Call',
      signal,
    );

    const content = response.choices[0]?.message?.content;
    const colorPalette = (typeof content === 'object' ? content : JSON.parse(content ?? '{}')) as ColorPalette;

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

    // Fire-and-forget for non-critical logging
    this.aiUsageService.logUsage({
      userId,
      modelName: coreConstant.AI_MODELS.DESIGN.NAME,
      inputTokens: tokenUsage.inputTokens,
      outputTokens: tokenUsage.outputTokens,
      type: 'color_palette',
      designId,
    } as any).catch(err => console.error('[ColorPaletteGenerator] Usage log error:', err));

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
      background: '#0f172a',
      foreground: '#f8fafc',
      primary: '#3b82f6',
      primaryForeground: '#ffffff',
      secondary: '#1e293b',
      secondaryForeground: '#f8fafc',
      mutedForeground: '#94a3b8',
      card: '#1e293b',
      cardForeground: '#f8fafc',
      border: '#334155',
      input: '#1e293b',
    };
  }
}
