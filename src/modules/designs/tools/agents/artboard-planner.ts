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
  private client = getOpenRouterClient();

  constructor(
    private prisma: PrismaService,
    private creditManager: CreditManager,
    private aiUsageService: AiUsageService,
  ) { }

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
    screenTitles: string[] = [],
    signal?: AbortSignal,
  ): Promise<ScreenPlan> {
    checkAborted(signal, 'screen_planning');

    const screensContext = screenTitles.length > 0
      ? `\nEXISTING SCREENS (Current Project):\n${screenTitles.map(t => `- ${t}`).join('\n')}\n`
      : '';

    const prompts = PromptManager.getPrompts(designType);
    const planningPrompt = (await prompts.planningTemplate.format({
      message,
    })) + screensContext;

    const allMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system' as const, content: planningPrompt },
      ...contextMessages.slice(-15),
      { role: 'user' as const, content: message },
    ];

    checkAborted(signal, 'screen_planning');

    const response = await withTimeout(
      this.client.chat.completions.create({
        model: coreConstant.AI_MODELS.AGENT.NAME,
        messages: allMessages,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'artboardPlan',
            strict: true,
            schema: artboardPlanJsonSchema,
          },
        },
        temperature: 0.5,
      } as any),
      LLM_CONFIG.REQUEST_TIMEOUT_MS,
      'Screen Planning LLM Call',
      signal,
    );

    const messageObj = response.choices[0]?.message;
    let content = messageObj?.content || '{}';
    // Strip markdown code blocks if present
    if (content.trim().startsWith('```')) {
      content = content.trim().replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '');
    }
    const plan = JSON.parse(content) as ScreenPlan;

    // Capture native reasoning or JSON-based
    plan.thinking = (messageObj as any)?.reasoning || plan.thinking;

    console.log(`[ArtboardPlanner] Plan screens: ${plan.totalScreens}, Thinking Length: ${plan.thinking?.length || 0}`);

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
    const usage = response.usage || {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    };

    const tokenUsage = {
      inputTokens: usage.prompt_tokens || 0,
      outputTokens: usage.completion_tokens || 0,
      totalTokens: usage.total_tokens || 0,
      reasoningTokens: (usage as any).completion_tokens_details?.reasoning_tokens || 0,
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

    plan.credits = await this.creditManager.deductCredits(
      userId,
      designId,
      'screen_planning',
      tokenUsage,
    );

    return plan;
  }
}

export default ArtboardPlanner;
