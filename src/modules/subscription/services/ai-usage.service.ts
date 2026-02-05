import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { coreConstant } from 'src/shared/helpers/coreConstant';

@Injectable()
export class AiUsageService {
  private readonly logger = new Logger(AiUsageService.name);

  // Use pricing from coreConstant
  private readonly pricing = {
    [coreConstant.AI_MODELS.DESIGN.NAME]: coreConstant.AI_MODELS.DESIGN.PRICING,
    'default': coreConstant.AI_MODELS.AGENT.PRICING
  };

  constructor(private readonly prisma: PrismaService) {}

  async logUsage(params: {
    userId: string;
    modelName: string;
    inputTokens: number;
    outputTokens: number;
    type: string;
    docId?: string;
    designId?: string;
    provider?: string;
  }) {
    try {
      const { 
        userId, 
        modelName, 
        inputTokens, 
        outputTokens, 
        type, 
        docId, 
        designId,
        provider = 'openrouter' 
      } = params;

      const effectiveDocId = docId || designId;

      // Calculate cost
      const rates = this.pricing[modelName] || this.pricing['default'];
      const promptCost = (inputTokens / 1000000) * rates.prompt;
      const completionCost = (outputTokens / 1000000) * rates.completion;
      const cost = promptCost + completionCost;

      // Calculate credits (align with CreditManager)
      const totalTokens = inputTokens + outputTokens;
      const credits = Math.ceil(totalTokens / 200); // 200 tokens per credit

      const usage = await this.prisma.aiUsage.create({
        data: {
          userId,
          modelName,
          inputTokens,
          outputTokens,
          cost,
          credits,
          type,
          docId: effectiveDocId,
          provider
        } as any
      });

      this.logger.log(`[AI_USAGE] Logged ${type} usage for user ${userId}: ${inputTokens} input, ${outputTokens} output. Cost: $${cost.toFixed(6)}, Credits: ${credits}`);
      return usage;
    } catch (error) {
      this.logger.error('Failed to log AI usage:', error);
    }
  }
}
