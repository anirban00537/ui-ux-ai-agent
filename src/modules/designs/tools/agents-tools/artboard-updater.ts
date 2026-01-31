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

// JSON Schema for SingleScreen (replaces Zod schema)
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

  return `COLOR PALETTE (STRICT ADHERENCE REQUIRED):
Use ONLY these specific colors from the conversation's color palette:

PRIMARY COLORS:
- Primary: ${
    colorPalette.primary
  } (use for main CTAs, primary buttons, key highlights)
${
  colorPalette.primaryLight
    ? `- Primary Light: ${colorPalette.primaryLight} (use for hover states, light backgrounds)`
    : ''
}
${
  colorPalette.primaryDark
    ? `- Primary Dark: ${colorPalette.primaryDark} (use for active states, emphasis)`
    : ''
}
${
  colorPalette.secondary
    ? `- Secondary: ${colorPalette.secondary} (use for secondary actions, complementary elements)`
    : ''
}
${
  colorPalette.accent
    ? `- Accent: ${colorPalette.accent} (use for highlights, notifications, special elements)`
    : ''
}

BACKGROUND & SURFACE:
- Background: ${colorPalette.background} (main app background)
${
  colorPalette.backgroundSecondary
    ? `- Background Secondary: ${colorPalette.backgroundSecondary} (secondary backgrounds)`
    : ''
}
- Surface: ${colorPalette.surface} (cards, containers, elevated surfaces)
${
  colorPalette.surfaceSecondary
    ? `- Surface Secondary: ${colorPalette.surfaceSecondary} (secondary surfaces)`
    : ''
}

TEXT COLORS:
- Text Primary: ${colorPalette.textPrimary} (main text, headings)
- Text Secondary: ${colorPalette.textSecondary} (secondary text, descriptions)
${
  colorPalette.textMuted
    ? `- Text Muted: ${colorPalette.textMuted} (muted text, placeholders)`
    : ''
}

BORDERS & STATES:
${
  colorPalette.border
    ? `- Border: ${colorPalette.border} (main borders, dividers)`
    : ''
}
${
  colorPalette.borderLight
    ? `- Border Light: ${colorPalette.borderLight} (subtle borders)`
    : ''
}
${
  colorPalette.success
    ? `- Success: ${colorPalette.success} (success states, confirmations)`
    : ''
}
${
  colorPalette.warning
    ? `- Warning: ${colorPalette.warning} (warning states, cautions)`
    : ''
}
${
  colorPalette.error
    ? `- Error: ${colorPalette.error} (error states, destructive actions)`
    : ''
}
${
  colorPalette.info
    ? `- Info: ${colorPalette.info} (info states, neutral notifications)`
    : ''
}

IMPLEMENTATION RULES:
- Convert hex colors to appropriate Tailwind classes or use arbitrary values like bg-[${
    colorPalette.primary
  }]
- Maintain proper contrast ratios (4.5:1 minimum for text)
- Use the palette consistently across all UI elements
- Do not deviate from these colors unless absolutely necessary for accessibility`;
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
    const colorPaletteInstructions =
      generateColorPaletteInstructions(colorPalette);
    
    const prompts = PromptManager.getPrompts(designType);
    const updatePrompt = await prompts.updateTemplate.format({
      colorPaletteInstructions,
    });

    const userContent = `Current artboard:\nTitle: ${artboard.title}\nDescription: ${artboard.description}\nHTML: ${artboard.html}\n***Update request***: ${message}`;
    const allMessages = [
      { role: 'system' as const, content: updatePrompt },
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

    console.log(
      '[ArtboardUpdater] Deducting credits for artboard update:',
      tokenUsage,
    );

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
