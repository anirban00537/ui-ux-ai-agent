import { PrismaService } from '../../../prisma/prisma.service';
import {
  type ScreenPlan,
  type SingleScreen,
  type ScreenPromptData,
  type ExistingArtboard,
  type ColorPalette,
  type PreviousScreenContext,
} from '../../schemas';
import { CreditManager } from '../credit-manager';
import { coreConstant } from '../../../../shared/helpers/coreConstant';
import { AiUsageService } from '../../../subscription/services/ai-usage.service';
import { PromptManager } from '../prompts/prompt-manager';
import { getOpenRouterClient, withTimeout, checkAborted, LLM_CONFIG } from '../llm-client';

// JSON Schema for ScreenPlan
const artboardPlanJsonSchema = {
  type: 'object',
  properties: {
    totalScreens: {
      type: 'number',
      minimum: 1,
      maximum: 8,
      description: 'Total number of artboards/screens needed',
    },
    screenPrompts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Artboard title',
          },
          prompt: {
            type: 'string',
            description: 'Detailed prompt for generating this specific artboard',
          },
          order: {
            type: 'number',
            description: 'Order of generation',
          },
        },
        required: ['title', 'prompt', 'order'],
        additionalProperties: false,
      },
      description: 'Individual prompts for each artboard',
    },
  },
  required: ['totalScreens', 'screenPrompts'],
  additionalProperties: false,
};

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
  return `DESIGN SYSTEM (11-color theme) - SAME FOR EVERY SCREEN:${THEME_CLASSES_BLOCK}`;
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
   * Plan artboards with integrated image queries - single AI call for both!
   */
  async planArtboards(
    message: string,
    contextMessages: Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
    }>,
    userId: string,
    designId: string,
    designType: string,
    signal?: AbortSignal,
  ): Promise<ScreenPlan> {
    checkAborted(signal, 'screen_planning');

    const prompts = PromptManager.getPrompts(designType);
    const planningPrompt = await prompts.planningTemplate.format({
      message,
    });

    const allMessages = [
      { role: 'system' as const, content: planningPrompt },
      ...contextMessages,
      { role: 'user' as const, content: message },
    ];

    checkAborted(signal, 'screen_planning');

    const response = await withTimeout(
      this.openrouter.chat.completions.create({
        model: coreConstant.AI_MODELS.DESIGN.NAME,
        messages: allMessages,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'artboardPlan',
            strict: true,
            schema: artboardPlanJsonSchema,
          },
        },
        temperature: 0.5,
      }),
      LLM_CONFIG.REQUEST_TIMEOUT_MS,
      'Screen Planning LLM Call',
      signal,
    );

    const content = response.choices[0]?.message?.content;
    const plan = (typeof content === 'object' ? content : JSON.parse(content ?? '{}')) as ScreenPlan;

    // Fix inconsistency: ensure totalScreens matches screenPrompts.length
    if (plan.totalScreens !== plan.screenPrompts.length) {
      console.warn(
        `[ArtboardCreator] Inconsistent plan: totalScreens=${plan.totalScreens}, screenPrompts.length=${plan.screenPrompts.length}. Fixing...`,
      );
      plan.totalScreens = plan.screenPrompts.length;
    }

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

    console.log('[ArtboardCreator] Deducting credits for planning:', tokenUsage);

    // Fire-and-forget for non-critical logging
    this.aiUsageService.logUsage({
      userId,
      modelName: coreConstant.AI_MODELS.DESIGN.NAME,
      inputTokens: tokenUsage.inputTokens,
      outputTokens: tokenUsage.outputTokens,
      type: 'screen_planning',
      designId,
    } as any).catch(err => console.error('[ArtboardCreator] Planning usage log error:', err));

    await this.creditManager.deductCredits(
      userId,
      designId,
      'screen_planning',
      tokenUsage,
    );

    return plan;
  }

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
    const stream = await this.openrouter.chat.completions.create({
      model: coreConstant.AI_MODELS.DESIGN.NAME,
      messages: allMessages,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'artboard',
          strict: true,
          schema: singleArtboardJsonSchema,
        },
      },
      temperature: 0.5,
      stream: true,
      stream_options: {
        include_usage: true,
      },
    });

    let accumulatedContent = '';
    let usageData: any = null;
    let chunkCount = 0;
    let lastChunkTime = Date.now();

    for await (const chunk of stream) {
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

      const delta = chunk.choices[0]?.delta?.content;
      
      if (delta) {
        chunkCount++;
        accumulatedContent += delta;
        
        // Yield chunk for real-time streaming
        yield {
          type: 'chunk',
          data: {
            rawChunk: delta,
            accumulatedText: accumulatedContent,
            title: promptData.title,
          },
        };
      }

      // Capture usage data
      if (chunk.usage) {
        usageData = chunk.usage;
      }
    }

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
      this.openrouter.chat.completions.create({
        model: coreConstant.AI_MODELS.DESIGN.NAME,
        messages: allMessages,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'artboard',
            strict: true,
            schema: singleArtboardJsonSchema,
          },
        },
        temperature: 0.5,
      }),
      LLM_CONFIG.REQUEST_TIMEOUT_MS,
      `Screen Generation: ${promptData.title}`,
      signal,
    );

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
    return await this.prisma.artboard.create({
      data: {
        designId,
        title: artboard.title,
        description: artboard.description,
        html: artboard.html,
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
