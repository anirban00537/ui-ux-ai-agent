import { getOpenRouterClient, withTimeout, checkAborted, LLM_CONFIG } from '../llm';
import { coreConstant } from '../../../../shared/helpers/coreConstant';
import { CreditManager } from '../credits';
import { AiUsageService } from '../../../subscription/services/ai-usage.service';

export class ChatAgent {
  private openrouter = getOpenRouterClient();

  constructor(
    private creditManager: CreditManager,
    private aiUsageService: AiUsageService,
  ) {}

  async respond(
    prompt: string,
    contextMessages: Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
    }>,
    userId: string,
    designId: string,
    screenTitles: string[] = [],
    signal?: AbortSignal,
  ): Promise<{ response: string; thinking?: string }> {
    checkAborted(signal, 'chat_response');

    const screensContext =
      screenTitles.length > 0
        ? `\nEXISTING SCREENS IN PROJECT:\n${screenTitles.map((t) => `- ${t}`).join('\n')}\n`
        : '';

    const systemPrompt = `You are an expert AI UI/UX design assistant. 
The user is chatting with you about their project.

${screensContext}

Instructions:
1. Be helpful, professional, and concise.
2. If the user asks about the project or screens, use the context provided.
3. If they ask how to do something, explain it clearly.
4. Do NOT generate HTML or code unless explicitly asked for a snippet.
5. Your goal is to guide the user and answer questions, while the DESIGN engine handles the actual screen building.`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...contextMessages.slice(-10),
      { role: 'user' as const, content: prompt },
    ];

    const response = await withTimeout(
      // @ts-ignore
      this.openrouter.chat.send({
        model: coreConstant.AI_MODELS.AGENT.NAME,
        messages,
        temperature: 0.7,
      }, {}),
      LLM_CONFIG.REQUEST_TIMEOUT_MS,
      'Chat Response',
      signal,
    ) as any;

    const messageObj = response.choices[0]?.message;
    const responseText = messageObj?.content || "I'm here to help with your designs!";
    const thinking = messageObj?.reasoning;

    // Log usage and deduct credits (chat is cheaper)
    const usage = response.usage as any || { totalTokens: 0, promptTokens: 0, completionTokens: 0 };
    const tokenUsage = {
      inputTokens: usage.promptTokens || usage.prompt_tokens || 0,
      outputTokens: usage.completionTokens || usage.completion_tokens || 0,
      totalTokens: usage.totalTokens || usage.total_tokens || 0,
      reasoningTokens: 0,
    };

    this.aiUsageService.logUsage({
      userId,
      modelName: coreConstant.AI_MODELS.AGENT.NAME,
      inputTokens: tokenUsage.inputTokens,
      outputTokens: tokenUsage.outputTokens,
      type: 'chat',
      designId,
    } as any).catch(e => console.error("Chat usage log error", e));

    await this.creditManager.deductCredits(userId, designId, 'chat', tokenUsage);

    return {
      response: responseText,
      thinking: thinking,
    };
  }
}
