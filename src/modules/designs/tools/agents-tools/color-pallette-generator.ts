import { OpenRouter } from '@openrouter/sdk';
import { PromptTemplate } from '@langchain/core/prompts';
import { type ColorPalette } from '../../schemas';
import { CreditManager } from '../credit-manager';
import { coreConstant } from '../../../../shared/helpers/coreConstant';
import { AiUsageService } from '../../../subscription/services/ai-usage.service';

// JSON Schema for ColorPalette - 3 tokens only
const colorPaletteJsonSchema = {
  type: 'object',
  properties: {
    primary: { type: 'string', description: 'Primary brand color (hex code)' },
    backgroundLight: { type: 'string', description: 'Light mode background color (hex)' },
    backgroundDark: { type: 'string', description: 'Dark mode background color (hex)' },
  },
  required: ['primary', 'backgroundLight', 'backgroundDark'],
  additionalProperties: false,
};

const colorPaletteTemplate =
  PromptTemplate.fromTemplate(`You are a Design System Architect. Generate a color palette for a mobile app defined by this request: "{message}"

CONSIDERATIONS:
• **Mood/Tone**: What is the emotional goal? (Trustworthy for finance, Energetic for fitness, Calm for meditation).
• **Accessibility**: High contrast is non-negotiable (WCAG AA).
• **Visual Hierarchy**: The primary color must pop against the background.

OUTPUT (strictly 3 colors):
1. "primary": Brand anchor color.
2. "backgroundLight": A refined, off-white/light-grey tone (avoid pure #ffffff).
3. "backgroundDark": A rich, deep dark tone (avoid pure #000000; prefer slate, navy, or deep forest).

Return JSON with keys: primary, backgroundLight, backgroundDark.`);

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
      primary: '#13ec5b',
      backgroundLight: '#f6f8f6',
      backgroundDark: '#102216',
    };
  }
}
