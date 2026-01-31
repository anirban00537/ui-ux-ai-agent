import { OpenRouter } from '@openrouter/sdk';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { PromptTemplate } from '@langchain/core/prompts';
import { IntentSchema, type Intent, type ExistingScreen } from '../../schemas';
import { CreditManager } from '../credit-manager';

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
  private openrouter = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
  });

  constructor(private creditManager: CreditManager) {}

  private static toChatMessages(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  ) {
    return messages;
  }

  async analyzeIntent(
    message: string,
    existingScreens: ExistingScreen[],
    contextMessages: Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
    }>,
    userId: string,
    designId: string,
  ): Promise<Intent> {
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

    const response = await this.openrouter.chat.send({
      model: 'minimax/minimax-m2.1',
      messages: IntentAnalyzer.toChatMessages(allMessages),
      responseFormat: {
        type: 'json_schema',
        jsonSchema: {
          name: 'intent',
          strict: true,
          schema: zodToJsonSchema(IntentSchema) as any,
        },
      },
      temperature: 0.3,
      stream: false,
    });

    const content = response.choices[0]?.message?.content;
    const contentString = typeof content === 'string' ? content : JSON.stringify(content);
    const intent = IntentSchema.parse(JSON.parse(contentString ?? '{}'));

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

    // Deduct credits immediately after analysis
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
