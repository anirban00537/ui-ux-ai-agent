
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
    contextMessages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [],
    signal?: AbortSignal,
    previousScreens: PreviousScreenContext[] = [],
  ): Promise<{ title: string; description: string; html: string; credits?: number }> {
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
    
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...contextMessages.slice(-15) as any,
      { role: 'user' as const, content: userPrompt },
    ];

    const response = await withTimeout(
      client.chat.send(
        {
          model: coreConstant.AI_MODELS.DESIGN.NAME,
          messages,
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

    // 4. Record Usage and Deduct Credits
    let credits = 0;
    if (response.usage) {
      const usage = response.usage as any;
      const tokenUsage = {
        inputTokens: usage.prompt_tokens || usage.promptTokens || 0,
        outputTokens: usage.completion_tokens || usage.completionTokens || 0,
        totalTokens: usage.total_tokens || usage.totalTokens || 0,
        reasoningTokens: usage.completion_tokens_details?.reasoning_tokens || usage.completionTokensDetails?.reasoningTokens || 0,
      };

      try {
        await this.aiUsageService.logUsage({
          userId,
          modelName: coreConstant.AI_MODELS.DESIGN.NAME,
          inputTokens: tokenUsage.inputTokens,
          outputTokens: tokenUsage.outputTokens,
          type: 'artboard_update',
          designId,
          provider: 'openrouter',
        });

        credits = await this.creditManager.deductCredits(
          userId,
          designId,
          'artboard_update',
          tokenUsage,
        );
      } catch (error) {
        console.warn('Failed to record AI usage or deduct credits:', error);
      }
    }

    return {
      title: result.title,
      description: result.description,
      html: result.html,
      credits,
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
