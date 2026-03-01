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
    fontHeading: { type: 'string', description: 'Google Font name for headings (e.g. "Space Grotesk", "Inter", "Playfair Display").' },
    fontBody: { type: 'string', description: 'Google Font name for body text (e.g. "Plus Jakarta Sans", "Roboto", "Lato").' },
  },
  required: [
    'themeMode',
    'background', 'foreground', 'primary', 'primaryForeground',
    'secondary', 'secondaryForeground', 'mutedForeground',
    'card', 'cardForeground', 'border', 'input',
    'fontHeading', 'fontBody'
  ],
  additionalProperties: false,
};

const colorPaletteTemplate = PromptTemplate.fromTemplate(
  `You are a MASTER COLOR STRATEGIST who understands that color is 
the most powerful tool in a designer's arsenal. Color is emotion, 
trust, and brand—all in a single choice.

USER REQUEST: "{message}"

═══════════════════════════════════════════════════════════════════════════════
STEP 1: UNDERSTAND THE EMOTIONAL CONTEXT
═══════════════════════════════════════════════════════════════════════════════

Before choosing ANY color, answer:
- What EMOTION should this app evoke? (Calm, energetic, luxurious, playful, trustworthy?)
- What industry does this serve? (Different industries have color expectations)
- Who is the user? (Demographics influence color perception)

THEME MODE DECISION:
- Dark Mode: Gaming, entertainment, creative, nighttime apps, premium/luxury feel
- Light Mode: Productivity, healthcare, finance, daytime apps, accessibility focus
- If unclear: Light mode is safer for mainstream appeal

═══════════════════════════════════════════════════════════════════════════════
STEP 2: CRAFT THE COLOR STORY
═══════════════════════════════════════════════════════════════════════════════

Every great app has a color STORY, not just a palette.

THE FOUNDATION (Background & Foreground):
- Dark themes: Rich, deep backgrounds (never pure #000000—too harsh)
- Light themes: Clean, warm whites (pure white or slightly warm)
- Foreground must have excellent contrast for readability

THE HERO (Primary Color):
- This is the brand color, the action color, the "look at me" color
- It should FEEL right for the app's purpose
- Must work as both filled backgrounds AND text/icons
- Consider the emotional weight: Blue = trust, Green = growth, Purple = creativity...

THE SUPPORT SYSTEM:
- Secondary: Complements without competing, useful for subtle actions
- Card: Slightly elevated from background, creates depth
- Border: Subtle definition, never harsh
- Muted: For secondary text, respects hierarchy

═══════════════════════════════════════════════════════════════════════════════
STEP 3: TYPOGRAPHY PAIRING
═══════════════════════════════════════════════════════════════════════════════

Typography is the other half of design identity. Choose fonts that:
- Match the app's personality (tech, friendly, luxurious, minimal, bold)
- Create clear hierarchy (heading vs body distinction)
- Are highly readable (Google Fonts only for web compatibility)

CONSIDER:
- Geometric sans-serifs for modern/tech
- Rounded fonts for friendly/approachable
- Serif fonts for luxury/editorial
- High x-height fonts for readability

═══════════════════════════════════════════════════════════════════════════════
TECHNICAL REQUIREMENTS
═══════════════════════════════════════════════════════════════════════════════

OUTPUT FORMAT (JSON with 13 keys):
- themeMode: "dark" or "light"
- background: HEX code for page background
- foreground: HEX code for primary text
- primary: HEX code for main brand/action color
- primaryForeground: HEX code for text ON primary color
- secondary: HEX code for secondary surfaces
- secondaryForeground: HEX code for text on secondary
- mutedForeground: HEX code for subdued text
- card: HEX code for card backgrounds
- cardForeground: HEX code for card text
- border: HEX code for borders
- input: HEX code for input backgrounds
- fontHeading: Google Font name for headings
- fontBody: Google Font name for body text

CONTRAST RULES:
- All text must pass WCAG AA contrast (4.5:1 for normal text)
- primaryForeground must be readable on primary background
- Consider colorblind users—don't rely only on red/green for meaning
`
);

export class ColorPaletteGenerator {
  private openrouter = getOpenRouterClient();

  constructor(
    private creditManager: CreditManager,
    private aiUsageService: AiUsageService,
  ) { }

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

    let contentForParsing = response.choices?.[0]?.message?.content;
    if (typeof contentForParsing === 'string') {
      contentForParsing = contentForParsing.trim();
      if (contentForParsing.startsWith('```')) {
        contentForParsing = contentForParsing.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '');
      }
    }
    const colorPalette = (typeof contentForParsing === 'object' ? contentForParsing : JSON.parse(contentForParsing || '{}')) as ColorPalette;

    const usage = response.usage as any || {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    };

    const tokenUsage = {
      inputTokens: usage.promptTokens || usage.prompt_tokens || 0,
      outputTokens: usage.completionTokens || usage.completion_tokens || 0,
      totalTokens: usage.totalTokens || usage.total_tokens || 0,
      reasoningTokens: usage.completionTokensDetails?.reasoningTokens || usage.completion_tokens_details?.reasoning_tokens || 0,
    };

    // console.log('>>>>>>>>>>>>>>>>>>> RAW USAGE DATA (ColorPalette):', JSON.stringify(usage, null, 2));
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

    colorPalette.credits = await this.creditManager.deductCredits(
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
      fontHeading: 'Space Grotesk',
      fontBody: 'Plus Jakarta Sans',
    };
  }
}
