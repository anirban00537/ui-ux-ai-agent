import { PrismaService } from '../../../prisma/prisma.service';

// Token estimation constants for different operations
const TOKEN_ESTIMATES = {
  PROMPT_ENHANCEMENT: 800,
  COLOR_PALETTE: 800,
  INTENT_ANALYSIS: 800,
  SCREEN_PLANNING: 1000,
  SCREEN_GENERATION: 4500,
  SCREEN_UPDATE: 4500,
  BUFFER_MULTIPLIER: 1.1,
} as const;

const TOKENS_PER_CREDIT = 200;

interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

interface CreditBalanceResult {
  monthlyCreditsUsed: number;
  monthlyCreditsLimit: number;
  remainingCredits: number;
}

export class CreditManager {
  constructor(private prisma: PrismaService) {}

  /**
   * Get user's current credit balance from CreditBalance
   */
  async getUserCredits(userId: string): Promise<CreditBalanceResult | null> {
    const balance = await this.prisma.creditBalance.findUnique({
      where: { userId },
    });

    if (!balance) {
      return null;
    }

    return {
      monthlyCreditsUsed: balance.usedCredits || 0,
      monthlyCreditsLimit: balance.quota || 0,
      remainingCredits: Math.max(0, balance.balance),
    };
  }

  /**
   * Estimate credits needed for an operation
   */
  estimateCredits(
    operation: 'create_new' | 'update_existing' | 'delete_existing',
    data: {
      numScreens?: number;
      numScreensToUpdate?: number;
      hasColorPalette?: boolean;
    },
  ): number {
    let estimateTokens = 0;

    estimateTokens += TOKEN_ESTIMATES.PROMPT_ENHANCEMENT;
    estimateTokens += TOKEN_ESTIMATES.INTENT_ANALYSIS;

    if (!data.hasColorPalette) {
      estimateTokens += TOKEN_ESTIMATES.COLOR_PALETTE;
    }

    if (operation === 'create_new') {
      estimateTokens += TOKEN_ESTIMATES.SCREEN_PLANNING;
      const numScreens = data.numScreens || 3;
      estimateTokens += TOKEN_ESTIMATES.SCREEN_GENERATION * numScreens;
    } else if (operation === 'update_existing') {
      const numScreensToUpdate = data.numScreensToUpdate || 1;
      estimateTokens += TOKEN_ESTIMATES.SCREEN_UPDATE * numScreensToUpdate;
    } else {
      estimateTokens += 100;
    }

    const estimateWithBuffer = Math.ceil(
      estimateTokens * TOKEN_ESTIMATES.BUFFER_MULTIPLIER,
    );
    return Math.ceil(estimateWithBuffer / TOKENS_PER_CREDIT);
  }

  /**
   * Check if user has enough credits
   */
  async hasEnoughCredits(
    userId: string,
    estimatedCredits: number,
  ): Promise<{
    hasEnough: boolean;
    balance: CreditBalanceResult | null;
    required: number;
  }> {
    const balance = await this.getUserCredits(userId);

    if (!balance) {
      return {
        hasEnough: false,
        balance: null,
        required: estimatedCredits,
      };
    }

    const hasEnough = balance.remainingCredits >= estimatedCredits;

    return {
      hasEnough,
      balance,
      required: estimatedCredits,
    };
  }

  convertTokensToCredits(tokens: number): number {
    return Math.ceil(tokens / TOKENS_PER_CREDIT);
  }

  /**
   * Deduct credits after an operation and record transaction (CreditBalance + CreditTransaction)
   */
  async deductCredits(
    userId: string,
    designId: string,
    operation: string,
    usage: TokenUsage,
    _model: string = 'minimax/minimax-m2.1',
  ): Promise<void> {
    const creditsUsed = this.convertTokensToCredits(usage.totalTokens);

    const balance = await this.prisma.creditBalance.findUnique({
      where: { userId },
    });

    if (!balance) {
      throw new Error('No credit balance found for user');
    }

    if (balance.balance < creditsUsed) {
      throw new Error(
        `Insufficient credits. Required: ${creditsUsed}, Available: ${balance.balance}`,
      );
    }

    const newBalance = balance.balance - creditsUsed;

    await this.prisma.$transaction(async (tx) => {
      await tx.creditBalance.update({
        where: { userId },
        data: {
          balance: newBalance,
          usedCredits: { increment: creditsUsed },
        },
      });
      await tx.creditTransaction.create({
        data: {
          userId,
          amount: -creditsUsed,
          type: 'usage',
          description: `Design: ${operation}`,
          balanceAfter: newBalance,
        },
      });
    });
  }
}
