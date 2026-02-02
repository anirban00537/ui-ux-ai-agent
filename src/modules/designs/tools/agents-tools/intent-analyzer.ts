import { PromptTemplate } from '@langchain/core/prompts';
import { type Intent, type ExistingArtboard } from '../../schemas';
import { CreditManager } from '../credit-manager';
import { coreConstant } from '../../../../shared/helpers/coreConstant';
import { AiUsageService } from '../../../subscription/services/ai-usage.service';
import { getOpenRouterClient, withTimeout, checkAborted, LLM_CONFIG } from '../llm-client';

// JSON Schema for Intent (replaces Zod schema)
const intentJsonSchema = {
  type: 'object',
  properties: {
    intent: {
      type: 'string',
      enum: ['create_new', 'update_existing', 'delete_existing'],
      description: 'Whether to create new screens, update existing ones, or delete existing ones',
    },
    reasoning: {
      type: 'string',
      description: 'Brief explanation of why this intent was chosen',
    },
    screensToUpdate: {
      type: ['array', 'null'],
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Database ID of the screen to update or delete',
          },
          title: {
            type: 'string',
            description: 'Title of the screen for reference',
          },
        },
        required: ['id', 'title'],
        additionalProperties: false,
      },
      description: 'Array of screens to update/delete with their IDs and titles (only for update_existing/delete_existing intent, null for create_new)',
    },
  },
  required: ['intent', 'reasoning', 'screensToUpdate'],
  additionalProperties: false,
};

const intentAnalysisTemplate =
  PromptTemplate.fromTemplate(`You are an AI assistant that analyzes user requests to determine intent.

Existing screens in this conversation:
{existingScreens}

Analyze the user's message and determine:
1. Do they want to CREATE NEW screens, UPDATE EXISTING screens, or DELETE EXISTING screens?
2. If updating or deleting, which specific screens should be affected? Return their IDs and titles.

Guidelines:
- Choose "create_new" if: user asks for new features, new screens, or doesn't mention existing screens
- Choose "update_existing" if: user asks to modify, change, improve, or fix existing screens
- Choose "delete_existing" if: user asks to remove, delete, or get rid of existing screens
- If no existing screens, always choose "create_new"

CRITICAL for delete_existing:
- ALWAYS include screens that the user mentions for deletion
- Match by screen title (case-insensitive partial matching allowed)
- Match by screen ID if provided (exact match required)
- If user provides an ID like "cmeo2jx2t00071yh94qw7f67o", find the screen with that exact ID
- If user mentions a screen title like "Baby Rhymes Welcome Screen", find screens with matching titles
- For ambiguous requests, include the most likely candidate based on context
- NEVER return empty screensToUpdate array if a valid screen reference is found

User message: "{message}"`);

export class IntentAnalyzer {
  private openrouter = getOpenRouterClient();

  constructor(
    private creditManager: CreditManager,
    private aiUsageService: AiUsageService,
  ) {}

  async analyzeIntent(
    message: string,
    existingScreens: ExistingArtboard[],
    contextMessages: Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
    }>,
    userId: string,
    designId: string,
    signal?: AbortSignal,
  ): Promise<Intent> {
    // Check for cancellation before starting
    checkAborted(signal, 'intent_analysis');

    const existingScreensText = existingScreens
      .map(
        (screen) =>
          `- ID: ${screen.id}, Title: ${screen.title}, Description: ${
            screen.description || 'No description'
          }`,
      )
      .join('\n');

    const intentPrompt = await intentAnalysisTemplate.format({
      existingScreens: existingScreensText,
      message: message,
    });

    const allMessages = [
      { role: 'system' as const, content: intentPrompt },
      ...contextMessages,
      { role: 'user' as const, content: message },
    ];

    // Check for cancellation before LLM call
    checkAborted(signal, 'intent_analysis');

    const response = await withTimeout(
      this.openrouter.chat.completions.create({
        model: coreConstant.AI_MODELS.AGENT.NAME,
        messages: allMessages,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'intent',
            strict: true,
            schema: intentJsonSchema,
          },
        },
        temperature: 0.3,
      }),
      LLM_CONFIG.REQUEST_TIMEOUT_MS,
      'Intent Analysis LLM Call',
      signal,
    );

    const content = response.choices[0]?.message?.content;
    const intent = (typeof content === 'object' ? content : JSON.parse(content ?? '{}')) as Intent;

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

    console.log('[IntentAnalyzer] Deducting credits:', tokenUsage);

    // Fire-and-forget for non-critical operations (don't block on these)
    this.aiUsageService.logUsage({
      userId,
      modelName: coreConstant.AI_MODELS.AGENT.NAME,
      inputTokens: tokenUsage.inputTokens,
      outputTokens: tokenUsage.outputTokens,
      type: 'intent_analysis',
      designId,
    } as any).catch(err => console.error('[IntentAnalyzer] Usage log error:', err));

    // Credits must be deducted (but we don't need to block the main flow)
    await this.creditManager.deductCredits(
      userId,
      designId,
      'intent_analysis',
      tokenUsage,
    );

    return intent;
  }
}

export default IntentAnalyzer;
