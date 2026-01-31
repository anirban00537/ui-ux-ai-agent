import { OpenRouter } from '@openrouter/sdk';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  type ScreenPlan,
  type SingleScreen,
  type ScreenPromptData,
  type ExistingArtboard,
  type ColorPalette,
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
    return `COLOR PALETTE: Use default Tailwind colors with good contrast and accessibility.`;
  }

  return `DESIGN SYSTEM (STRICT ADHERENCE REQUIRED):
The app uses a CSS variable-driven Design System. You MUST use semantic Tailwind classes that map to these variables.

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

CHART COLORS (for data viz):
- Chart 1: ${colorPalette.chart1}
- Chart 2: ${colorPalette.chart2}
- Chart 3: ${colorPalette.chart3}
- Chart 4: ${colorPalette.chart4}
- Chart 5: ${colorPalette.chart5}

IMPLEMENTATION RULES:
1. PREFER semantic classes (e.g., "bg-primary text-primary-foreground") over hardcoded hex codes.
2. If you need a specific variant, use arbitrary values with variables: e.g., "bg-[var(--primary)]/80" for 80% opacity.
3. Ensure all text meets WCAG AA contrast standards. The "Foreground" tokens are specifically chosen to contrast with their parent backgrounds.
4. Use "rounded-lg", "rounded-md", or "rounded-sm" to respect the system's border radius.`;
};

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
      temperature: 0.7,
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
   * Generate an artboard with pre-fetched images
   */
  async generateArtboard(
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
  ): Promise<SingleScreen> {
    const colorPaletteInstructions = generateColorPaletteInstructions(colorPalette);
    
    const prompts = PromptManager.getPrompts(designType);
    const systemPrompt = await prompts.generationTemplate.format({
      colorPaletteInstructions,
      message,
      title: promptData.title,
      description: designType + ' design ' + promptData.title,
      prompt: promptData.prompt,
    });

    const userContent = `Original request: ${message}\n\nSpecific artboard prompt: ${promptData.prompt}`;
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
    const artboard = (typeof content === 'object' ? content : JSON.parse(content ?? '{}')) as SingleScreen;

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

    // Deduct credits immediately after generation
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
