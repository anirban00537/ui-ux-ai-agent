import { CreditManager } from '../credits';
import { coreConstant } from '../../../../shared/helpers/coreConstant';
import { AiUsageService } from '../../../subscription/services/ai-usage.service';
import { getOpenRouterClient, withTimeout, checkAborted, LLM_CONFIG } from '../llm';
import { PromptManager } from '../prompts/prompt-manager';

export class PromptEnhancer {
  private openrouter = getOpenRouterClient();

  constructor(
    private creditManager: CreditManager,
    private aiUsageService: AiUsageService,
  ) {}

  async enhancePrompt(
    originalPrompt: string,
    designType: string | null,
    userId: string,
    designId: string,
    signal?: AbortSignal,
  ): Promise<string> {
    checkAborted(signal, 'prompt_enhancement');

    const prompts = PromptManager.getPrompts(designType || 'mobile_app');
    const systemContent = await prompts.enhancementTemplate.format({});

    checkAborted(signal, 'prompt_enhancement');

    const response = await withTimeout(
      // @ts-ignore - OpenRouter SDK 'chat.send'
      this.openrouter.chat.send(
        {
          model: coreConstant.AI_MODELS.AGENT.NAME,
          messages: [
            { role: 'system', content: systemContent },
            { role: 'user', content: originalPrompt },
          ],
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
      'Prompt Enhancement',
      signal,
    ) as any;

    const content = response.choices[0]?.message?.content;
    const raw = content != null ? String(content) : '';
    const enhanced = raw.trim();

    if (!enhanced || enhanced.length < 10) {
      return originalPrompt;
    }

    const usage = (response.usage as unknown) as {
      promptTokens?: number;
      prompt_tokens?: number;
      completionTokens?: number;
      completion_tokens?: number;
      totalTokens?: number;
      total_tokens?: number;
    } | null;
    const tokenUsage = {
      inputTokens: usage?.promptTokens ?? usage?.prompt_tokens ?? 0,
      outputTokens: usage?.completionTokens ?? usage?.completion_tokens ?? 0,
      totalTokens: usage?.totalTokens ?? usage?.total_tokens ?? 0,
    };

    this.aiUsageService
      .logUsage({
        userId,
        modelName: coreConstant.AI_MODELS.AGENT.NAME,
        inputTokens: tokenUsage.inputTokens,
        outputTokens: tokenUsage.outputTokens,
        type: 'prompt_enhancement',
        designId,
      } as any)
      .catch((err) =>
        console.error('[PromptEnhancer] Usage log error:', err),
      );

    await this.creditManager.deductCredits(
      userId,
      designId,
      'prompt_enhancement',
      tokenUsage,
    );

    return enhanced;
  }
}
