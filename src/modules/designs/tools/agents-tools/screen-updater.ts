import { OpenRouter } from '@openrouter/sdk';
import { PromptTemplate } from '@langchain/core/prompts';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  type SingleScreen,
  type ExistingArtboard,
  type ColorPalette,
} from '../../schemas';
import { CreditManager } from '../credit-manager';
import { coreConstant } from '../../../../shared/helpers/coreConstant';
import { AiUsageService } from '../../../subscription/services/ai-usage.service';

// JSON Schema for SingleScreen (replaces Zod schema)
const singleScreenJsonSchema = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      description: 'A concise title for the mobile screen',
    },
    description: {
      type: 'string',
      description: "A brief description of the screen's purpose and functionality",
    },
    html: {
      type: 'string',
      description: 'Complete HTML code for the mobile screen',
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

const designSystemInstructions = `
DESIGN SYSTEM & IMPLEMENTATION GUIDELINES (STRICT):

1. LAYOUT & SPACING (8pt Grid System):
   - Use strict 8pt grid: px-4 (16px), p-6 (24px), gap-4, mb-8, etc.
   - For mobile (300px width), use COMPACT spacing: px-4 or px-5 is standard.
   - Whitespace: Use abundant whitespace (space-y-6, py-8) to create premium feel.
   - Safe Areas: Ensure content doesn't touch edges (always use px-4 minimal).

2. TYPOGRAPHY (Modern & Hierarchical):
   - Font Family: Use sans-serif default (Inter-like).
   - Hierarchy:
     * H1: text-2xl or text-3xl, font-bold, tight-tracking (tracking-tight)
     * H2: text-xl, font-semibold
     * Body: text-sm or text-base, text-gray-600 (never pure black for body)
     * Caption: text-xs, text-gray-500
   - Readability: relaxed leading (leading-relaxed) for body text.

3. COLORS & CONTRAST (Premium Palette):
   - Never use pure black (#000000). Use slate-900, gray-900, or zinc-900.
   - Never use default blue/red/green. Use tailored shades (e.g., blue-600, rose-500, emerald-500).
   - Backgrounds: Use subtle off-whites (bg-gray-50/bg-slate-50) for depth, white for cards.
   - Gradients: Use subtle, modern gradients for primary actions (e.g., bg-gradient-to-r from-blue-600 to-indigo-600).

4. COMPONENTS & INTERACTIVITY:
   - Buttons:
     * Primary: rounded-xl or rounded-2xl, shadow-lg, shadow-primary/20, active:scale-95 transition-all
     * Secondary: bg-gray-100 text-gray-900, hover:bg-gray-200
     * Height: Minimum h-12 (48px) for thumb-friendliness.
   - Cards:
     * bg-white, rounded-2xl or rounded-3xl.
     * Shadows: shadow-[0_2px_8px_rgba(0,0,0,0.08)] (custom arbitrary) or shadow-sm/md.
     * Borders: border border-gray-100 (subtle).
   - Inputs:
     * bg-gray-50, border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded-xl.

5. VISUAL FLOURISHES (The "Wow" Factor):
   - Glassmorphism: backdrop-blur-md bg-white/80 for sticky headers/overlays.
   - Micro-interactions: hover:scale-[1.02] on cards, active:scale-95 on buttons.
   - Images: rounded-2xl, shadow-md, object-cover.
   - Icons: Use remixicon (e.g., <i class="ri-heart-line"></i>). text-xl or text-2xl.

6. CONTENT GENERATION (Smart Fill):
   - If user request is simple ("make a login page"), YOU MUST INVENT THE BRAND.
   - Create a fictitious but realistic brand name, logo concept, and copy.
   - NEVER use "Lorem Ipsum". Write real, engaging marketing copy.
   - If context is missing, infer it from standard industry patterns (e.g., for a fitness app, assume tracking, social, and profile features).

IMAGERY POLICY (STRICT):
- Use Unsplash URLs: https://images.unsplash.com/photo-[ID]?auto=format&fit=crop&w=600&q=80
- Select high-quality, relevant IDs.
- NEVER use placeholders.

MOBILE OPTIMIZATION (300px Frame):
- The output HTML will be rendered in a phone frame (~300-320px width).
- Ensure flex-wrap: wrap for grids that might break.
- Use line-clamp-2 for long text.
- Avoid fixed widths > 280px. Use w-full.
`;

const screenUpdateTemplate = PromptTemplate.fromTemplate(
  `ROLE: You are a Staff Product Designer from Apple/Stripe/Linear updating an existing mobile screen. Your expertise is in making TARGETED IMPROVEMENTS that enhance quality while preserving what already works. Think like a surgeon, not a demolition crew.

{colorPaletteInstructions}

` + designSystemInstructions + `

OUTPUT FORMAT (STRICT):
- Return a Single JSON object: {{ html, title, description }}
- HTML must be a full <div>...</div> structure (using Tailwind classes).
- DO NOT return markdown, code blocks, or explanations. Just the JSON.

PRESERVATION-FIRST UPDATE PHILOSOPHY:

1. PRESERVE CORE STRUCTURE (Unless explicitly asked to change):
   - Layout & Navigation: Keep the overall page structure and content sections.
   - Design System Consistency: Maintain spacing patterns, border radius, and shadow patterns.
   - Working Functionality: Keep all existing interactive elements that work well.

2. TARGETED IMPROVEMENTS (Focus on what's requested):
   - Make the SPECIFIC changes the user requested.
   - Improve related areas that directly support the request.
   - Don't change unrelated parts of the screen unless they violate the Design System (above).
   - Think: "What's the minimum change that achieves maximum impact?"

3. PROFESSIONAL UPDATE STANDARDS:
   - Address the specific user request directly.
   - Maintain or improve accessibility (WCAG AA standards).
   - Ensure 44x44px minimum touch targets.
   - Use proper TailwindCSS utilities.
   - Updates must feel polished and intentional.
`
);

export class ScreenUpdater {
  private openrouter = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
  });

  constructor(
    private prisma: PrismaService,
    private creditManager: CreditManager,
    private aiUsageService: AiUsageService,
  ) {}

  async updateScreen(
    screen: ExistingArtboard,
    message: string,
    contextMessages: Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
    }>,
    colorPalette: ColorPalette | null | undefined,
    userId: string,
    designId: string,
  ): Promise<SingleScreen> {
    const colorPaletteInstructions =
      generateColorPaletteInstructions(colorPalette);
    const updatePrompt = await screenUpdateTemplate.format({
      colorPaletteInstructions,
    });

    const userContent = `Current screen:\nTitle: ${screen.title}\nDescription: ${screen.description}\nHTML: ${screen.html}\n***Update request***: ${message}`;
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
          name: 'screen',
          strict: true,
          schema: singleScreenJsonSchema,
        },
      },
      temperature: 0.7,
      stream: false,
    });

    const content = response.choices[0]?.message?.content;
    const updatedScreen = (typeof content === 'object' ? content : JSON.parse(content ?? '{}')) as SingleScreen;

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
      '[ScreenUpdater] Deducting credits for screen update:',
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

    return updatedScreen;
  }

  /**
   * Saves the updated screen to the database
   * @param screenId - The ID of the screen to update
   * @param updateData - The new screen data
   * @returns Promise<ExistingScreen> - The updated screen from database
   */
  async saveUpdatedScreen(
    screenId: string,
    updateData: SingleScreen,
  ): Promise<ExistingArtboard> {
    return await this.prisma.artboard.update({
      where: { id: screenId },
      data: {
        title: updateData.title,
        description: updateData.description,
        html: updateData.html,
      },
    });
  }

  /**
   * Saves an assistant message to the database
   * @param conversationId - The conversation ID
   * @param content - The message content
   */
  async saveAssistantMessage(designId: string, content: string): Promise<void> {
    await this.prisma.message.create({
      data: {
        designId,
        content,
        role: 'assistant',
      },
    });
  }

  /**
   * Gets a screen by ID from the database
   * @param screenId - The screen ID to fetch
   * @returns Promise<ExistingScreen | null> - The screen or null if not found
   */
  async getScreenById(screenId: string): Promise<ExistingArtboard | null> {
    return await this.prisma.artboard.findUnique({
      where: { id: screenId },
    });
  }
}

export default ScreenUpdater;
