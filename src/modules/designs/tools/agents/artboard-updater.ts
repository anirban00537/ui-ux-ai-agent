
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreditManager } from '../credits';
import { AiUsageService } from '../../../subscription/services/ai-usage.service';
import { coreConstant } from '../../../../shared/helpers/coreConstant';
import { PromptManager } from '../prompts/prompt-manager';
import { getOpenRouterClient, withTimeout, checkAborted, LLM_CONFIG } from '../llm';
import { PreviousScreenContext } from '../../schemas';

const updatedArtboardJsonSchema = {
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

@Injectable()
export default class ArtboardUpdater {
  constructor(
    private prisma: PrismaService,
    private creditManager: CreditManager,
    private aiUsageService: AiUsageService,
  ) {}

  /**
   * Refines or updates an *existing* single artboard's HTML using the LLM.
   * Can be used for targeted updates or re-generating a screen with feedback.
   */
  async updateArtboard(
    userId: string,
    designId: string,
    existingHtml: string,
    updatePrompt: string,
    signal?: AbortSignal,
    previousScreens: PreviousScreenContext[] = [],
  ): Promise<{ title: string; description: string; html: string }> {
    checkAborted(signal, 'ArtboardUpdater.updateArtboard');

    // 1. Construct prompt
    const systemPrompt = PromptManager.getDesignSystemInstructions();
    const userPrompt = `
You are an expert UI/UX developer.
Your task is to UPDATE an existing mobile screen based on the user's request.

CURRENT HTML:
\`\`\`html
${existingHtml}
\`\`\`

USER REQUEST FOR UPDATE:
"${updatePrompt}"

INSTRUCTIONS:
1.  Analyze the CURRENT HTML and the User Request.
2.  Modify the HTML to satisfy the user's request while maintaining the existing design capability and theme consistency.
3.  Ensure the updated HTML is fully functional, responsive, and uses Tailwind CSS utility classes.
4.  Retain the overall structure if it doesn't conflict with the update.
${this.formatPreviousScreens(previousScreens)}

Provide the response in the following JSON format:
{
  "title": "Updated Title",
  "description": "Brief description of changes",
  "html": "<div ...>...</div>"
}
`;

    // 2. Call LLM
    const client = getOpenRouterClient();
    
    // Calculate cost (approximate)
    const promptTokens = (systemPrompt.length + userPrompt.length) / 4;
    const estimatedCost = 
      (promptTokens / 1_000_000) * coreConstant.AI_MODELS.DESIGN.PRICING.prompt;

    const response = await withTimeout(
      client.chat.send(
        {
          model: coreConstant.AI_MODELS.DESIGN.NAME,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          responseFormat: {
            type: 'json_schema',
            jsonSchema: {
              name: 'updated_artboard',
              strict: true,
              schema: updatedArtboardJsonSchema,
            },
          },
          temperature: 0.5,
          ...(coreConstant.AI_MODELS.DESIGN.PROVIDER.ENABLED
            ? {
                provider: {
                  order: coreConstant.AI_MODELS.DESIGN.PROVIDER.ORDER as any,
                  allowFallbacks: coreConstant.AI_MODELS.DESIGN.PROVIDER.ALLOW_FALLBACKS,
                },
              }
            : {}),
        },
        {},
      ),
      LLM_CONFIG.REQUEST_TIMEOUT_MS,
      'Artboard Update LLM Call',
      signal,
    );

    // 3. Parse Response
    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error('No valid content received from LLM for update');
    }

    let result;
    try {
      result = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse update JSON:', content);
      throw new Error('Invalid JSON response from LLM');
    }

    // 4. Record Usage
    if (response.usage) {
      // console.log('>>>>>>>>>>>>>>>>>>> RAW USAGE DATA (Updater):', JSON.stringify(response.usage, null, 2));
      try {
        await this.aiUsageService.logUsage({
          userId,
          modelName: coreConstant.AI_MODELS.DESIGN.NAME,
          inputTokens: (response.usage as any)?.prompt_tokens || (response.usage as any)?.promptTokens || 0,
          outputTokens: (response.usage as any)?.completion_tokens || (response.usage as any)?.completionTokens || 0,
          type: 'artboard_update',
          designId,
          provider: 'openrouter',
        });
      } catch (error) {
        console.warn('Failed to record AI usage:', error);
      }
    }

    return {
      title: result.title,
      description: result.description,
      html: result.html,
    };
  }
  
  private formatPreviousScreens(screens: PreviousScreenContext[]): string {
    if (!screens || screens.length === 0) return '';
    
    const contextStr = screens
      .map((s, i) => `Screen ${i + 1} (${s.title}):\n${s.html.substring(0, 500)}...`) // Truncate for token efficiency
      .join('\n\n');
      
    return `\nCONTEXT (Other screens in user flow - maintain consistency):\n${contextStr}\n`;
  }
}
