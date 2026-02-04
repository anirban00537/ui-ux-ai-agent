import { PrismaService } from '../../../prisma/prisma.service';
import {
  type ScreenPlan,
} from '../../schemas';
import { CreditManager } from '../credits';
import { coreConstant } from '../../../../shared/helpers/coreConstant';
import { AiUsageService } from '../../../subscription/services/ai-usage.service';
import { PromptManager } from '../prompts/prompt-manager';
import { getOpenRouterClient, withTimeout, checkAborted, LLM_CONFIG } from '../llm';
import { v4 as uuidv4 } from 'uuid';

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

export class ArtboardPlanner {
  private openrouter = getOpenRouterClient();

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
    signal?: AbortSignal,
  ): Promise<ScreenPlan> {
    checkAborted(signal, 'screen_planning');

    const prompts = PromptManager.getPrompts(designType);
    const planningPrompt = await prompts.planningTemplate.format({
      message,
    });

    const allMessages = [
      { role: 'system' as const, content: planningPrompt },
      ...contextMessages,
      { role: 'user' as const, content: message },
    ];

    checkAborted(signal, 'screen_planning');

    const response = await withTimeout(
      // @ts-ignore - OpenRouter SDK 'send'
      this.openrouter.chat.send(
        {
          model: coreConstant.AI_MODELS.AGENT.NAME,
          messages: allMessages,
          responseFormat: {
            type: 'json_schema',
            jsonSchema: {
              name: 'artboardPlan',
              strict: true,
              schema: artboardPlanJsonSchema,
            },
          },
          temperature: 0.5,
          ...(coreConstant.AI_MODELS.AGENT.PROVIDER.ENABLED
            ? {
                provider: {
                  order: coreConstant.AI_MODELS.AGENT.PROVIDER.ORDER as any,
                  allowFallbacks: coreConstant.AI_MODELS.AGENT.PROVIDER.ALLOW_FALLBACKS,
                },
              }
            : {}),
        },
        {}, // Options
      ),
      LLM_CONFIG.REQUEST_TIMEOUT_MS,
      'Screen Planning LLM Call',
      signal,
    ) as any;

    const content = response.choices[0]?.message?.content;
    const plan = (typeof content === 'object' ? content : JSON.parse(content ?? '{}')) as ScreenPlan;

    // Add stable IDs for streaming
    plan.screenPrompts = plan.screenPrompts.map(sp => ({
      ...sp,
      id: sp.id || uuidv4(),
    }));

    // Fix inconsistency: ensure totalScreens matches screenPrompts.length
    if (plan.totalScreens !== plan.screenPrompts.length) {
      console.warn(
        `[ArtboardPlanner] Inconsistent plan: totalScreens=${plan.totalScreens}, screenPrompts.length=${plan.screenPrompts.length}. Fixing...`,
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

    console.log('[ArtboardPlanner] Deducting credits for planning:', tokenUsage);

    // Fire-and-forget for non-critical logging
    this.aiUsageService.logUsage({
      userId,
      modelName: coreConstant.AI_MODELS.AGENT.NAME,
      inputTokens: tokenUsage.inputTokens,
      outputTokens: tokenUsage.outputTokens,
      type: 'screen_planning',
      designId,
    } as any).catch(err => console.error('[ArtboardPlanner] Planning usage log error:', err));

    await this.creditManager.deductCredits(
      userId,
      designId,
      'screen_planning',
      tokenUsage,
    );

    return plan;
  }
}

export default ArtboardPlanner;
