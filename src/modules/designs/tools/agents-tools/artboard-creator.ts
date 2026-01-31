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
import { ImagesService } from '../../../images/images.service';

/**
 * Interface for image query included in screen prompts
 */
export interface ImageQuery {
  query: string;
  purpose: string;
  orientation: 'landscape' | 'portrait' | 'squarish';
}

/**
 * Extended screen prompt that includes image queries
 */
export interface ScreenPromptWithImages {
  title: string;
  prompt: string;
  order: number;
  imageQueries: ImageQuery[];
}

/**
 * Extended screen plan with image queries
 */
export interface ScreenPlanWithImages {
  totalScreens: number;
  screenPrompts: ScreenPromptWithImages[];
}

/**
 * Fetched image with metadata
 */
export interface FetchedImage {
  url: string;
  purpose: string;
  query: string;
  orientation: 'landscape' | 'portrait' | 'squarish';
}

// JSON Schema for ScreenPlan with integrated image queries
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
          imageQueries: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Unsplash search query - specific, descriptive keywords (e.g., "modern office workspace aerial view")',
                },
                purpose: {
                  type: 'string',
                  description: 'What this image will be used for (hero, background, card, avatar, feature, icon)',
                },
                orientation: {
                  type: 'string',
                  enum: ['landscape', 'portrait', 'squarish'],
                  description: 'Image orientation preference',
                },
              },
              required: ['query', 'purpose', 'orientation'],
              additionalProperties: false,
            },
            description: 'Image queries for this artboard (0-5 images). Be specific with queries.',
          },
        },
        required: ['title', 'prompt', 'order', 'imageQueries'],
        additionalProperties: false,
      },
      description: 'Individual prompts for each artboard with their image requirements',
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

  return `COLOR PALETTE (STRICT ADHERENCE REQUIRED):
Use ONLY these specific colors from the conversation's color palette:

PRIMARY COLORS:
- Primary: ${colorPalette.primary} (use for main CTAs, primary buttons, key highlights)
${colorPalette.primaryLight ? `- Primary Light: ${colorPalette.primaryLight} (use for hover states, light backgrounds)` : ''}
${colorPalette.primaryDark ? `- Primary Dark: ${colorPalette.primaryDark} (use for active states, emphasis)` : ''}
${colorPalette.secondary ? `- Secondary: ${colorPalette.secondary} (use for secondary actions, complementary elements)` : ''}
${colorPalette.accent ? `- Accent: ${colorPalette.accent} (use for highlights, notifications, special elements)` : ''}

BACKGROUND & SURFACE:
- Background: ${colorPalette.background} (main app background)
${colorPalette.backgroundSecondary ? `- Background Secondary: ${colorPalette.backgroundSecondary} (secondary backgrounds)` : ''}
- Surface: ${colorPalette.surface} (cards, containers, elevated surfaces)
${colorPalette.surfaceSecondary ? `- Surface Secondary: ${colorPalette.surfaceSecondary} (secondary surfaces)` : ''}

TEXT COLORS:
- Text Primary: ${colorPalette.textPrimary} (main text, headings)
- Text Secondary: ${colorPalette.textSecondary} (secondary text, descriptions)
${colorPalette.textMuted ? `- Text Muted: ${colorPalette.textMuted} (muted text, placeholders)` : ''}

BORDERS & STATES:
${colorPalette.border ? `- Border: ${colorPalette.border} (main borders, dividers)` : ''}
${colorPalette.borderLight ? `- Border Light: ${colorPalette.borderLight} (subtle borders)` : ''}
${colorPalette.success ? `- Success: ${colorPalette.success} (success states, confirmations)` : ''}
${colorPalette.warning ? `- Warning: ${colorPalette.warning} (warning states, cautions)` : ''}
${colorPalette.error ? `- Error: ${colorPalette.error} (error states, destructive actions)` : ''}
${colorPalette.info ? `- Info: ${colorPalette.info} (info states, neutral notifications)` : ''}

IMPLEMENTATION RULES:
- Convert hex colors to appropriate Tailwind classes or use arbitrary values like bg-[${colorPalette.primary}]
- Maintain proper contrast ratios (4.5:1 minimum for text)
- Use the palette consistently across all UI elements
- Do not deviate from these colors unless absolutely necessary for accessibility`;
};

/**
 * Format fetched images for LLM context injection
 */
const formatImagesForContext = (fetchedImages: FetchedImage[]): string => {
  if (fetchedImages.length === 0) {
    return '';
  }

  let context = `
AVAILABLE IMAGES (USE THESE EXACT URLS):
You have been provided with ${fetchedImages.length} pre-fetched, verified image(s) from Unsplash.
You MUST use these images instead of making up URLs.

`;

  fetchedImages.forEach((img, index) => {
    context += `IMAGE ${index + 1}:
- Purpose: ${img.purpose}
- URL: ${img.url}
- Orientation: ${img.orientation}

`;
  });

  context += `
CRITICAL IMAGE INSTRUCTIONS:
1. Use the EXACT URLs provided above - do NOT modify them
2. Apply appropriate Tailwind classes for sizing (object-cover, rounded-xl, etc.)
3. Match the image to its intended purpose
4. If you need MORE images than provided, use Unsplash URLs with format:
   https://images.unsplash.com/photo-[specific-id]?auto=format&fit=crop&w=1200&q=80
5. NEVER use placeholder URLs or lorem picsum
`;

  return context;
};

