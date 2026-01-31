import { OpenRouter } from '@openrouter/sdk';
import { PromptTemplate } from '@langchain/core/prompts';
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

// JSON Schema for ScreenPlan (replaces Zod schema)
const screenPlanJsonSchema = {
  type: 'object',
  properties: {
    totalScreens: {
      type: 'number',
      minimum: 1,
      maximum: 8,
      description: 'Total number of screens needed',
    },
    screenPrompts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Screen title',
          },
          prompt: {
            type: 'string',
            description: 'Detailed prompt for generating this specific screen',
          },
          order: {
            type: 'number',
            description: 'Order of screen generation',
          },
        },
        required: ['title', 'prompt', 'order'],
        additionalProperties: false,
      },
      description: 'Individual prompts for each screen',
    },
  },
  required: ['totalScreens', 'screenPrompts'],
  additionalProperties: false,
};

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

const screenGenerationTemplate = PromptTemplate.fromTemplate(
  `ROLE: You are a World-Class UI/UX Designer (Top 1% on Dribbble/Behance). You build stunning, production-ready mobile screens using TailwindCSS.

USER REQUEST: "{message}"

{colorPaletteInstructions}

` + designSystemInstructions + `

SPECIFIC INSTRUCTIONS FOR THIS SCREEN:
- Title: {title}
- Description: {description}
- Prompt: {prompt}

OUTPUT FORMAT (STRICT):
- Return a Single JSON object: {{ html, title, description }}
- HTML must be a full <div>...</div> structure (using Tailwind classes).
- DO NOT return markdown, code blocks, or explanations. Just the JSON.
- Ensure the HTML is valid and self-contained (no external CSS/JS needed other than Tailwind/RemixIcon).

YOUR GOAL:
Take the user's potentially simple request and elevate it to a "Design of the Day" winner. Add features, visual polish, and thoughtful UX that the user didn't explicitly ask for but would be delighted to see.
`
);

const screenPlanningTemplate = PromptTemplate.fromTemplate(
  `ROLE: You are a Lead Product Manager & UX Architect.

USER REQUEST: "{message}"

YOUR TASK:
Plan a series of mobile screens (1 to 5) to fulfill the user's request.
- If the request is simple ("login screen"), plan just that 1 screen (or maybe 2 if a "forgot password" or "onboarding" makes sense).
- If the request is complex ("dating app"), plan the core 3-5 screens needed for an MVP (e.g., Profile, Swipe, Matches, Messages).

GUIDELINES:
1. **Be Specific**: Don't just say "Home". Say "Dashboard - User Overview & Daily Stats".
2. **Be Creative**: Add delight. Instead of "Settings", maybe "Profile & Personalization".
3. **Flow**: Ensure the screens make logical sense as a user journey.
4. **Detail**: For each screen, write a "prompt" that a designer (AI) can use to build it. Include details about layout, key features, and vibe.

OUTPUT FORMAT (JSON Schema):
{{
  "totalScreens": number,
  "screenPrompts": [
    {{ "title": "string", "prompt": "detailed design instructions", "order": number }}
  ]
}}
`
);

export class ScreenCreator {
  private openrouter = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
  });

  constructor(
    private prisma: PrismaService,
    private creditManager: CreditManager,
    private aiUsageService: AiUsageService,
  ) {}

  async planScreens(
    message: string,
    contextMessages: Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
    }>,
    userId: string,
    designId: string,
  ): Promise<ScreenPlan> {
    const planningPrompt = await screenPlanningTemplate.format({
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
          name: 'screenPlan',
          strict: true,
          schema: screenPlanJsonSchema,
        },
      },
      temperature: 0.7,
      stream: false,
    });

    const content = response.choices[0]?.message?.content;
    const screenPlan = (typeof content === 'object' ? content : JSON.parse(content ?? '{}')) as ScreenPlan;

    // Fix inconsistency: ensure totalScreens matches screenPrompts.length
    if (screenPlan.totalScreens !== screenPlan.screenPrompts.length) {
      console.warn(
        `[ScreenCreator] Inconsistent screen plan: totalScreens=${screenPlan.totalScreens}, screenPrompts.length=${screenPlan.screenPrompts.length}. Fixing...`,
      );
      screenPlan.totalScreens = screenPlan.screenPrompts.length;
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

    console.log('[ScreenCreator] Deducting credits for planning:', tokenUsage);

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

    return screenPlan;
  }

  async generateScreen(
    screenPrompt: ScreenPromptData,
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
    const generationPrompt = await screenGenerationTemplate.format({
      colorPaletteInstructions,
      message,
      title: screenPrompt.title,
      description: 'Mobile screen design ' + screenPrompt.title,
      prompt: screenPrompt.prompt,
    });

    const userContent = `Original request: ${message}\n\nSpecific screen prompt: ${screenPrompt.prompt}`;
    const allMessages = [
      { role: 'system' as const, content: generationPrompt },
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
    const screen = (typeof content === 'object' ? content : JSON.parse(content ?? '{}')) as SingleScreen;

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
      '[ScreenCreator] Deducting credits for screen generation:',
      tokenUsage,
    );

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

    return screen;
  }

  async saveScreen(
    screen: SingleScreen,
    designId: string,
  ): Promise<ExistingArtboard> {
    return await this.prisma.artboard.create({
      data: {
        designId,
        title: screen.title,
        description: screen.description,
        html: screen.html,
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

export default ScreenCreator;
