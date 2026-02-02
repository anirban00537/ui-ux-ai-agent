import { PromptTemplate } from '@langchain/core/prompts';
import { CreditManager } from '../credits';
import { coreConstant } from '../../../../shared/helpers/coreConstant';
import { AiUsageService } from '../../../subscription/services/ai-usage.service';
import { getOpenRouterClient, withTimeout, checkAborted, LLM_CONFIG } from '../llm';

const promptEnhancementSystemTemplate = PromptTemplate.fromTemplate(
  `You are a prompt engineer for {designType} UI design. Your task is to enhance the user's raw request into a single, detailed design brief that will be used to generate screens.

RULES:
1. Output ONLY the enhanced prompt. No preamble, no "Here is...", no explanation.
2. If the user's prompt is SHORT or VAGUE (e.g. one line, few words like "make a todo app" or "make a crypto wallet"):
   - Expand it into a rich design brief that includes:
     - App/screen theme and purpose (e.g. "Cryptocurrency wallet dashboard", "Todo list mobile app")
     - Concrete screen descriptions with specific UI elements (e.g. "A holographic virtual credit card tilting in 3D space. Line graph visualizing asset growth on a translucent floating sheet. Token list with glowing logos and frosted row backgrounds. Total balance in large, luminous digits.")
     - Add: "Create also the other screens." or similar when multiple screens are implied
     - A style line describing visual aesthetic: "Mobile UI, [aesthetic] aesthetic. [Concrete UI details: frosted glass cards, background blur, typography, borders, depth effects.]" (e.g. Glassmorphism, Neobrutalism, Minimal, Swiss style)
     - Include theme, typography, colors, cards, borders, depth so the design system has clear direction
3. If the user's prompt is ALREADY DETAILED (multiple sentences, specific UI descriptions, style mentioned):
   - Make light refinements for clarity and consistency only. Preserve the user's original instructions and intent. Do not rewrite or expand unnecessarily.

Design type context: {designType}.`,
);

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

    const designTypeLabel = designType || 'mobile app';
    const systemContent = await promptEnhancementSystemTemplate.format({
      designType: designTypeLabel,
    });

    checkAborted(signal, 'prompt_enhancement');

    const response = await withTimeout(
      this.openrouter.chat.completions.create({
        model: coreConstant.AI_MODELS.AGENT.NAME,
        messages: [
          { role: 'system', content: systemContent },
          { role: 'user', content: originalPrompt },
        ],
        temperature: 0.5,
      }),
      LLM_CONFIG.REQUEST_TIMEOUT_MS,
      'Prompt Enhancement',
      signal,
    );

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
