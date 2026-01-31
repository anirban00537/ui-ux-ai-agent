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
import { ImagesService } from '../../../images/images.service';
import { ImageQuery, FetchedImage } from './artboard-creator';

// JSON Schema for update response with optional image queries
const updateResponseJsonSchema = {
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
    newImageQueries: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Unsplash search query for the new image needed',
          },
          purpose: {
            type: 'string',
            description: 'What this image will be used for',
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
      description: 'New images needed for this update (only if adding/changing images)',
    },
  },
  required: ['title', 'description', 'html', 'newImageQueries'],
  additionalProperties: false,
};

// Simple schema for the actual artboard output
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
NEW IMAGES AVAILABLE (USE THESE EXACT URLS):
${fetchedImages.length} new image(s) have been fetched for this update.

`;

  fetchedImages.forEach((img, index) => {
    context += `IMAGE ${index + 1}:
- Purpose: ${img.purpose}
- URL: ${img.url}
- Orientation: ${img.orientation}

`;
  });

  context += `
Use the EXACT URLs provided above. Do NOT modify them.
`;

  return context;
};

export class ArtboardUpdater {
  private openrouter = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
  });
  
  // Track used image URLs to prevent duplicates
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
   * Extract existing image URLs from the artboard HTML to track them
   */
  private extractExistingImageUrls(html: string): string[] {
    const urlPattern = /https:\/\/images\.unsplash\.com\/[^"'\s)]+/g;
    const matches = html.match(urlPattern) || [];
    return [...new Set(matches)];
  }

  /**
   * Check if the update request likely involves images
   */
  private updateInvolvesImages(message: string): boolean {
    const imageKeywords = ['image', 'photo', 'picture', 'background', 'avatar', 'icon', 'visual', 'illustration', 'hero', 'banner'];
    return imageKeywords.some(kw => message.toLowerCase().includes(kw));
  }

  /**
   * Fetch images for the update
   */
  private async fetchImagesForUpdate(imageQueries: ImageQuery[]): Promise<FetchedImage[]> {
    if (!this.imagesService || !imageQueries || imageQueries.length === 0) {
      return [];
    }

    const fetchedImages: FetchedImage[] = [];

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

        this.usedImageUrls.push(imageUrl);
        console.log(`  ✅ Fetched "${query.purpose}": ${imageUrl.substring(0, 60)}...`);
      } catch (error) {
        console.error(`  ❌ Error fetching "${query.purpose}":`, error);
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
    // Track existing images to avoid duplicates
    const existingImages = this.extractExistingImageUrls(artboard.html);
    this.usedImageUrls = [...existingImages];

    const colorPaletteInstructions = generateColorPaletteInstructions(colorPalette);
    
    const prompts = PromptManager.getPrompts(designType);
    let updatePrompt = await prompts.updateTemplate.format({
      colorPaletteInstructions,
    });

    // Check if this update likely involves images
    const involvesImages = this.updateInvolvesImages(message);
    let fetchedImages: FetchedImage[] = [];

    if (involvesImages && this.imagesService) {
      // First pass: Ask the LLM what images are needed
      console.log('[ArtboardUpdater] Update involves images, analyzing requirements...');
      
      const analysisPrompt = `You are analyzing an update request to determine if new images are needed.

Current artboard has these existing images:
${existingImages.length > 0 ? existingImages.map((url, i) => `- Image ${i + 1}: ${url.substring(0, 80)}...`).join('\n') : '- No images currently'}

Update request: "${message}"

If the update requires NEW or DIFFERENT images, provide specific Unsplash search queries in newImageQueries.
If the update only modifies existing content (text, layout, colors), return an empty array for newImageQueries.

Be specific with queries (e.g., "modern startup team collaboration office" not just "team").`;

      const analysisMessages = [
        { role: 'system' as const, content: analysisPrompt },
        { role: 'user' as const, content: `Current HTML:\n${artboard.html}\n\nUpdate: ${message}` },
      ];

      try {
        const analysisResponse = await this.openrouter.chat.send({
          model: coreConstant.AI_MODELS.DESIGN.NAME,
          messages: analysisMessages,
          responseFormat: {
            type: 'json_schema',
            jsonSchema: {
              name: 'imageAnalysis',
              strict: true,
              schema: {
                type: 'object',
                properties: {
                  newImageQueries: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        query: { type: 'string' },
                        purpose: { type: 'string' },
                        orientation: { type: 'string', enum: ['landscape', 'portrait', 'squarish'] },
                      },
                      required: ['query', 'purpose', 'orientation'],
                      additionalProperties: false,
                    },
                  },
                },
                required: ['newImageQueries'],
                additionalProperties: false,
              },
            },
          },
          temperature: 0.5,
          stream: false,
        });

        const analysisContent = analysisResponse.choices[0]?.message?.content;
        const analysis = (typeof analysisContent === 'object' ? analysisContent : JSON.parse(analysisContent ?? '{}')) as { newImageQueries: ImageQuery[] };
        
        if (analysis.newImageQueries && analysis.newImageQueries.length > 0) {
          console.log(`[ArtboardUpdater] Need ${analysis.newImageQueries.length} new images`);
          fetchedImages = await this.fetchImagesForUpdate(analysis.newImageQueries);
        }
      } catch (error) {
        console.warn('[ArtboardUpdater] Image analysis failed, proceeding without new images:', error);
      }
    }

    // Generate image context if we have new images
    const imageContext = formatImagesForContext(fetchedImages);
    const systemPromptWithImages = imageContext 
      ? `${updatePrompt}\n\n${imageContext}`
      : updatePrompt;

    const userContent = `Current artboard:\nTitle: ${artboard.title}\nDescription: ${artboard.description}\nHTML: ${artboard.html}\n***Update request***: ${message}`;
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
