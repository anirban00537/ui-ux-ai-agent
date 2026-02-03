import { PromptTemplate } from '@langchain/core/prompts';
import { type ColorPalette } from '../../schemas';
import { CreditManager } from '../credits';
import { coreConstant } from '../../../../shared/helpers/coreConstant';
import { AiUsageService } from '../../../subscription/services/ai-usage.service';
import { getOpenRouterClient, withTimeout, checkAborted, LLM_CONFIG } from '../llm';

// JSON Schema for ColorPalette - 11 theme tokens (shadcn-style theming)
const colorPaletteJsonSchema = {
  type: 'object',
  properties: {
    themeMode: {
       type: 'string', 
       enum: ['light', 'dark'],
       description: 'The detected or chosen theme mode best suited for the user request.' 
    },
    background: { type: 'string', description: 'Page background. Dark mode: #020617 (Slate-950). Light mode: #ffffff.' },
    foreground: { type: 'string', description: 'Body text. Dark mode: #f8fafc (Slate-50). Light mode: #0f172a (Slate-900).' },
    primary: { type: 'string', description: 'Main Brand Color. Vibrant, high saturation.' },
    primaryForeground: { type: 'string', description: 'Text on primary. Must pass WCAG AA contrast against primary.' },
    secondary: { type: 'string', description: 'Secondary/Surface color.' },
    secondaryForeground: { type: 'string', description: 'Text on secondary.' },
    mutedForeground: { type: 'string', description: 'Subtle text (captions).' },
    card: { type: 'string', description: 'Card background. Slightly lighter/darker than bg to create depth.' },
    cardForeground: { type: 'string', description: 'Text on card.' },
    border: { type: 'string', description: 'Border color.' },
    input: { type: 'string', description: 'Input background.' },
  },
  required: [
    'themeMode',
    'background', 'foreground', 'primary', 'primaryForeground',
    'secondary', 'secondaryForeground', 'mutedForeground',
    'card', 'cardForeground', 'border', 'input',
  ],
  additionalProperties: false,
};

const colorPaletteTemplate = PromptTemplate.fromTemplate(
  `IDENTIY: World-Class Color Architect.
MISSION: Generate the *perfect* color palette for a mobile app request.

USER REQUEST: "{message}"

═══════════════════════════════════════════════════════════════════════════════
LOGIC: DETERMINE THEME MODE
═══════════════════════════════════════════════════════════════════════════════
1. Does the user ask for "dark", "night", "cyberpunk", "midnight"? -> 'dark'
2. Does the user ask for "clean", "white", "paper", "medical"? -> 'light'
3. Default (if unspecified): 'light' for SaaS/Medical, 'dark' for Media/Gaming.
(Explicitly set "themeMode" in output).

═══════════════════════════════════════════════════════════════════════════════
RULES: COLOR HARMONY (HEX CODES ONLY)
═══════════════════════════════════════════════════════════════════════════════

[IF DARK MODE]:
- background: #020617 (Slate 950) or #09090b (Zinc 950). NEVER PURE BLACK (#000000).
- foreground: #f8fafc (Slate 50).
- card: #0f172a (Slate 900) or #18181b (Zinc 900). Must be visible against background.
- primary: VIBRANT & SATURATED (e.g., #3b82f6 Blue, #10b981 Emerald).
- border: #1e293b (Slate 800).

[IF LIGHT MODE]:
- background: #ffffff (White) or #f8fafc (Slate 50).
- foreground: #0f172a (Slate 900).
- card: #ffffff (White) with shadow.
- primary: TRUSTWORTHY & CLEAR (e.g., #2563eb Blue, #059669 Green).
- border: #e2e8f0 (Slate 200).

[CONTRAST MANDATES]:
- primaryForeground: IF primary is dark, use #ffffff. IF primary is light/neon, use #000000.
- mutedForeground: Must be readable. Slate-500 (#64748b) usually works well.

[OUTPUT STRUCTURE]:
Return a single JSON object with all 11 keys + themeMode.
`
);

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
      // @ts-ignore - OpenRouter SDK 'chat.send'
      this.openrouter.chat.send(
        {
          model: coreConstant.AI_MODELS.AGENT.NAME,
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
          ...(coreConstant.AI_MODELS.AGENT.PROVIDER.ENABLED
            ? {
                provider: {
                  order: coreConstant.AI_MODELS.AGENT.PROVIDER.ORDER as any,
                  allowFallbacks: coreConstant.AI_MODELS.AGENT.PROVIDER.ALLOW_FALLBACKS,
                },
              }
            : {}),
        },
        {}, // Options
      ),
      LLM_CONFIG.REQUEST_TIMEOUT_MS,
      'Color Palette LLM Call',
      signal,
    ) as any;

    const content = response.choices?.[0]?.message?.content;
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
      modelName: coreConstant.AI_MODELS.AGENT.NAME,
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
      themeMode: 'dark',
      background: '#020617', // Slate 950
      foreground: '#f8fafc', // Slate 50
      primary: '#3b82f6',    // Blue 500
      primaryForeground: '#ffffff',
      secondary: '#1e293b',  // Slate 800
      secondaryForeground: '#f8fafc',
      mutedForeground: '#94a3b8', // Slate 400
      card: '#0f172a',       // Slate 900
      cardForeground: '#f8fafc',
      border: '#1e293b',     // Slate 800
      input: '#0f172a',
    };
  }
}
