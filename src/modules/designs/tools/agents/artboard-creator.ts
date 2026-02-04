import { PrismaService } from '../../../prisma/prisma.service';
import {
  type SingleScreen,
  type ScreenPromptData,
  type ExistingArtboard,
  type ColorPalette,
  type PreviousScreenContext,
} from '../../schemas';
import { CreditManager } from '../credits';
import { coreConstant } from '../../../../shared/helpers/coreConstant';
import { AiUsageService } from '../../../subscription/services/ai-usage.service';
import { PromptManager } from '../prompts/prompt-manager';
import { getOpenRouterClient, withTimeout, checkAborted, LLM_CONFIG } from '../llm';

// JSON Schema for SingleScreen
const singleArtboardJsonSchema = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      description: 'A concise title for the artboard',
    },
    description: {
      type: 'string',
      description: "A brief description of the artboard's purpose",
    },
    html: {
      type: 'string',
      description: 'Complete HTML code for the artboard content',
    },
  },
  required: ['title', 'description', 'html'],
  additionalProperties: false,
};

const THEME_CLASSES_BLOCK = `
STRICT THEME MAPPINGS (use ONLY these Tailwind classes; they map to CSS vars):
- Background: bg-background | Foreground: text-foreground
- Primary: bg-primary | Primary Foreground: text-primary-foreground
- Secondary: bg-secondary | Secondary Foreground: text-secondary-foreground
- Muted Foreground: text-muted-foreground (hints, captions)
- Card: bg-card | Card Foreground: text-card-foreground
- Border: border-border | Input: bg-input, border-input
- Also available: muted (bg-muted, text-muted), accent, destructive, popover, ring, chart-1…chart-5. Use Remix Icon for icons: <i class="ri-{name}-line"></i> or ri-{name}-fill (e.g. ri-arrow-right-line, ri-home-line, ri-add-circle-fill).
- Use Shadcn-style component patterns: rounded-md for buttons/inputs, rounded-lg for cards, inline-flex for buttons, semantic theme classes only.

On bg-primary use text-primary-foreground and primary-foreground icons. On bg-secondary use text-secondary-foreground. On bg-card use text-card-foreground. On images use scrim (bg-black/40) + text-foreground. DO NOT use arbitrary colors (e.g. bg-[#...]). WCAG contrast everywhere.`;

