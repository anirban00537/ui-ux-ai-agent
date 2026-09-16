import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { coreConstant } from 'src/shared/helpers/coreConstant';

// Use centralized constant
const FREE_TIER_CREDITS = coreConstant.CREDITS.FREE_TIER;

@Injectable()
export class CreditService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Initialize credit balance for a user
   */
  async initializeCreditBalance(userId: string, initialBalance: number = coreConstant.CREDITS.DEFAULT_NEW_USER): Promise<void> {
    const existing = await this.prisma.creditBalance.findUnique({
      where: { userId },
    });

    if (!existing) {
      console.log(`[CREDIT_SERVICE] Initializing new credit balance for user ${userId} with ${initialBalance} credits`);
      await this.prisma.creditBalance.create({
        data: {
          userId,
          balance: initialBalance,
          quota: initialBalance,
          lastResetAt: new Date(),
        },
      });
    }
  }

  /**
    * Get credit balance for a user
    */
  async getCreditBalance(userId: string) {
    let balance = await this.prisma.creditBalance.findUnique({
      where: { userId },
    });

    if (!balance) {
      await this.initializeCreditBalance(userId);
      balance = await this.prisma.creditBalance.findUnique({
        where: { userId },
      });
    }

    return balance;
  }

  /**
    * Check if user has enough credits
    */
  async hasEnoughCredits(userId: string, requiredCredits: number): Promise<boolean> {
    const balance = await this.getCreditBalance(userId);
    if (!balance) return false;

    return balance.balance >= requiredCredits;
  }

  /**
    * Use credits
    */
  async useCredits(
    userId: string,
    amount: number,
    description?: string,
    docId?: string,
  ): Promise<void> {
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new BadRequestException(
        `Invalid credit amount: ${amount}. Must be a positive integer.`,
      );
    }

    console.log(`[CREDIT_SERVICE] User ${userId} using ${amount} credits: ${description || 'No description'}`);
    
    await this.prisma.$transaction(async (tx) => {
      const balance = await tx.creditBalance.findUnique({
        where: { userId },
      });

      if (!balance) {
        throw new NotFoundException('Credit balance not found');
      }

      if (balance.balance < amount) {
        throw new BadRequestException(
          `Insufficient credits. Available: ${balance.balance}, Required: ${amount}`,
        );
      }

      const newBalance = balance.balance - amount;

      await tx.creditBalance.update({
        where: { userId },
        data: {
          balance: newBalance,
          usedCredits: {
            increment: amount,
          }
        },
      });

      await tx.creditTransaction.create({
        data: {
          userId,
          amount: -amount,
          type: 'usage',
          description: description || 'Credits used',
          docId,
          balanceAfter: newBalance,
        },
      });
    });
  }

  /**
   * Refund credits (used when generation fails after upfront deduction)
   */
  async refundCredits(
    userId: string,
    amount: number,
    description?: string,
    docId?: string,
  ): Promise<void> {
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new BadRequestException(
        `Invalid refund amount: ${amount}. Must be a positive integer.`,
      );
    }

    console.log(`[CREDIT_SERVICE] Refunding ${amount} credits to user ${userId}: ${description || 'No description'}`);
    
    await this.prisma.$transaction(async (tx) => {
      const balance = await tx.creditBalance.findUnique({
        where: { userId },
      });

      if (!balance) {
        throw new NotFoundException('Credit balance not found');
      }

      const newBalance = balance.balance + amount;

      await tx.creditBalance.update({
        where: { userId },
        data: {
          balance: newBalance,
          usedCredits: {
            decrement: amount,
          }
        },
      });

      await tx.creditTransaction.create({
        data: {
          userId,
          amount: amount, // Positive amount for refund
          type: 'refund',
          description: description || 'Credits refunded',
          docId,
          balanceAfter: newBalance,
        },
      });
    });
  }

  /**
   * Update credits based on subscription change
   * 
   * Business Rule: Credits reset every month (no rollover).
   * Always replace balance with the new quota.
   * 
   * @param userId - The user ID
   * @param newLimit - The new credit limit from the plan
   */
  async updateCreditsFromSubscription(
    userId: string,
    newLimit: number,
  ): Promise<void> {
    console.log(
      `[CREDIT_SERVICE] Resetting credits for user ${userId} to ${newLimit}`,
    );

    await this.prisma.$transaction(async (tx) => {
      const existingBalance = await tx.creditBalance.findUnique({
        where: { userId },
      });

      const finalBalance = newLimit;
      const updateDescription = `Credit balance reset to ${newLimit} credits`;

      if (!existingBalance) {
        console.log(`[CREDIT_SERVICE] Creating new credit balance record for user ${userId}`);
        await tx.creditBalance.create({
          data: {
            userId,
            balance: finalBalance,
            quota: newLimit,
            usedCredits: 0,
            lastResetAt: new Date(),
          },
        });
      } else {
        console.log(`[CREDIT_SERVICE] Updating existing credit balance record for user ${userId}`);
        await tx.creditBalance.update({
          where: { userId },
          data: {
            balance: finalBalance,
            quota: newLimit,
            usedCredits: 0,
            lastResetAt: new Date(),
          },
        });
      }

      await tx.creditTransaction.create({
        data: {
          userId,
          amount: finalBalance,
          type: 'purchase',
          description: updateDescription,
          balanceAfter: finalBalance,
        },
      });
      console.log(`[CREDIT_SERVICE] Credit reset completed for user ${userId}. Final balance: ${finalBalance}`);
    });
  }

  /**
   * Get credit transaction history
   */
  async getTransactionHistory(userId: string, limit: number = 50) {
    return this.prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Reset credits to free tier (convenience method)
   * Use this when a subscription is canceled, expired, or revoked
   */
  async resetToFreeTier(userId: string): Promise<void> {
    await this.updateCreditsFromSubscription(userId, FREE_TIER_CREDITS);
  }
}
