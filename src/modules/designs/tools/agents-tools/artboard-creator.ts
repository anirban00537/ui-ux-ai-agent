import { OpenRouter } from '@openrouter/sdk';
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

const generateColorPaletteInstructions = (
  colorPalette?: ColorPalette | null,
): string => {
  if (!colorPalette) {
    return `COLOR PALETTE: Use Tailwind classes "bg-background", "bg-primary", "bg-card-background", "text-primary" (they map to CSS vars). For main body and muted text use standard Tailwind (e.g. text-slate-900, text-white, text-slate-500). On bg-primary always use text-white and white icons. On images use scrim + text-white.
DO NOT use arbitrary Tailwind color values (e.g. bg-[#...]). Use ONLY these semantic classes so every screen shares the same theme.`;
  }

  return `DESIGN SYSTEM (3-color theme) - SAME FOR EVERY SCREEN:

STRICT VARIABLE MAPPINGS - Use ONLY these Tailwind classes (they map to CSS vars):
- background: "bg-background"
- primary: "bg-primary", "text-primary"
- cardBackground: "bg-card-background" (cards, panels, list item surfaces)

For main body and muted/supporting text use standard Tailwind (e.g. text-slate-900, text-white, text-slate-500, text-slate-600). For neutrals use standard Tailwind: border-slate-200, border-white/10, etc. where needed.

Use layered or colored shadows (e.g. shadow-primary/20) for depth; avoid flat blocks.

DO NOT use arbitrary Tailwind color values (e.g. bg-[#...], text-[#...]). Use ONLY the semantic class names above so every screen shares the same theme. On bg-primary: ALWAYS use text-white and white icons—never dark text/icons on primary. On bg-card-background use standard text (text-slate-900 on light cards, text-white on dark cards). On images use scrim (bg-black/40) + text-white. WCAG contrast everywhere.`;
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

export class ArtboardCreator {
  private openrouter = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
  });

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
  ): Promise<ScreenPlan> {
    const prompts = PromptManager.getPrompts(designType);
    const planningPrompt = await prompts.planningTemplate.format({
      message,
    });

    const allMessages = [
      { role: 'system' as const, content: planningPrompt },
      ...contextMessages,
      { role: 'user' as const, content: message },
    ];

    const response = await this.openrouter.chat.send({
      model: coreConstant.AI_MODELS.DESIGN.NAME,
      messages: allMessages,
      responseFormat: {
        type: 'json_schema',
        jsonSchema: {
          name: 'artboardPlan',
          strict: true,
          schema: artboardPlanJsonSchema,
        },
      },
      temperature: 0.5,
      stream: false,
    });

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

    // Cost logging
    await this.aiUsageService.logUsage({
      userId,
      modelName: coreConstant.AI_MODELS.DESIGN.NAME,
      inputTokens: tokenUsage.inputTokens,
      outputTokens: tokenUsage.outputTokens,
      type: 'screen_planning',
      designId,
    } as any);

    // Deduct credits immediately after planning
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
  ): AsyncGenerator<{ type: 'chunk' | 'complete'; data: any }, void, unknown> {
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

    // Use OpenAI SDK for streaming (OpenRouter compatible)
    const { OpenAI } = await import('openai');
    const openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY!,
      defaultHeaders: {
        'HTTP-Referer': 'https://butterfast.app',
        'X-Title': 'Butterfast',
      },
    });

    const stream = await openai.chat.completions.create({
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

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      
      if (delta) {
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

    // Parse final JSON - with fallback for truncated/unterminated stream output
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
        console.error('[ArtboardCreator] Failed to parse streamed JSON and could not extract html');
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

    // Cost logging
    await this.aiUsageService.logUsage({
      userId,
      modelName: coreConstant.AI_MODELS.DESIGN.NAME,
      inputTokens: tokenUsage.inputTokens,
      outputTokens: tokenUsage.outputTokens,
      type: 'screen_creation',
      designId,
    } as any);

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
