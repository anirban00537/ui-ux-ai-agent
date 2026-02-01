const THEME_CLASSES_BLOCK = `
STRICT THEME MAPPINGS (use ONLY these Tailwind classes; they map to CSS vars):
- Background: bg-background | Foreground: text-foreground
- Primary: bg-primary | Primary Foreground: text-primary-foreground
- Secondary: bg-secondary | Secondary Foreground: text-secondary-foreground
- Muted Foreground: text-muted-foreground (hints, captions)
- Card: bg-card | Card Foreground: text-card-foreground
- Border: border-border | Input: bg-input, border-input

On bg-primary use text-primary-foreground. On bg-secondary use text-secondary-foreground. On bg-card use text-card-foreground. On images use scrim + text-foreground. DO NOT use arbitrary colors (e.g. bg-[#...]). WCAG contrast everywhere.`;

const generateColorPaletteInstructions = (
  colorPalette?: ColorPalette | null,
): string => {
  if (!colorPalette) {
    return `COLOR PALETTE: Use the full theme system: bg-background, text-foreground, bg-primary, text-primary-foreground, bg-secondary, text-secondary-foreground, text-muted-foreground, bg-card, text-card-foreground, border-border, bg-input. On primary/secondary/card use the matching foreground class. On images use scrim + text-foreground. DO NOT use arbitrary Tailwind color values (e.g. bg-[#...]).`;
  }
  return `DESIGN SYSTEM (11-color theme) - SAME FOR EVERY SCREEN:${THEME_CLASSES_BLOCK}`;
};

import { OpenRouter } from '@openrouter/sdk';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  type SingleScreen,
  type ExistingArtboard,
  type ColorPalette,
  type PreviousScreenContext,
} from '../../schemas';
import { CreditManager } from '../credit-manager';
import { coreConstant } from '../../../../shared/helpers/coreConstant';
import { AiUsageService } from '../../../subscription/services/ai-usage.service';
import { PromptManager } from '../prompts/prompt-manager';

// Simple schema for the artboard output
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

const MAX_HTML_LENGTH_PER_SCREEN = 2500;

function formatPreviousScreensForDesignPattern(
  screens: PreviousScreenContext[],
): string {
  if (screens.length === 0)
    return '(No other screens — maintain design pattern consistency.)';
  return screens
    .map(
      (s) =>
        `--- "${s.title}" ---\n${(s.description || '').slice(0, 200)}\nHTML (match design pattern):\n${s.html.slice(0, MAX_HTML_LENGTH_PER_SCREEN)}${s.html.length > MAX_HTML_LENGTH_PER_SCREEN ? '\n...[truncated]' : ''}`,
    )
    .join('\n\n');
}

export class ArtboardUpdater {
  private openrouter = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
  });

  constructor(
    private prisma: PrismaService,
    private creditManager: CreditManager,
    private aiUsageService: AiUsageService,
  ) {}

  async updateArtboard(
    artboard: ExistingArtboard,
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
  ): Promise<SingleScreen> {
    const colorPaletteInstructions = generateColorPaletteInstructions(colorPalette);
    const previousScreensContext = formatPreviousScreensForDesignPattern(previousScreens);

    const prompts = PromptManager.getPrompts(designType);
    const systemPrompt = await prompts.updateTemplate.format({
      colorPaletteInstructions,
      previousScreensContext,
    });

    const userContent = `Current artboard:\nTitle: ${artboard.title}\nDescription: ${artboard.description}\nHTML: ${artboard.html}\n***Update request***: ${message}`;
    const allMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...contextMessages,
      { role: 'user' as const, content: userContent },
    ];

    const response = await this.openrouter.chat.send({
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
      stream: false,
    });

    const content = response.choices[0]?.message?.content;
    const updatedArtboard = (typeof content === 'object' ? content : JSON.parse(content ?? '{}')) as SingleScreen;

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

    console.log('[ArtboardUpdater] Deducting credits for artboard update:', tokenUsage);

    // Cost logging
    await this.aiUsageService.logUsage({
      userId,
      modelName: coreConstant.AI_MODELS.DESIGN.NAME,
      inputTokens: tokenUsage.inputTokens,
      outputTokens: tokenUsage.outputTokens,
      type: 'screen_update',
      designId,
    } as any);

    // Deduct credits immediately after update
    await this.creditManager.deductCredits(
      userId,
      designId,
      'screen_update',
      tokenUsage,
    );

    return updatedArtboard;
  }

  async saveUpdatedArtboard(
    artboardId: string,
    updateData: SingleScreen,
  ): Promise<ExistingArtboard> {
    return await this.prisma.artboard.update({
      where: { id: artboardId },
      data: {
        title: updateData.title,
        description: updateData.description,
        html: updateData.html,
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

  async getArtboardById(artboardId: string): Promise<ExistingArtboard | null> {
    return await this.prisma.artboard.findUnique({
      where: { id: artboardId },
    });
  }
}

export default ArtboardUpdater;