const generateColorPaletteInstructions = (
  colorPalette?: ColorPalette | null,
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

const MAX_HTML_LENGTH_PER_SCREEN = 2500;

function formatPreviousScreensForDesignPattern(
  screens: PreviousScreenContext[],
): string {
  if (screens.length === 0)
    return '(First screen(s) — establish the design pattern. Later screens will match this.)';
  return screens
    .map(
      (s) =>
        `--- "${s.title}" ---\n${(s.description || '').slice(0, 200)}\nHTML (match design pattern):\n${s.html.slice(0, MAX_HTML_LENGTH_PER_SCREEN)}${s.html.length > MAX_HTML_LENGTH_PER_SCREEN ? '\n...[truncated]' : ''}`,
    )
    .join('\n\n');
}

/**
 * Result from a single screen generation
 */
export interface ScreenGenerationResult {
  screen: SingleScreen;
  promptData: ScreenPromptData;
  index: number;
}

export class ArtboardCreator {
  // Using OpenAI SDK pointed at OpenRouter for full streaming support
  private openrouter = getOpenRouterClient();

  constructor(
    private prisma: PrismaService,
    private creditManager: CreditManager,
    private aiUsageService: AiUsageService,
  ) {}

  /**
   * Generate an artboard with streaming support
   * Yields partial content chunks for real-time UI updates
   */
  async *generateArtboardStreaming(
    promptData: ScreenPromptData,
    message: string,
    contextMessages: Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
    }>,
    colorPalette: ColorPalette | null | undefined,
    userId: string,
    designId: string,
    designType: string,
    previousScreens: PreviousScreenContext[] = [],
    signal?: AbortSignal,
  ): AsyncGenerator<{ type: 'chunk' | 'complete'; data: any }, void, unknown> {
    checkAborted(signal, `screen_generation:${promptData.title}`);

    const colorPaletteInstructions = generateColorPaletteInstructions(colorPalette);
    const previousScreensContext = formatPreviousScreensForDesignPattern(previousScreens);

    const prompts = PromptManager.getPrompts(designType);
    const systemPrompt = await prompts.generationTemplate.format({
      colorPaletteInstructions,
      message,
      title: promptData.title,
      description: designType + ' design ' + promptData.title,
      prompt: promptData.prompt,
      previousScreensContext,
    });

    const userContent = `Original request: ${message}\n\nSpecific artboard prompt: ${promptData.prompt}`;
    const allMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...contextMessages,
      { role: 'user' as const, content: userContent },
    ];

    checkAborted(signal, `screen_generation:${promptData.title}`);

    // Use the singleton OpenRouter client for streaming
    const stream = await this.openrouter.chat.send(
      {
        model: coreConstant.AI_MODELS.DESIGN.NAME,
        messages: allMessages,
        responseFormat: {
          type: 'json_schema',
          jsonSchema: {
            name: 'artboard',
            strict: true,
            schema: singleArtboardJsonSchema,
          },
        },
        temperature: 0.5,
        stream: true,
        streamOptions: {
          includeUsage: true,
        },
        ...(coreConstant.AI_MODELS.DESIGN.PROVIDER.ENABLED
          ? {
              provider: {
                order: coreConstant.AI_MODELS.DESIGN.PROVIDER.ORDER as any,
                allowFallbacks: coreConstant.AI_MODELS.DESIGN.PROVIDER.ALLOW_FALLBACKS,
              },
            }
          : {}),
      },
      {}, // Options
    ) as any;

    let accumulatedContent = '';
    let usageData: any = null;
    let lastChunkTime = Date.now();

    for await (const chunk of stream) {
      // Chunk must be cast to any to access choices/delta
      const c = chunk as any;
      // Check for cancellation during streaming
      if (signal?.aborted) {
        console.log(`[ArtboardCreator] Stream cancelled for "${promptData.title}"`);
        throw new Error(`Operation cancelled: screen_generation:${promptData.title}`);
      }

      // Check for chunk timeout
      const now = Date.now();
      if (now - lastChunkTime > LLM_CONFIG.STREAM_CHUNK_TIMEOUT_MS) {
        throw new Error(`Stream timeout: no chunk received for ${LLM_CONFIG.STREAM_CHUNK_TIMEOUT_MS}ms`);
      }
      lastChunkTime = now;

      const delta = c.choices?.[0]?.delta?.content;
      
      if (delta) {
        accumulatedContent += delta;
        
        // Yield chunk for real-time streaming
        yield {
          type: 'chunk',
          data: {
            id: promptData.id,
            rawChunk: delta,
            accumulatedText: accumulatedContent,
            title: promptData.title,
          },
        };
      }

      // Capture usage data
      if (c.usage) {
        usageData = c.usage;
      }
    }
    
    // Start artboard parsing (Clean clean-up)
    let artboard: SingleScreen;
    try {
      artboard = JSON.parse(accumulatedContent) as SingleScreen;
    } catch {
      // Fallback: extract fields from partial JSON (e.g. unterminated html string)
      const unescapeJsonStr = (s: string) =>
        (s ?? '')
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\');
      const titleMatch = accumulatedContent.match(/"title"\s*:\s*"((?:\\.|[^"\\])*?)"/);
      const descMatch = accumulatedContent.match(/"description"\s*:\s*"((?:\\.|[^"\\])*?)"/);
      const htmlMatch = accumulatedContent.match(/"html"\s*:\s*"((?:\\.|[^"\\])*?)(?:"\s*[,}]|$)/);
      const title = titleMatch?.[1] ? unescapeJsonStr(titleMatch[1]) : promptData.title;
      const description = descMatch?.[1] ? unescapeJsonStr(descMatch[1]) : '';
      const html = htmlMatch?.[1] ? unescapeJsonStr(htmlMatch[1]) : '';
      if (!html) {
        throw new Error('Failed to parse generated artboard content');
      }
      artboard = { title, description, html };
    }

    // Handle token usage and credits
    const tokenUsage = {
      inputTokens: usageData?.prompt_tokens || 0,
      outputTokens: usageData?.completion_tokens || 0,
      totalTokens: usageData?.total_tokens || 0,
    };

    console.log('[ArtboardCreator] Deducting credits for artboard generation:', tokenUsage);

    // Fire-and-forget for non-critical logging
    this.aiUsageService.logUsage({
      userId,
      modelName: coreConstant.AI_MODELS.DESIGN.NAME,
      inputTokens: tokenUsage.inputTokens,
      outputTokens: tokenUsage.outputTokens,
      type: 'screen_creation',
      designId,
    } as any).catch(err => console.error('[ArtboardCreator] Screen creation usage log error:', err));

    // Deduct credits
    await this.creditManager.deductCredits(
      userId,
      designId,
      'screen_creation',
      tokenUsage,
    );

    // Yield final complete artboard
    yield {
      type: 'complete',
      data: artboard,
    };
  }

  /**
   * Generate a single artboard without streaming (for parallel generation)
   */
  async generateArtboardNonStreaming(
    promptData: ScreenPromptData,
    message: string,
    contextMessages: Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
    }>,
    colorPalette: ColorPalette | null | undefined,
    userId: string,
    designId: string,
    designType: string,
    previousScreens: PreviousScreenContext[] = [],
    signal?: AbortSignal,
  ): Promise<SingleScreen> {
    checkAborted(signal, `screen_generation:${promptData.title}`);

    const colorPaletteInstructions = generateColorPaletteInstructions(colorPalette);
    const previousScreensContext = formatPreviousScreensForDesignPattern(previousScreens);

    const prompts = PromptManager.getPrompts(designType);
    const systemPrompt = await prompts.generationTemplate.format({
      colorPaletteInstructions,
      message,
      title: promptData.title,
      description: designType + ' design ' + promptData.title,
      prompt: promptData.prompt,
      previousScreensContext,
    });

    const userContent = `Original request: ${message}\n\nSpecific artboard prompt: ${promptData.prompt}`;
    const allMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...contextMessages,
      { role: 'user' as const, content: userContent },
    ];

    checkAborted(signal, `screen_generation:${promptData.title}`);

    const response = await withTimeout(
      // @ts-ignore - OpenRouter SDK 'chat.send'
      this.openrouter.chat.send(
        {
          model: coreConstant.AI_MODELS.DESIGN.NAME,
          messages: allMessages,
          responseFormat: {
            type: 'json_schema',
            jsonSchema: {
              name: 'artboard',
              strict: true,
              schema: singleArtboardJsonSchema,
            },
          },
          temperature: 0.5,
          ...(coreConstant.AI_MODELS.DESIGN.PROVIDER.ENABLED
            ? {
                provider: {
                  order: coreConstant.AI_MODELS.DESIGN.PROVIDER.ORDER as any,
                  allowFallbacks: coreConstant.AI_MODELS.DESIGN.PROVIDER.ALLOW_FALLBACKS,
                },
              }
            : {}),
        },
        {}, // Options
      ),
      LLM_CONFIG.REQUEST_TIMEOUT_MS,
      `Screen Generation: ${promptData.title}`,
      signal,
    ) as any;

    const content = response.choices[0]?.message?.content;
    const artboard = (typeof content === 'object' ? content : JSON.parse(content ?? '{}')) as SingleScreen;

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

    console.log(`[ArtboardCreator] Deducting credits for "${promptData.title}":`, tokenUsage);

    // Fire-and-forget for non-critical logging
    this.aiUsageService.logUsage({
      userId,
      modelName: coreConstant.AI_MODELS.DESIGN.NAME,
      inputTokens: tokenUsage.inputTokens,
      outputTokens: tokenUsage.outputTokens,
      type: 'screen_creation',
      designId,
    } as any).catch(err => console.error('[ArtboardCreator] Screen creation usage log error:', err));

    await this.creditManager.deductCredits(
      userId,
      designId,
      'screen_creation',
      tokenUsage,
    );

    return artboard;
  }

  async saveArtboard(
    artboard: SingleScreen,
    designId: string,
  ): Promise<ExistingArtboard> {
    // Find the rightmost artboard to append the new one
    const lastArtboard = await this.prisma.artboard.findFirst({
      where: { designId },
      orderBy: { x: 'desc' },
      select: { x: true },
    });

    // Default start X is 0 if no screens exist.
    // Frontend uses ~4600 as start, but 0 is fine as relative base.
    // Gap is 550.
    const newX = lastArtboard?.x != null ? Number(lastArtboard.x) + 550 : 0;
    const newY = 1200; // Standard Y row

    return await this.prisma.artboard.create({
      data: {
        designId,
        title: artboard.title,
        description: artboard.description,
        html: artboard.html,
        x: newX,
        y: newY,
      },
    });
  }

  async saveAssistantMessage(designId: string, content: string): Promise<void> {
    await this.prisma.message.create({
      data: {
        designId,
        content,
        role: 'assistant',
      },
    });
  }
}

export default ArtboardCreator;
