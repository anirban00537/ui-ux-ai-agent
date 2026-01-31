const generateColorPaletteInstructions = (
  colorPalette?: ColorPalette | null,
): string => {
  if (!colorPalette) {
    return `COLOR PALETTE: Use default Tailwind colors with good contrast and accessibility.`;
  }

  return `DESIGN SYSTEM (STRICT ADHERENCE REQUIRED):
The app uses a CSS variable-driven Design System. When updating the HTML, you MUST use semantic Tailwind classes that map to these variables.

CORE SYSTEM COLORS:
- Background: ${colorPalette.background} -> use class "bg-background"
- Foreground: ${colorPalette.foreground} -> use class "text-foreground"
- Primary: ${colorPalette.primary} -> use class "bg-primary" or "text-primary"
- Primary Foreground: ${colorPalette.primaryForeground} -> use class "text-primary-foreground" (text on primary bg)
- Secondary: ${colorPalette.secondary} -> use class "bg-secondary"
- Secondary Foreground: ${colorPalette.secondaryForeground} -> use class "text-secondary-foreground"
- Card: ${colorPalette.card} -> use class "bg-card"
- Card Foreground: ${colorPalette.cardForeground} -> use class "text-card-foreground"
- Muted: ${colorPalette.muted} -> use class "bg-muted"
- Muted Foreground: ${colorPalette.mutedForeground} -> use class "text-muted-foreground"
- Accent: ${colorPalette.accent} -> use class "bg-accent"
- Accent Foreground: ${colorPalette.accentForeground} -> use class "text-accent-foreground"
- Destructive: ${colorPalette.destructive} -> use class "bg-destructive"
- Destructive Foreground: ${colorPalette.destructiveForeground} -> use class "text-destructive-foreground"
- Border: ${colorPalette.border} -> use class "border-border"
- Input: ${colorPalette.input} -> use class "border-input"
- Ring: ${colorPalette.ring} -> use class "ring-ring"

RADIUS & SHAPE:
- Radius: ${colorPalette.radius} -> use classes "rounded-lg" (full radius), "rounded-md" (inner), "rounded-sm"

IMPLEMENTATION RULES:
1. USE semantic classes (e.g., "bg-primary text-primary-foreground") to ensure the UI remains themeable.
2. If you need a specific variant, use arbitrary values with variables: e.g., "bg-[var(--primary)]/80" for 80% opacity.
3. Ensure all text meets WCAG AA contrast standards. Use the "Foreground" tokens on their respective parents.
4. Use "rounded-lg", "rounded-md", or "rounded-sm" to respect the system's border radius.`;
};

import { OpenRouter } from '@openrouter/sdk';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  type SingleScreen,
  type ExistingArtboard,
  type ColorPalette,
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
  ): Promise<SingleScreen> {
    const colorPaletteInstructions = generateColorPaletteInstructions(colorPalette);
    
    const prompts = PromptManager.getPrompts(designType);
    const systemPrompt = await prompts.updateTemplate.format({
      colorPaletteInstructions,
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
      temperature: 0.7,
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
