import { PrismaService } from '../../../prisma/prisma.service';
import { CreditManager } from '../credits';
import { AiUsageService } from '../../../subscription/services/ai-usage.service';
import { getOpenRouterClient, withTimeout, checkAborted, LLM_CONFIG } from '../llm';
import { coreConstant } from '../../../../shared/helpers/coreConstant';

const intentSchema = {
  type: 'object',
  properties: {
    intent: {
      type: 'string',
      enum: ['CHAT', 'DESIGN'],
      description: 'The classified intent of the user message.',
    },
  },
  required: ['intent'],
  additionalProperties: false,
};

export class IntentAnalyzer {
  private openrouter = getOpenRouterClient();

  constructor(
    private prisma: PrismaService,
    private creditManager: CreditManager,
    private aiUsageService: AiUsageService,
  ) {}

  async analyze(
    prompt: string,
    userId: string,
    designId: string,
    signal?: AbortSignal,
  ): Promise<{
    intent: 'CHAT' | 'DESIGN';
    thinking?: string;
  }> {
    checkAborted(signal, 'intent_analysis');

    const systemPrompt = `You are a highly sophisticated Intent Classification Agent for Butterfast, a powerful AI-driven UI/UX design platform. Your task is to analyze the user's input and classify it into one of two intents: CHAT or DESIGN.

### CATEGORY DEFINITIONS:

1. **CHAT**:
   - Greetings (e.g., "hi", "hello", "good morning").
   - Conversational filler or social inquiries (e.g., "how are you", "what's up").
   - Questions about your identity, capabilities, or project status (e.g., "who are you?", "what can you do?", "what is this page about?").
   - General feedback or comments (e.g., "this looks great", "thanks for the help").
   - Requests for information that do NOT involve changing the UI or generating new designs.

2. **DESIGN**:
   - Explicit requests to create new screens or components (e.g., "make a login page", "build a dashboard").
   - Requests to update or modify existing UI (e.g., "change the buttons to blue", "move the header", "add a search bar").
   - Requests to change themes, colors, or typography (e.g., "use a dark theme", "make it look minimal").
   - Requests for app ideas or design brainstorming (e.g., "give me some ideas for a fitness app", "what should go on a profile page?").
   - Any query containing design-oriented verbs (create, build, add, change, update, refactor) or UI-oriented nouns (screen, page, button, landing, dashboard).

### EXAMPLES:
- User: "Hi" -> {"intent": "CHAT"}
- User: "How are you today?" -> {"intent": "CHAT"}
- User: "What is this screen about?" -> {"intent": "CHAT"}
- User: "Make a pet health dashboard" -> {"intent": "DESIGN"}
- User: "Add a login button" -> {"intent": "DESIGN"}
- User: "Change the theme to midnight dark" -> {"intent": "DESIGN"}
- User: "Give me ideas for a movie app" -> {"intent": "DESIGN"}

### CONSTRAINTS:
- Output ONLY valid JSON in the specified format. 
- If the input is ambiguous but lacks specific design keywords, default to CHAT.
- If the input contains ANY reference to building, modifying, or planning UI, it MUST be DESIGN.

Output JSON Format: {"intent": "CHAT" | "DESIGN"}`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: prompt },
    ];

    try {
      const response = (await withTimeout(
        // @ts-ignore
        this.openrouter.chat.send(
          {
            model: coreConstant.AI_MODELS.AGENT.NAME,
            messages,
            responseFormat: {
              type: 'json_schema',
              jsonSchema: {
                name: 'intentAnalysis',
                strict: true,
                schema: intentSchema,
              },
            },
            temperature: 0,
            ...(coreConstant.AI_MODELS.AGENT.PROVIDER.ENABLED
              ? {
                  provider: {
                    order: coreConstant.AI_MODELS.AGENT.PROVIDER.ORDER as any,
                    allowFallbacks:
                      coreConstant.AI_MODELS.AGENT.PROVIDER.ALLOW_FALLBACKS,
                  },
                }
              : {}),
          },
          {},
        ),
        LLM_CONFIG.REQUEST_TIMEOUT_MS,
        'Intent Analysis',
        signal,
      )) as any;

      const message = response.choices[0]?.message;
      const content = message?.content;
      const result =
        typeof content === 'object' ? content : JSON.parse(content || '{}');

      // Native reasoning or fallback
      const thinking = message?.reasoning || result.thinking || result.reasoning;

      console.log(
        `[IntentAnalyzer] Intent: ${result.intent}, Thinking Length: ${thinking?.length || 0}`,
      );

      // Deduct credits
      const usage = (response.usage as any) || {
        totalTokens: 0,
        promptTokens: 0,
        completionTokens: 0,
      };
      const tokenUsage = {
        inputTokens: usage.promptTokens || usage.prompt_tokens || 0,
        outputTokens: usage.completionTokens || usage.completion_tokens || 0,
        totalTokens: usage.totalTokens || usage.total_tokens || 0,
        reasoningTokens: 0,
      };

      // Log usage
      this.aiUsageService
        .logUsage({
          userId,
          modelName: coreConstant.AI_MODELS.AGENT.NAME,
          inputTokens: tokenUsage.inputTokens,
          outputTokens: tokenUsage.outputTokens,
          type: 'intent_analysis',
          designId,
        } as any)
        .catch((e) => console.error('Usage log error', e));

      await this.creditManager.deductCredits(
        userId,
        designId,
        'intent_analysis',
        tokenUsage,
      );

      return {
        intent: result.intent || 'DESIGN',
        thinking: thinking,
      };
    } catch (e: any) {
      console.error('Intent Analysis Failed, defaulting to DESIGN:', e);
      return { intent: 'DESIGN' };
    }
  }
}
