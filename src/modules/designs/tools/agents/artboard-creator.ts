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

import { generateColorPaletteInstructions, generateFontInstructions } from '../prompts/prompt-helpers';

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
  private client = getOpenRouterClient();

  constructor(
    private prisma: PrismaService,
    private creditManager: CreditManager,
    private aiUsageService: AiUsageService,
  ) { }

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
    const fontInstructions = generateFontInstructions(colorPalette);
    const previousScreensContext = formatPreviousScreensForDesignPattern(previousScreens);

    const prompts = PromptManager.getPrompts(designType);
    const systemPrompt = await prompts.generationTemplate.format({
      colorPaletteInstructions,
      fontInstructions,
      message,
      title: promptData.title,
      description: designType + ' design ' + promptData.title,
      prompt: promptData.prompt,
      previousScreensContext,
    });

    const userContent = `Original request: ${message}\n\nSpecific artboard prompt: ${promptData.prompt}`;
    const allMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system' as const, content: systemPrompt },
      ...contextMessages.slice(-15),
      { role: 'user' as const, content: userContent },
    ];

    checkAborted(signal, `screen_generation:${promptData.title}`);

    // Use OpenAI SDK for reliable streaming
    const stream = await this.client.chat.completions.create({
      model: coreConstant.AI_MODELS.DESIGN.NAME,
      messages: allMessages as any,
      response_format: {
        type: 'json_schema' as const,
        json_schema: {
          name: 'artboard',
          strict: true,
          schema: singleArtboardJsonSchema,
        },
      },
      temperature: 0.7,
      stream: true as const,
      stream_options: {
        include_usage: true,
      },
    });

    let accumulatedContent = '';
    let usageData: any = null;
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

      const delta = chunk.choices?.[0]?.delta?.content;

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
      if (chunk.usage) {
        usageData = chunk.usage;
      }
    }

    // Parse the accumulated artboard content
    let artboard: SingleScreen;
    let cleanContent = accumulatedContent.trim();
    if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '');
    }

    try {
      artboard = JSON.parse(cleanContent) as SingleScreen;
    } catch (e) {
      console.error('[ArtboardCreator] JSON Parse Error:', e, 'Content length:', cleanContent.length);
      // Fallback: extract fields from partial JSON (e.g. unterminated html string)
      const unescapeJsonStr = (s: string) =>
        (s ?? '')
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\');
      const titleMatch = cleanContent.match(/"title"\s*:\s*"((?:\\.|[^"\\])*?)"/);
      const descMatch = cleanContent.match(/"description"\s*:\s*"((?:\\.|[^"\\])*?)"/);
      const htmlMatch = cleanContent.match(/"html"\s*:\s*"((?:\\.|[^"\\])*?)(?:"\s*[,}]|$)/);
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
      reasoningTokens: usageData?.completion_tokens_details?.reasoning_tokens || 0,
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
    const credits = await this.creditManager.deductCredits(
      userId,
      designId,
      'screen_creation',
      tokenUsage,
    );

    // Yield final complete artboard
    yield {
      type: 'complete',
      data: { ...artboard, credits },
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
    const fontInstructions = generateFontInstructions(colorPalette);
    const previousScreensContext = formatPreviousScreensForDesignPattern(previousScreens);

    const prompts = PromptManager.getPrompts(designType);
    const systemPrompt = await prompts.generationTemplate.format({
      colorPaletteInstructions,
      fontInstructions,
      message,
      title: promptData.title,
      description: designType + ' design ' + promptData.title,
      prompt: promptData.prompt,
      previousScreensContext,
    });

    const userContent = `Original request: ${message}\n\nSpecific artboard prompt: ${promptData.prompt}`;
    const allMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system' as const, content: systemPrompt },
      ...contextMessages.slice(-15),
      { role: 'user' as const, content: userContent },
    ];

    checkAborted(signal, `screen_generation:${promptData.title}`);

    const response = await withTimeout(
      this.client.chat.completions.create({
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
        temperature: 0.7,
      } as any),
      LLM_CONFIG.REQUEST_TIMEOUT_MS,
      `Screen Generation: ${promptData.title}`,
      signal,
    );

    const content = response.choices[0]?.message?.content;
    let cleanContent = content || '{}';
    if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '');
    }
    const artboard = JSON.parse(cleanContent) as SingleScreen;

    const usage = response.usage || {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    };

    const tokenUsage = {
      inputTokens: usage.prompt_tokens || 0,
      outputTokens: usage.completion_tokens || 0,
      totalTokens: usage.total_tokens || 0,
      reasoningTokens: (usage as any).completion_tokens_details?.reasoning_tokens || 0,
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

    artboard.credits = await this.creditManager.deductCredits(
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
    const newX = lastArtboard?.x != null ? Number(lastArtboard.x) + 600 : 0;
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