export class ArtboardCreator {
  private openrouter = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
  });
  
  // Track used image URLs across the design session to prevent duplicates
  private usedImageUrls: string[] = [];
  
  // Professional fallback images by orientation
  private readonly fallbackImages = {
    landscape: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=80',
    portrait: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    squarish: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=1000&q=80',
  };

  constructor(
    private prisma: PrismaService,
    private creditManager: CreditManager,
    private aiUsageService: AiUsageService,
    private imagesService?: ImagesService,
  ) {}

  /**
   * Reset the used image URLs tracker (call at start of new design session)
   */
  resetUsedImages(): void {
    this.usedImageUrls = [];
  }

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
  ): Promise<ScreenPlanWithImages> {
    // Reset used images at start of new planning session
    this.resetUsedImages();
    
    const prompts = PromptManager.getPrompts(designType);
    const basePlanningPrompt = await prompts.planningTemplate.format({
      message,
    });

    // Enhance planning prompt with image query instructions
    const planningPrompt = `${basePlanningPrompt}

IMAGE REQUIREMENTS:
For each screen/artboard, you must also determine the image requirements:
- Analyze what images would make this screen look professional and polished
- Generate 0-5 image queries per screen (mobile apps typically need 0-3, presentations need 1-2)
- Be SPECIFIC with queries (e.g., "young professional woman smiling laptop modern office" not just "person")
- Specify the purpose (hero, background, card, avatar, feature, icon)
- Specify orientation (landscape for headers/backgrounds, portrait for profiles, squarish for cards/icons)

IMAGE PURPOSE GUIDELINES:
- "hero": Large main visual, often at top of screen
- "background": Subtle backdrop, often blurred or with overlay
- "card": Small thumbnail in a card component
- "avatar": Profile picture or person photo
- "feature": Product/feature illustration
- "icon": Decorative visual element`;

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
    const plan = (typeof content === 'object' ? content : JSON.parse(content ?? '{}')) as ScreenPlanWithImages;

    // Fix inconsistency: ensure totalScreens matches screenPrompts.length
    if (plan.totalScreens !== plan.screenPrompts.length) {
      console.warn(
        `[ArtboardCreator] Inconsistent plan: totalScreens=${plan.totalScreens}, screenPrompts.length=${plan.screenPrompts.length}. Fixing...`,
      );
      plan.totalScreens = plan.screenPrompts.length;
    }

    // Log image queries for debugging
    plan.screenPrompts.forEach((sp) => {
      console.log(`[ArtboardCreator] "${sp.title}" needs ${sp.imageQueries?.length || 0} images`);
      sp.imageQueries?.forEach((q, i) => {
        console.log(`  [${i + 1}] ${q.purpose}: "${q.query}" (${q.orientation})`);
      });
    });

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
   * Fetch images based on the queries from the planning phase
   */
  async fetchImagesForArtboard(
    imageQueries: ImageQuery[],
  ): Promise<FetchedImage[]> {
    if (!this.imagesService || !imageQueries || imageQueries.length === 0) {
      return [];
    }

    const fetchedImages: FetchedImage[] = [];

    console.log(`[ArtboardCreator] Fetching ${imageQueries.length} images...`);

    for (const query of imageQueries) {
      try {
        const imageUrl = await this.imagesService.searchUnsplashSimple(
          query.query,
          query.orientation,
          this.usedImageUrls,
        );

        fetchedImages.push({
          url: imageUrl,
          purpose: query.purpose,
          query: query.query,
          orientation: query.orientation,
        });

        // Track this URL to prevent reuse
        this.usedImageUrls.push(imageUrl);

        console.log(`  ✅ Fetched "${query.purpose}": ${imageUrl.substring(0, 60)}...`);
      } catch (error) {
        console.error(`  ❌ Error fetching "${query.purpose}":`, error);
        
        // Use fallback image
        const fallbackUrl = this.fallbackImages[query.orientation];
        fetchedImages.push({
          url: fallbackUrl,
          purpose: query.purpose,
          query: query.query,
          orientation: query.orientation,
        });
        this.usedImageUrls.push(fallbackUrl);
      }
    }

    return fetchedImages;
  }

  /**
   * Generate an artboard with pre-fetched images
   */
  async generateArtboard(
    promptData: ScreenPromptWithImages,
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
    // Fetch images using the queries from planning
    const fetchedImages = await this.fetchImagesForArtboard(promptData.imageQueries || []);
    
    // Generate image context for the LLM
    const imageContext = formatImagesForContext(fetchedImages);

    const colorPaletteInstructions = generateColorPaletteInstructions(colorPalette);
    
    const prompts = PromptManager.getPrompts(designType);
    const generationPrompt = await prompts.generationTemplate.format({
      colorPaletteInstructions,
      message,
      title: promptData.title,
      description: designType + ' design ' + promptData.title,
      prompt: promptData.prompt,
    });

    // Inject image context into the system prompt
    const systemPromptWithImages = imageContext 
      ? `${generationPrompt}\n\n${imageContext}`
      : generationPrompt;

    const userContent = `Original request: ${message}\n\nSpecific artboard prompt: ${promptData.prompt}`;
    const allMessages = [
      { role: 'system' as const, content: systemPromptWithImages },
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
