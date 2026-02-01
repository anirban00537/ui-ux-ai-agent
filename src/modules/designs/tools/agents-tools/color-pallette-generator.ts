import { OpenRouter } from '@openrouter/sdk';
import { PromptTemplate } from '@langchain/core/prompts';
import { type ColorPalette } from '../../schemas';
import { CreditManager } from '../credit-manager';
import { coreConstant } from '../../../../shared/helpers/coreConstant';
import { AiUsageService } from '../../../subscription/services/ai-usage.service';

// JSON Schema for ColorPalette - 3 tokens: background, primary, cardBackground
const colorPaletteJsonSchema = {
  type: 'object',
  properties: {
    background: { type: 'string', description: 'Page/surface background color (hex)' },
    primary: { type: 'string', description: 'Primary brand/accent color (hex)' },
    cardBackground: { type: 'string', description: 'Card/panel background color (hex)' },
  },
  required: ['background', 'primary', 'cardBackground'],
  additionalProperties: false,
};

const colorPaletteTemplate =
  PromptTemplate.fromTemplate(`You are a Design System Architect. Generate a color palette for a mobile app defined by this request: "{message}"

CONSIDERATIONS:
• Choose palette so primary has strong contrast on background (WCAG AA). Consider mood: trustworthy (finance), energetic (fitness), calm (wellness).
• **Mood/Tone**: What is the emotional goal? (Trustworthy for finance, Energetic for fitness, Calm for meditation).
• **Accessibility**: High contrast is non-negotiable (WCAG AA). Primary must contrast with background.
• **Visual Hierarchy**: Primary color must pop against background. Card background should work on top of page background (e.g. slightly lighter/darker or subtle tint).

OUTPUT (strictly 3 colors, hex codes):
1. "background": Page/surface background (one value; no light/dark split).
2. "primary": Brand anchor and main CTAs.
3. "cardBackground": Background for cards, panels, and list items (distinct from page background).

Return JSON with keys: background, primary, cardBackground.`);

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
      background: '#0f172a',
      primary: '#3b82f6',
      cardBackground: '#1e293b',
    };
  }
}
