import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { CreditService } from '../subscription/services/credit.service';
import { coreConstant } from 'src/shared/helpers/coreConstant';

const { SUBSCRIPTION_STATUS, CREDITS } = coreConstant;

@Injectable()
export class SchedulingService {
  private readonly logger = new Logger(SchedulingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly creditService: CreditService,
  ) {}

  /**
   * Scheduled task: Handle subscriptions whose period has expired
   * Runs every hour to check for subscriptions that:
   * - Have cancelAtPeriodEnd = true AND
   * - currentPeriodEnd has passed AND
   * - Status is still 'active'
   * 
   * These subscriptions will be marked as 'expired' and credits reset to free tier.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleExpiredSubscriptions(): Promise<void> {
    const now = new Date();
    
    this.logger.log('[CRON] Checking for expired subscriptions...');

    try {
      // Find subscriptions that were canceled and period has now ended
      const expiredSubs = await this.prisma.subscription.findMany({
        where: {
          cancelAtPeriodEnd: true,
          status: SUBSCRIPTION_STATUS.ACTIVE, // Still marked as active but should be expired
          currentPeriodEnd: {
            lt: now, // Period has passed
          },
        },
      });

      if (expiredSubs.length === 0) {
        this.logger.debug('[CRON] No expired subscriptions found');
        return;
      }

      this.logger.log(`[CRON] Found ${expiredSubs.length} expired subscription(s) to process`);

      for (const sub of expiredSubs) {
        this.logger.log(
          `[CRON] Expiring subscription ${sub.id} for user ${sub.userId}. ` +
          `Period ended at ${sub.currentPeriodEnd}`
        );
        
        // Update subscription status to expired
        await this.prisma.subscription.update({
          where: { id: sub.id },
          data: { status: SUBSCRIPTION_STATUS.EXPIRED },
        });
        
        // Reset credits to free tier
        await this.creditService.updateCreditsFromSubscription(
          sub.userId, 
          CREDITS.FREE_TIER,
        );
        
        this.logger.log(`[CRON] Successfully expired subscription for user ${sub.userId}`);
      }

      this.logger.log(`[CRON] Processed ${expiredSubs.length} expired subscription(s)`);
    } catch (error) {
      this.logger.error('[CRON] Error processing expired subscriptions:', error);
    }
  }

  /**
   * Scheduled task: Clean up stale/orphaned data
   * Runs daily at midnight to perform maintenance tasks
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async performDailyMaintenance(): Promise<void> {
    this.logger.log('[CRON] Running daily maintenance tasks...');

    try {
      // Log subscription statistics
      const stats = await this.prisma.subscription.groupBy({
        by: ['status'],
        _count: true,
      });
      
      this.logger.log(`[CRON] Subscription statistics: ${JSON.stringify(stats)}`);

      // You can add more maintenance tasks here:
      // - Clean up old credit transactions
      // - Remove expired sessions
      // - Archive old docs
      // etc.

      this.logger.log('[CRON] Daily maintenance completed');
    } catch (error) {
      this.logger.error('[CRON] Error during daily maintenance:', error);
    }
  }
}
