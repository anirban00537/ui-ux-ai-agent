import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PolarService } from './services/polar.service';
import { CreditService } from './services/credit.service';
import { User } from '@prisma/client';
import {
  successResponse,
  errorResponse,
  processException,
} from 'src/shared/helpers/functions';
import { coreConstant } from 'src/shared/helpers/coreConstant';
import { ResponseModel } from 'src/shared/models/response.model';
import { SubscriptionResponseDto } from './dto/subscription-response.dto';
import { CreditBalanceResponseDto } from './dto/credit-balance-response.dto';
import { SubscriptionStatusDto } from './dto/subscription-status.dto';
import {
  FeatureResponseDto,
  BenefitResponseDto,
} from './dto/feature-response.dto';

// Destructure commonly used constants for cleaner code
const {
  SUBSCRIPTION_STATUS,
  SUBSCRIPTION_ACTIVE_STATUSES,
  SUBSCRIPTION_ENDED_STATUSES,
  CREDITS,
} = coreConstant;

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly polarService: PolarService,
    private readonly creditService: CreditService,
  ) { }

  /**
   * Verify checkout and immediately sync subscription after successful payment
   * This method is called when user returns from Polar checkout with customer_session_token
   * This provides instant feedback instead of waiting for webhooks (which can take 10-30 seconds)
   */
  async verifyCheckoutAndSync(
    user: User,
    customerSessionToken?: string,
  ): Promise<ResponseModel> {
    this.logger.log(
      `Verify checkout requested for user ${user.id}${customerSessionToken ? ' with session token' : ''}`,
    );

    try {
      if (!this.polarService.isConfigured()) {
        return errorResponse('Payment system is not configured');
      }

      // Simply sync the subscription from Polar
      // The syncSubscriptionFromPolar method already handles:
      // - Finding/creating the customer
      // - Getting their subscriptions
      // - Updating local database
      // - Setting up credits
      const syncResult = await this.syncSubscriptionFromPolar(user);

      if (!syncResult.success) {
        this.logger.warn(
          `Checkout verification sync failed for user ${user.id}: ${syncResult.message}`,
        );
        return syncResult;
      }

      this.logger.log(
        `Checkout verification successful for user ${user.id}`,
      );

      // Return the full subscription status for the frontend
      return this.getSubscriptionStatus(user);
    } catch (error: any) {
      this.logger.error(
        `Failed to verify checkout for user ${user.id}: ${error.message}`,
      );
      return processException(error);
    }
  }

  /**
   * Get subscription status for a user
   */
  async getSubscriptionStatus(user: User): Promise<ResponseModel> {
    try {
      const creditBalance = await this.creditService.getCreditBalance(user.id);
      const accessCheck = await this.hasActiveAccess(user.id);
      const hasActiveSubscription = accessCheck.hasAccess;

      // Free tier defaults (SINGLE SOURCE OF TRUTH)
      const FREE_SLIDE_LIMIT = 15;
      const FREE_STORAGE_LIMIT = 0;

      let slideLimit = FREE_SLIDE_LIMIT;
      let planName = 'No Active Plan';
      let storageLimit = FREE_STORAGE_LIMIT;
      let storageUsage = 0;

      // Fetch product details if user has active subscription
      let features: FeatureResponseDto | null = null;
      if (hasActiveSubscription && accessCheck.subscription?.productId && this.polarService.isConfigured()) {
        try {
          const product = await this.polarService.getProduct(
            accessCheck.subscription.productId,
          );
          if (product) {
            features = this.extractFeaturesFromProduct(product);
            const metadata = product?.metadata || {};
            
            if (metadata.slide_limit) {
              slideLimit = parseInt(String(metadata.slide_limit), 10);
            }
            if (metadata.storage_gb) {
              storageLimit = parseFloat(String(metadata.storage_gb));
            }
            if (metadata.plan_name) {
              planName = String(metadata.plan_name);
            } else if (product.name) {
              planName = String(product.name);
            }
          }
        } catch (error: any) {
          this.logger.warn(
            `Failed to fetch details for product ${accessCheck.subscription.productId}: ${error.message}`,
          );
        }
      }

      // Always get storage usage
      storageUsage = await this.getStorageUsage(user.id);

      const status: SubscriptionStatusDto = {
        subscription: accessCheck.subscription
          ? (accessCheck.subscription as unknown as SubscriptionResponseDto)
          : null,
        creditBalance: creditBalance
          ? (creditBalance as unknown as CreditBalanceResponseDto)
          : null,
        isActive: hasActiveSubscription,
        hasAccess: hasActiveSubscription,
        hasCredits: creditBalance !== null && creditBalance.balance > 0,
        features,
        slideLimit,
        storageLimit,
        storageUsage,
        planName,
      };

      return successResponse(
        'Subscription status retrieved successfully',
        status,
      );
    } catch (error) {
      return processException(error);
    }
  }

  /**
   * Check if a user has active subscription access
   * This is the SINGLE SOURCE OF TRUTH for access decisions
   *
   * Access is granted if:
   * 1. Status is active/trialing AND period hasn't ended
   * 2. OR subscription is canceled but period is still valid (cancelAtPeriodEnd)
   */
  async hasActiveAccess(userId: string): Promise<{
    hasAccess: boolean;
    subscription: any | null;
    reason:
    | 'active'
    | 'trialing'
    | 'canceled_but_period_valid'
    | 'no_subscription'
    | 'period_ended'
    | 'inactive';
    periodEnd: Date | null;
  }> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return {
        hasAccess: false,
        subscription: null,
        reason: 'no_subscription',
        periodEnd: null,
      };
    }

    const now = new Date();
    const periodEnd = subscription.currentPeriodEnd;
    const periodValid = periodEnd && new Date(periodEnd) > now;

    // Case 1: Active or trialing with valid period
    if (
      (SUBSCRIPTION_ACTIVE_STATUSES as readonly string[]).includes(
        subscription.status,
      ) &&
      periodValid
    ) {
      return {
        hasAccess: true,
        subscription,
        reason: subscription.status as 'active' | 'trialing',
        periodEnd: new Date(periodEnd),
      };
    }

    // Case 2: Canceled but period still valid (user clicked cancel, still has access)
    if (subscription.cancelAtPeriodEnd && periodValid) {
      return {
        hasAccess: true,
        subscription,
        reason: 'canceled_but_period_valid',
        periodEnd: new Date(periodEnd),
      };
    }

    // Case 3: Status is canceled/inactive and period has ended
    if (
      (SUBSCRIPTION_ENDED_STATUSES as readonly string[]).includes(
        subscription.status,
      )
    ) {
      return {
        hasAccess: false,
        subscription,
        reason: 'period_ended',
        periodEnd: periodEnd ? new Date(periodEnd) : null,
      };
    }

    // Case 4: Inactive or unknown status
    return {
      hasAccess: false,
      subscription,
      reason: 'inactive',
      periodEnd: periodEnd ? new Date(periodEnd) : null,
    };
  }

  /**
   * Get subscription features for a user
   */
  async getSubscriptionFeatures(user: User): Promise<ResponseModel> {
    try {
      const subscription = await this.prisma.subscription.findUnique({
        where: { userId: user.id },
      });

      if (!subscription?.productId) {
        return successResponse('No active subscription found', {
          features: null,
          message: 'User does not have an active subscription',
        });
      }

      if (!this.polarService.isConfigured()) {
        return errorResponse('Polar.sh is not configured');
      }

      const product = await this.polarService.getProduct(
        subscription.productId,
      );
      if (!product) {
        return errorResponse('Product not found');
      }

      const features = this.extractFeaturesFromProduct(product);

      return successResponse(
        'Subscription features retrieved successfully',
        features,
      );
    } catch (error) {
      return processException(error);
    }
  }

  /**
   * Sync subscription from Polar.sh
   */
  async syncSubscriptionFromPolar(user: User): Promise<ResponseModel> {
    try {
      if (!this.polarService.isConfigured()) {
        return errorResponse('Polar.sh is not configured');
      }

      // Get or create customer in Polar
      const customer = await this.polarService.createOrGetCustomer(
        user.id,
        user.email,
        user.name || user.email,
      );

      if (!customer) {
        this.logger.error(
          `Sync error: Failed to find or create Polar customer for user ${user.id} (${user.email})`,
        );
        return errorResponse('Failed to create/get customer in Polar.sh');
      }

      this.logger.log(
        `Syncing subscription for user ${user.id} (Polar Customer: ${customer.id})`,
      );

      // Get active subscriptions
      const subscriptionsResponse =
        await this.polarService.getCustomerSubscriptions(customer.id);

      this.logger.debug(
        `Polar sync: Found ${JSON.stringify(subscriptionsResponse)} subscriptions for customer ${customer.id}`,
      );

      // Polar SDK returns a paginated response with items array,
      // sometimes under .result.items depending on version/method
      let activeSubscription = null;
      if (subscriptionsResponse) {
        const items =
          (subscriptionsResponse as any).result?.items ||
          (subscriptionsResponse as any).items ||
          [];

        // Find the "best" subscription. Order of preference: active > trialing > cancelling > past_due
        const priority = ['active', 'trialing', 'cancelling', 'past_due'];
        const validSubs = items.filter(
          (sub: any) =>
            priority.includes(sub.status) ||
            (sub.status === 'canceled' &&
              new Date(sub.current_period_end) > new Date()),
        );

        this.logger.log(
          `Found ${items.length} total subscriptions, ${validSubs.length} valid subscriptions for user ${user.id}`,
        );

        activeSubscription = validSubs.sort(
          (a: any, b: any) =>
            priority.indexOf(a.status) - priority.indexOf(b.status),
        )[0];

        if (activeSubscription) {
          this.logger.log(
            `Selected active subscription ${activeSubscription.id} with status ${activeSubscription.status}`,
          );
        }
      }

      if (!activeSubscription) {
        this.logger.warn(
          `No active subscription found for user ${user.id} in Polar.sh`,
        );
        // No active subscription, mark as inactive in local DB
        await this.prisma.subscription.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            polarCustomerId: customer.id,
            status: SUBSCRIPTION_STATUS.INACTIVE,
          },
          update: {
            status: SUBSCRIPTION_STATUS.INACTIVE,
            polarCustomerId: customer.id,
          },
        });

        // Reset credits to free tier for inactive users (no active period, so no rollover)
        this.logger.log(
          `Resetting credits to ${CREDITS.FREE_TIER} for user ${user.id} due to inactive subscription`,
        );
        await this.creditService.updateCreditsFromSubscription(
          user.id,
          CREDITS.FREE_TIER,
        );

        return successResponse('Subscription synced successfully', {
          status: SUBSCRIPTION_STATUS.INACTIVE,
        });
      }

      // Get existing subscription BEFORE upsert to compare for credit reset logic
      const existingSubscription = await this.prisma.subscription.findUnique({
        where: { userId: user.id },
      });

      // Update or create subscription record
      // Safely extract fields whether they are camelCase (SDK) or snake_case (API)
      const currentPeriodStart =
        activeSubscription.currentPeriodStart ||
        activeSubscription.current_period_start;
      const currentPeriodEnd =
        activeSubscription.currentPeriodEnd ||
        activeSubscription.current_period_end;
      const cancelAtPeriodEnd =
        activeSubscription.cancelAtPeriodEnd ??
        activeSubscription.cancel_at_period_end ??
        false;
      const canceledAt =
        activeSubscription.canceledAt || activeSubscription.canceled_at;
      const productId =
        activeSubscription.productId ||
        activeSubscription.product?.id ||
        activeSubscription.product_id;
      const priceId =
        activeSubscription.priceId ||
        activeSubscription.price?.id ||
        activeSubscription.price_id;

      const subscription = await this.prisma.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          polarSubscriptionId: activeSubscription.id,
          polarCustomerId: customer.id,
          status: activeSubscription.status,
          productId: productId,
          priceId: priceId,
          currentPeriodStart: currentPeriodStart
            ? new Date(currentPeriodStart)
            : null,
          currentPeriodEnd: currentPeriodEnd
            ? new Date(currentPeriodEnd)
            : null,
          cancelAtPeriodEnd: cancelAtPeriodEnd,
          canceledAt: canceledAt ? new Date(canceledAt) : null,
          metadata: activeSubscription.metadata || {},
        },
        update: {
          polarSubscriptionId: activeSubscription.id,
          polarCustomerId: customer.id,
          status: activeSubscription.status,
          productId: productId,
          priceId: priceId,
          currentPeriodStart: currentPeriodStart
            ? new Date(currentPeriodStart)
            : null,
          currentPeriodEnd: currentPeriodEnd
            ? new Date(currentPeriodEnd)
            : null,
          cancelAtPeriodEnd: cancelAtPeriodEnd,
          canceledAt: canceledAt ? new Date(canceledAt) : null,
          metadata: activeSubscription.metadata || {},
        },
      });

      // Update credit balance based on subscription
      // Process credits if subscription has active access (including cancelAtPeriodEnd with valid period)
      const periodStillValid =
        currentPeriodEnd && new Date(currentPeriodEnd) > new Date();
      const hasActiveAccess =
        ['active', 'trialing'].includes(activeSubscription.status) ||
        (activeSubscription.cancel_at_period_end && periodStillValid);

      if (hasActiveAccess) {
        const existingPeriodStart = existingSubscription?.currentPeriodStart
          ? new Date(existingSubscription.currentPeriodStart).getTime()
          : 0;
        const newPeriodStart = currentPeriodStart
          ? new Date(currentPeriodStart).getTime()
          : 0;

        // Determine if we should reset credits
        const isNewSubscription = !existingSubscription?.polarSubscriptionId;
        const isNewPeriod = newPeriodStart > existingPeriodStart;
        const isPlanChange = productId !== existingSubscription?.productId;

        // Get monthly limit for logging purposes
        const monthlyLimit = await this.getMonthlyCreditLimit(
          activeSubscription.product?.id,
          activeSubscription,
        );

        this.logger.log(
          `Sync Check [${user.id}]: hasActiveAccess=${hasActiveAccess}, isNewSub=${isNewSubscription}, isNewPeriod=${isNewPeriod}, isPlanChange=${isPlanChange}`,
        );

        // Only reset credits on actual subscription changes (new subscription, new period, or plan change)
        // Do NOT reset credits just because of a quota mismatch during manual sync
        if (
          isNewSubscription ||
          isNewPeriod ||
          isPlanChange
        ) {
          this.logger.log(
            `Credit sync triggered for user ${user.id}: newSubscription=${isNewSubscription}, newPeriod=${isNewPeriod}, planChange=${isPlanChange}`,
          );
          // Reset credits with new monthly limit
          await this.creditService.updateCreditsFromSubscription(
            user.id,
            monthlyLimit,
          );
        } else {
          this.logger.debug(
            `Sync: No credit reset needed for user ${user.id} - subscription data is already in sync`,
          );
        }
      } else {
        this.logger.log(
          `Sync: User ${user.id} does not have active access (status=${activeSubscription.status}, periodValid=${periodStillValid})`,
        );
      }

      return successResponse('Subscription synced successfully', subscription);
    } catch (error) {
      return processException(error);
    }
  }

  /**
   * Cancel subscription
   * NOTE: Status remains 'active' until the period ends.
   * The 'canceled' status will be set by webhook when period ends.
   */
  async cancelSubscription(user: User): Promise<ResponseModel> {
    try {
      const subscription = await this.prisma.subscription.findUnique({
        where: { userId: user.id },
      });

      if (!subscription) {
        return errorResponse('No subscription found');
      }

      if (!subscription.polarSubscriptionId) {
        return errorResponse('Subscription not linked to Polar.sh');
      }

      if (!this.polarService.isConfigured()) {
        return errorResponse('Polar.sh is not configured');
      }

      // Cancel in Polar.sh (at period end)
      await this.polarService.cancelSubscription(
        subscription.polarSubscriptionId,
        true, // cancel at period end
      );

      // Update local record - keep status as 'active' until period ends
      // The webhook will update status to 'canceled' or 'revoked' when period ends
      const updated = await this.prisma.subscription.update({
        where: { userId: user.id },
        data: {
          cancelAtPeriodEnd: true,
          // Don't change status - user still has access until period ends
        },
      });

      return successResponse(
        'Subscription will be canceled at the end of the billing period',
        updated,
      );
    } catch (error) {
      return processException(error);
    }
  }

  /**
   * Handle Polar.sh webhook events
   */
  async handleWebhook(event: string, data: any): Promise<void> {
    this.logger.log(`Webhook received: ${event}`);
    this.logger.debug(`Webhook data: ${JSON.stringify(data)}`);
    try {
      switch (event) {
        // Subscription lifecycle
        case 'subscription.created':
        case 'subscription.updated':
        case 'subscription.active':
          await this.handleSubscriptionUpdate(data);
          break;
        case 'subscription.canceled':
          await this.handleSubscriptionCanceled(data); // Preserves access if period valid
          break;
        case 'subscription.revoked':
          await this.handleSubscriptionRevoked(data); // Immediate termination
          break;
        case 'subscription.uncanceled':
          await this.handleSubscriptionUncanceled(data);
          break;
        case 'subscription.past_due':
          await this.handleSubscriptionPastDue(data);
          break;

        // Customer lifecycle
        case 'customer.created':
        case 'customer.updated':
        case 'customer.deleted':
          await this.handleCustomerUpdate(data, event === 'customer.deleted');
          break;

        // Refunds
        case 'order.refunded':
          await this.handleOrderRefunded(data);
          break;

        // Usage-based billing
        case 'meter.usage_recorded':
          await this.handleMeterUsage(data);
          break;

        default:
          this.logger.log(`Unhandled webhook event: ${event}`);
      }
    } catch (error) {
      this.logger.error(`Error handling webhook ${event}:`, error);
      throw error;
    }
  }

  /**
   * Handle subscription update webhook
   */
  private async handleSubscriptionUpdate(data: any): Promise<void> {
    const polarSubscriptionId = data.id;
    this.logger.log(
      `Handling subscription update for Polar ID: ${polarSubscriptionId}`,
    );

    let subscription = await this.prisma.subscription.findUnique({
      where: { polarSubscriptionId },
    });

    // If subscription doesn't exist, try to find user and create it
    if (!subscription) {
      // Try to find user by customer email or external_id
      const customerEmail = data.customer?.email;
      const externalId = data.customer?.external_id;

      let user = null;

      if (externalId) {
        // Find user by external_id (which should be the user ID)
        user = await this.prisma.user.findUnique({
          where: { id: externalId },
        });
      }

      if (!user && customerEmail) {
        // Fallback: find user by email
        user = await this.prisma.user.findUnique({
          where: { email: customerEmail },
        });
      }

      if (!user) {
        this.logger.warn(
          `Subscription webhook: User not found for customer ${customerEmail || externalId}. Subscription ID: ${polarSubscriptionId}`,
        );
        return;
      }

      this.logger.log(
        `Found matching user ${user.id} for Polar subscription ${polarSubscriptionId}`,
      );

      // Check if subscription already exists for this user (could have been created by verify-checkout)
      const existingSubscription = await this.prisma.subscription.findUnique({
        where: { userId: user.id },
      });

      // Create or update subscription record (use upsert to handle existing subscriptions)
      subscription = await this.prisma.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          polarSubscriptionId: data.id,
          polarCustomerId: data.customer_id || data.customer?.id,
          status: data.status,
          productId: data.product_id || data.product?.id,
          priceId: data.price_id || data.price?.id,
          currentPeriodStart: data.current_period_start
            ? new Date(data.current_period_start)
            : null,
          currentPeriodEnd: data.current_period_end
            ? new Date(data.current_period_end)
            : null,
          cancelAtPeriodEnd: data.cancel_at_period_end || false,
          canceledAt: data.canceled_at ? new Date(data.canceled_at) : null,
          metadata: data.metadata || {},
        },
        update: {
          polarSubscriptionId: data.id,
          polarCustomerId: data.customer_id || data.customer?.id,
          status: data.status,
          productId: data.product_id || data.product?.id,
          priceId: data.price_id || data.price?.id,
          currentPeriodStart: data.current_period_start
            ? new Date(data.current_period_start)
            : null,
          currentPeriodEnd: data.current_period_end
            ? new Date(data.current_period_end)
            : null,
          cancelAtPeriodEnd: data.cancel_at_period_end || false,
          canceledAt: data.canceled_at ? new Date(data.canceled_at) : null,
          metadata: data.metadata || {},
        },
      });

      // IDEMPOTENCY CHECK: Only reset credits if this is truly a new subscription
      // If verify-checkout already synced this subscription (same productId and recent update), skip credit reset
      const isAlreadySynced = existingSubscription?.polarSubscriptionId === data.id ||
        (existingSubscription?.productId === (data.product_id || data.product?.id) &&
         existingSubscription?.updatedAt && 
         (Date.now() - new Date(existingSubscription.updatedAt).getTime()) < 2 * 60 * 1000 &&
         (existingSubscription.status === 'active' || existingSubscription.status === 'trialing')); // Only skip if already active

      if (isAlreadySynced) {
        this.logger.log(
          `Subscription ${polarSubscriptionId} already synced for user ${user.id}. Skipping credit reset.`,
        );
        return;
      }

      // Update monthly limit based on product metadata
      // Note: This is a NEW subscription (created via webhook), so no previous period - no rollover
      const monthlyLimit = await this.getMonthlyCreditLimit(
        data.product_id || data.product?.id,
        data,
      );
      await this.creditService.updateCreditsFromSubscription(
        user.id,
        monthlyLimit,
      );

      this.logger.log(
        `Created new subscription ${polarSubscriptionId} for user ${user.id} with ${monthlyLimit} credits`,
      );
      return;
    }

    // Update existing subscription
    const previousStatus = subscription.status;
    const previousProductId = subscription.productId;
    const previousPeriodStart = subscription.currentPeriodStart
      ? new Date(subscription.currentPeriodStart).getTime()
      : 0;

    // Extract new values for comparison
    const newStatus = data.status;
    const newProductId = data.product_id || data.product?.id;
    const newPeriodStart = data.current_period_start
      ? new Date(data.current_period_start).getTime()
      : 0;

    await this.prisma.subscription.update({
      where: { polarSubscriptionId },
      data: {
        status: newStatus,
        productId: newProductId,
        priceId: data.price_id || data.price?.id,
        currentPeriodStart: data.current_period_start
          ? new Date(data.current_period_start)
          : null,
        currentPeriodEnd: data.current_period_end
          ? new Date(data.current_period_end)
          : null,
        cancelAtPeriodEnd: data.cancel_at_period_end || false,
        canceledAt: data.canceled_at ? new Date(data.canceled_at) : null,
        metadata: data.metadata || {},
      },
    });

    // --- RENEWAL & PLAN CHANGE LOGIC ---

    // 1. Renewal: Period Start moved forward
    const isRenewal =
      newPeriodStart > previousPeriodStart &&
      (newStatus === 'active' || newStatus === 'trialing');

    // 2. Plan Change: Product ID is different
    const isPlanChange =
      newProductId !== previousProductId &&
      (newStatus === 'active' || newStatus === 'trialing');

    // 3. Reactivation: Status changed from inactive/past_due to active
    const isReactivation =
      (newStatus === 'active' || newStatus === 'trialing') &&
      previousStatus !== 'active' &&
      previousStatus !== 'trialing';

    if (isRenewal || isPlanChange || isReactivation) {
      if (isRenewal)
        this.logger.log(
          `Subscription RENEWAL detected for user ${subscription.userId}. Resetting credits.`,
        );
      if (isPlanChange)
        this.logger.log(
          `Subscription PLAN CHANGE detected for user ${subscription.userId}. Updating limit.`,
        );
      if (isReactivation)
        this.logger.log(
          `Subscription REACTIVATION detected for user ${subscription.userId}. Resetting credits.`,
        );

      const monthlyLimit = await this.getMonthlyCreditLimit(newProductId, data);
      // Reset credits with new monthly limit
      await this.creditService.updateCreditsFromSubscription(
        subscription.userId,
        monthlyLimit,
      );
    } else {
      this.logger.debug(
        `Minor subscription update for user ${subscription.userId} (No credit reset required)`,
      );
    }
  }

  /**
   * Handle subscription canceled webhook
   *
   * IMPORTANT: "Canceled" means the user clicked cancel, NOT that access should end.
   * Access should be preserved until currentPeriodEnd.
   * Credits should only be reset when the period actually ends.
   */
  private async handleSubscriptionCanceled(data: any): Promise<void> {
    const polarSubscriptionId = data.id;
    const currentPeriodEnd = data.current_period_end || data.currentPeriodEnd;

    this.logger.log(
      `Handling subscription.canceled webhook: ${polarSubscriptionId}`,
    );

    // Find the subscription to get the userId
    const subscription = await this.prisma.subscription.findUnique({
      where: { polarSubscriptionId },
    });

    if (!subscription) {
      this.logger.warn(
        `Subscription ${polarSubscriptionId} not found in database`,
      );
      return;
    }

    const now = new Date();
    const periodEnd = currentPeriodEnd
      ? new Date(currentPeriodEnd)
      : subscription.currentPeriodEnd;
    const cancelAtPeriodEnd = data.cancel_at_period_end ?? true;
    const periodStillValid = periodEnd && new Date(periodEnd) > now;

    if (periodStillValid && cancelAtPeriodEnd) {
      // User canceled but period is still valid and they chose "at period end"
      this.logger.log(
        `Subscription ${polarSubscriptionId} canceled but period valid until ${periodEnd}. ` +
        `Preserving access and credits for user ${subscription.userId}.`,
      );

      await this.prisma.subscription.update({
        where: { polarSubscriptionId },
        data: {
          cancelAtPeriodEnd: true,
          canceledAt: data.canceled_at
            ? new Date(data.canceled_at)
            : new Date(),
          // IMPORTANT: Keep status as 'active' or 'trialing' if it already was
          // Unless it was already canceled
        },
      });

      // DO NOT reset credits - user paid for this period
    } else {
      // Period has ended OR user chose "Immediately"
      this.logger.log(
        `Subscription ${polarSubscriptionId} ${!cancelAtPeriodEnd ? 'immediately canceled' : 'period has ended'} for user ${subscription.userId}. ` +
        `Revoking access and resetting credits to free tier.`,
      );

      await this.prisma.subscription.update({
        where: { polarSubscriptionId },
        data: {
          status: SUBSCRIPTION_STATUS.CANCELED,
          cancelAtPeriodEnd: cancelAtPeriodEnd,
          canceledAt: data.canceled_at
            ? new Date(data.canceled_at)
            : new Date(),
        },
      });

      // NOW reset credits to free tier
      await this.creditService.updateCreditsFromSubscription(
        subscription.userId,
        CREDITS.FREE_TIER,
      );
    }
  }

  /**
   * Handle subscription revoked webhook
   *
   * According to Polar.sh documentation:
   * - For end-of-period cancellation: subscription.revoked is sent when the billing period ends
   * - For immediate cancellation: subscription.revoked is sent immediately
   *
   * In BOTH cases, access should be revoked and credits reset to free tier.
   * The subscription status at this point is 'canceled' in Polar.
   */
  private async handleSubscriptionRevoked(data: any): Promise<void> {
    const polarSubscriptionId = data.id;
    const isImmediateRevoke = !data.cancel_at_period_end;

    this.logger.log(
      `Handling subscription.revoked webhook: ${polarSubscriptionId} ` +
      `(${isImmediateRevoke ? 'IMMEDIATE' : 'END-OF-PERIOD'} revocation)`,
    );

    const subscription = await this.prisma.subscription.findUnique({
      where: { polarSubscriptionId },
    });

    if (!subscription) {
      this.logger.warn(
        `Subscription ${polarSubscriptionId} not found in database for revocation`,
      );
      return;
    }

    this.logger.log(
      `Subscription ${polarSubscriptionId} revoked for user ${subscription.userId}. ` +
      `Access ended. Resetting credits to free tier.`,
    );

    // Reset credits to free tier - access has ended
    await this.creditService.updateCreditsFromSubscription(
      subscription.userId,
      CREDITS.FREE_TIER,
    );

    // Update subscription status to canceled/revoked
    await this.prisma.subscription.update({
      where: { polarSubscriptionId },
      data: {
        status: SUBSCRIPTION_STATUS.CANCELED,
        canceledAt: data.canceled_at ? new Date(data.canceled_at) : new Date(),
        cancelAtPeriodEnd: false, // Revocation means access is gone, period end no longer matters
      },
    });
  }

  /**
   * Handle customer update webhook
   */
  private async handleCustomerUpdate(
    data: any,
    isDeleted = false,
  ): Promise<void> {
    // Handle customer updates if needed
    if (isDeleted) {
      this.logger.log(
        `CUSTOMER DELETED: ${data.id}. Marking associated subscriptions as inactive.`,
      );
      // Find subscriptions for this customer and mark as inactive
      const polarCustomerId = data.id;
      if (polarCustomerId) {
        // Find all subscriptions for this customer to reset their credits
        const subscriptions = await this.prisma.subscription.findMany({
          where: { polarCustomerId },
        });

        // Reset credits to free tier for each affected user (no rollover)
        for (const subscription of subscriptions) {
          this.logger.log(
            `Resetting credits to free tier (${CREDITS.FREE_TIER}) for user ${subscription.userId} due to customer deletion`,
          );
          await this.creditService.updateCreditsFromSubscription(
            subscription.userId,
            CREDITS.FREE_TIER,
          );
        }

        // Mark subscriptions as inactive
        await this.prisma.subscription.updateMany({
          where: { polarCustomerId },
          data: { status: SUBSCRIPTION_STATUS.INACTIVE },
        });
      }
    } else {
      this.logger.log(`Customer update: ${data.id}`);
    }
  }

  /**
   * Handle subscription uncanceled webhook
   * Fired when a user reactivates a subscription before period end
   */
  private async handleSubscriptionUncanceled(data: any): Promise<void> {
    const polarSubscriptionId = data.id;
    this.logger.log(`Subscription uncanceled: ${polarSubscriptionId}`);

    const updated = await this.prisma.subscription.updateMany({
      where: { polarSubscriptionId },
      data: {
        status: SUBSCRIPTION_STATUS.ACTIVE,
        cancelAtPeriodEnd: false,
        canceledAt: null,
      },
    });

    if (updated.count > 0) {
      this.logger.log(`Reactivated subscription ${polarSubscriptionId}`);
    }
  }

  /**
   * Handle subscription past_due webhook
   * Fired when a payment fails and subscription enters grace period
   */
  private async handleSubscriptionPastDue(data: any): Promise<void> {
    const polarSubscriptionId = data.id;
    this.logger.warn(`Subscription past due: ${polarSubscriptionId}`);

    await this.prisma.subscription.updateMany({
      where: { polarSubscriptionId },
      data: {
        status: SUBSCRIPTION_STATUS.PAST_DUE,
      },
    });
  }

  /**
   * Handle order refunded webhook
   * Fired when a payment is refunded
   */
  private async handleOrderRefunded(data: any): Promise<void> {
    this.logger.log(`Order refunded: ${data.id}`);

    // Get customer info from the order
    const customerId = data.customer_id || data.customer?.id;
    const externalId = data.customer?.external_id;

    if (!customerId && !externalId) {
      this.logger.warn('Order refunded but no customer info found');
      return;
    }

    // Find the user
    let userId: string | null = null;

    if (externalId) {
      // external_id is the user ID
      userId = externalId;
    } else if (customerId) {
      // Find subscription by polar customer ID to get user
      const subscription = await this.prisma.subscription.findFirst({
        where: { polarCustomerId: customerId },
      });
      userId = subscription?.userId || null;
    }

    if (!userId) {
      this.logger.warn(`Could not find user for refunded order: ${data.id}`);
      return;
    }

    // Calculate refund amount in credits (you may want to adjust this logic)
    // For now, we'll mark the subscription as refunded
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (subscription) {
      // If this is a full refund, cancel the subscription
      const refundAmount = data.amount || data.refund_amount || 0;
      const orderAmount = data.order_amount || data.amount || 0;

      if (refundAmount >= orderAmount) {
        // Full refund - cancel subscription and reset credits to free tier
        await this.prisma.subscription.update({
          where: { userId },
          data: {
            status: SUBSCRIPTION_STATUS.REFUNDED,
            canceledAt: new Date(),
          },
        });

        // Reset credits to free tier since the user got a full refund (no rollover)
        this.logger.log(
          `Resetting credits to free tier (${CREDITS.FREE_TIER}) for user ${userId} due to full refund`,
        );
        await this.creditService.updateCreditsFromSubscription(
          userId,
          CREDITS.FREE_TIER,
        );

        this.logger.log(
          `Subscription ${subscription.id} marked as refunded and credits reset`,
        );
      }
    }
  }

  /**
   * Handle meter usage webhook (for usage-based billing)
   */
  private async handleMeterUsage(data: any): Promise<void> {
    // Handle meter usage if you're using usage-based billing
    this.logger.log(`Meter usage recorded: ${data.id}`);
  }

  /**
   * Extract features from Polar product data
   * Features are extracted from feature_1, feature_2, feature_3, etc. metadata keys
   * ai_credits is kept as is in metadata
   */
  extractFeaturesFromProduct(product: any): FeatureResponseDto {
    const productAny = product as any;

    // Extract benefits - handle both camelCase and snake_case
    const benefits: BenefitResponseDto[] = (
      product.benefits ||
      productAny.benefits ||
      []
    ).map((benefit: any) => {
      const benefitAny = benefit as any;
      return {
        id: benefit.id || benefitAny.id,
        type: benefit.type || benefitAny.type,
        description: benefit.description || benefitAny.description,
        selectable: benefit.selectable ?? benefitAny.selectable ?? true,
        metadata: benefit.metadata || benefitAny.metadata || {},
        properties: benefit.properties || benefitAny.properties || {},
      };
    });

    // Extract metadata
    const metadata = product.metadata || productAny.metadata || {};

    // Build feature list from feature_1, feature_2, feature_3, etc.
    const features: string[] = [];

    // Extract features from feature_1, feature_2, feature_3, etc. metadata keys
    // Support up to feature_20
    for (let i = 1; i <= 20; i++) {
      const featureKey = `feature_${i}`;
      const featureValue = metadata[featureKey];

      if (
        featureValue &&
        typeof featureValue === 'string' &&
        featureValue.trim() !== ''
      ) {
        features.push(featureValue.trim());
      }
    }

    // Also add benefit descriptions as features if no feature_X keys found
    if (features.length === 0) {
      benefits.forEach((benefit) => {
        if (benefit.description) {
          features.push(benefit.description);
        }
      });
    }

    return {
      productId: product.id,
      productName: product.name || productAny.name,
      productDescription: product.description || productAny.description,
      benefits,
      metadata,
      features: features.length > 0 ? features : undefined,
    };
  }

  /**
   * Get monthly credit limit based on product ID or metadata
   * Fetches from Polar API if metadata is not available in passed data
   * Falls back to free tier credits if nothing is found
   */
  private async getMonthlyCreditLimit(
    productId?: string,
    data?: any,
  ): Promise<number> {

    // 1. Try to get from passed data (webhook/sync data)
    const metadata = data?.metadata || data?.product?.metadata || {};
    let metadataLimit = metadata.ai_credits;

    // Direct check if metadata property exists on the object passed
    if (!metadataLimit && (data as any)?.metadata?.ai_credits) {
      metadataLimit = (data as any).metadata.ai_credits;
    }

    if (metadataLimit) {
      const parsed = parseInt(String(metadataLimit), 10);
      if (!isNaN(parsed) && parsed > 0) {
        this.logger.log(
          `CREDIT ASSIGNMENT [METADATA]: Assigning ${parsed} credits from product ${productId}`,
        );
        return parsed;
      }
    }

    // 2. Fetch product from Polar API if productId is available and metadata not found
    if (productId && this.polarService.isConfigured()) {
      try {
        this.logger.debug(
          `CREDIT ASSIGNMENT [API_FETCH]: Fetching product ${productId} from Polar to get credit limit`,
        );
        const product = await this.polarService.getProduct(productId);
        const productMetadata =
          product?.metadata || (product as any)?.metadata || {};
        const apiCredits = productMetadata.ai_credits;

        if (apiCredits) {
          const parsed = parseInt(String(apiCredits), 10);
          if (!isNaN(parsed) && parsed > 0) {
            this.logger.log(
              `CREDIT ASSIGNMENT [API]: Assigning ${parsed} credits from Polar API for product ${productId}`,
            );
            return parsed;
          }
        }
      } catch (error: any) {
        this.logger.warn(
          `CREDIT ASSIGNMENT [API_ERROR]: Failed to fetch product ${productId} from Polar: ${error.message}`,
        );
      }
    }

    this.logger.warn(
      `CREDIT ASSIGNMENT [FREE_TIER]: No credit limit found for product ${productId}, defaulting to ${CREDITS.FREE_TIER} (free tier)`,
    );
    return CREDITS.FREE_TIER;
  }

  /**
   * Extract credit limit from product metadata synchronously
   * Used when we already have the full product data (e.g., in getProducts list)
   */
  private extractCreditLimitFromProduct(product: any): number {
    const metadata = product?.metadata || {};
    const aiCredits = metadata.ai_credits;

    if (aiCredits) {
      const parsed = parseInt(String(aiCredits), 10);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }

    return CREDITS.FREE_TIER;
  }

  /**
   * Get slide generation limit for a user based on their subscription
   * Returns the maximum number of slides allowed per document
   */
  async getSlideLimit(userId: string): Promise<number> {
    try {
      const subscription = await this.prisma.subscription.findUnique({
        where: { userId },
      });

      if (!subscription?.productId) {
        // Free tier default: 15 slides
        return 15;
      }

      // Try to get from Polar API
      if (this.polarService.isConfigured()) {
        try {
          const product = await this.polarService.getProduct(
            subscription.productId,
          );
          const metadata = product?.metadata || {};
          const slideLimit = metadata.slide_limit;

          if (slideLimit) {
            const parsed = parseInt(String(slideLimit), 10);
            if (!isNaN(parsed) && parsed > 0) {
              return parsed;
            }
          }
        } catch (error: any) {
          this.logger.warn(
            `Failed to fetch slide limit for product ${subscription.productId}: ${error.message}`,
          );
        }
      }

      // Default fallback
      return 15;
    } catch (error: any) {
      this.logger.error(
        `Error getting slide limit for user ${userId}: ${error.message}`,
      );
      return 15; // Safe default
    }
  }

  /**
   * Get storage limit in GB for a user based on their subscription
   * Returns the maximum storage allowed in GB
   */
  async getStorageLimit(userId: string): Promise<number> {
    try {
      const subscription = await this.prisma.subscription.findUnique({
        where: { userId },
      });

      if (!subscription?.productId) {
        // Free tier default: 0 GB
        return 0;
      }

      // Try to get from Polar API
      if (this.polarService.isConfigured()) {
        try {
          const product = await this.polarService.getProduct(
            subscription.productId,
          );
          const metadata = product?.metadata || {};
          const storageGb = metadata.storage_gb;

          if (storageGb) {
            const parsed = parseFloat(String(storageGb));
            if (!isNaN(parsed) && parsed > 0) {
              return parsed;
            }
          }
        } catch (error: any) {
          this.logger.warn(
            `Failed to fetch storage limit for product ${subscription.productId}: ${error.message}`,
          );
        }
      }

      // Default fallback
      return 0;
    } catch (error: any) {
      this.logger.error(
        `Error getting storage limit for user ${userId}: ${error.message}`,
      );
      return 0; // Safe default
    }
  }

  /**
   * Get current storage usage in GB for a user
   */
  async getStorageUsage(userId: string): Promise<number> {
    try {
      const result = await this.prisma.media.aggregate({
        where: {
          userId,
          deletedAt: null,
        },
        _sum: {
          size: true,
        },
      });

      const totalBytes = result._sum.size || 0;
      // Convert bytes to GB
      return totalBytes / (1024 * 1024 * 1024);
    } catch (error: any) {
      this.logger.error(
        `Error getting storage usage for user ${userId}: ${error.message}`,
      );
      return 0;
    }
  }



  /**
   * Get credit balance
   */
  async getCreditBalance(user: User): Promise<ResponseModel> {
    try {
      const balance = await this.creditService.getCreditBalance(user.id);

      // Simplify the response for the user
      const simplifiedBalance = {
        id: balance.id,
        userId: balance.userId,
        balance: balance.balance,
        quota: balance.quota,
        usedCredits: balance.usedCredits,
        lastResetAt: balance.lastResetAt,
        updatedAt: balance.updatedAt,
      };

      return successResponse(
        'Credit balance retrieved successfully',
        simplifiedBalance,
      );
    } catch (error) {
      return processException(error);
    }
  }

  /**
   * Use credits
   */
  async useCredits(
    user: User,
    amount: number,
    description?: string,
    docId?: string,
  ): Promise<ResponseModel> {
    try {
      await this.creditService.useCredits(
        user.id,
        amount,
        description,
        docId,
      );

      return this.getCreditBalance(user);
    } catch (error) {
      return processException(error);
    }
  }

  /**
   * Get available products/pricing plans
   */
  async getProducts(): Promise<ResponseModel> {
    this.logger.log('Fetching products from Polar.sh...');
    try {
      if (!this.polarService.isConfigured()) {
        return errorResponse('Polar.sh is not configured');
      }

      const productsResponse = await this.polarService.listProducts();
      if (!productsResponse) {
        return errorResponse(
          'Failed to fetch products from Polar.sh. Please check your POLAR_ACCESS_TOKEN is valid and not expired.',
        );
      }

      // Transform products to include credit limits
      // Polar SDK returns a paginated response with items array
      const products: any[] = [];

      // Handle both direct items array and paginated response
      let items: any[] = [];

      // Check if it's a response object with items property
      // Polar SDK returns: { result: { items: [...] }, next: ..., ~next: ... }
      if (productsResponse && typeof productsResponse === 'object') {
        // Check for result.items (Polar SDK structure)
        if ((productsResponse as any).result?.items !== undefined) {
          const itemsValue = (productsResponse as any).result.items;
          if (Array.isArray(itemsValue)) {
            items = itemsValue;
          } else {
            // Try to convert iterator or other structure to array
            try {
              items = Array.from(itemsValue || []);
            } catch (e) {
              console.error('Failed to convert items to array:', e);
              return errorResponse(
                'Invalid products response format from Polar.sh',
              );
            }
          }
        } else if ((productsResponse as any).items !== undefined) {
          // Fallback: direct items property
          const itemsValue = (productsResponse as any).items;
          if (Array.isArray(itemsValue)) {
            items = itemsValue;
          } else {
            try {
              items = Array.from(itemsValue || []);
            } catch (e) {
              console.error('Failed to convert items to array:', e);
              return errorResponse(
                'Invalid products response format from Polar.sh',
              );
            }
          }
        } else if (Array.isArray(productsResponse)) {
          // Direct array response
          items = productsResponse;
        } else {
          // Unknown structure - log it for debugging
          console.error('Unknown products response structure:', {
            type: typeof productsResponse,
            keys: Object.keys(productsResponse || {}),
            sample: JSON.stringify(productsResponse).substring(0, 200),
          });
          return errorResponse(
            'Invalid products response format from Polar.sh',
          );
        }
      } else {
        return errorResponse('Invalid products response from Polar.sh');
      }

      if (!Array.isArray(items)) {
        console.error(
          `Products response items is not an array. Type: ${typeof items}`,
        );
        return errorResponse('Invalid products response format from Polar.sh');
      }

      products.push(
        ...items.map((product: any) => {
          // Polar SDK returns snake_case, handle both formats
          const prices = (product.prices || []).map((price: any) => ({
            id: price.id,
            productId: product.id,
            amountType: price.amountType || price.amount_type || 'fixed',
            priceAmount: price.priceAmount || price.price_amount || 0,
            priceCurrency: price.priceCurrency || price.price_currency || 'usd',
            metadata: price.metadata || {},
          }));

          // Extract benefits
          const benefits: BenefitResponseDto[] = (product.benefits || []).map(
            (benefit: any) => ({
              id: benefit.id,
              type: benefit.type,
              description: benefit.description,
              selectable: benefit.selectable ?? true,
              metadata: benefit.metadata || {},
              properties: benefit.properties || {},
            }),
          );

          // Extract features
          const features = this.extractFeaturesFromProduct(product);

          return {
            id: product.id,
            name: product.name,
            description: product.description || null,
            isArchived: product.isArchived || product.is_archived || false,
            recurringInterval:
              product.recurringInterval || product.recurring_interval,
            recurringIntervalCount:
              product.recurringIntervalCount ||
              product.recurring_interval_count ||
              1,
            prices,
            benefits,
            metadata: product.metadata || {},
            features: features.features,
            createdAt: product.createdAt || product.created_at,
            updatedAt:
              (product as any).updatedAt ||
              (product as any).updated_at ||
              product.createdAt ||
              product.created_at,
            // Add credit limit based on product metadata
            monthlyCreditLimit: this.extractCreditLimitFromProduct(product),
          };
        }),
      );

      // Sort products by price (lowest first)
      if (products.length > 0) {
        products.sort((a, b) => {
          // Find minimum price for each product
          const getMinPrice = (p: any) => {
            if (!p.prices || p.prices.length === 0) return 999999;
            return Math.min(...p.prices.map((pr: any) => pr.priceAmount || 0));
          };

          const priceA = getMinPrice(a);
          const priceB = getMinPrice(b);

          if (priceA !== priceB) {
            return priceA - priceB;
          }

          // Fallback to name if prices are equal
          return (a.name || '').localeCompare(b.name || '');
        });

        this.logger.log(
          `Products sorted by price. Order: ${products.map((p) => `${p.name} ($${(p.prices?.[0]?.priceAmount || 0) / 100})`).join(', ')}`,
        );
      }

      return successResponse(
        `Products retrieved successfully (${new Date().toISOString()})`,
        products,
      );
    } catch (error) {
      return processException(error);
    }
  }

  /**
   * Get plan tiers for UI display
   * Returns a lightweight list of plan tiers with slide limits for the card selector
   * This is cached and used to dynamically show tier labels
   */
  async getPlanTiers(): Promise<ResponseModel> {
    try {
      if (!this.polarService.isConfigured()) {
        // Return default tiers if Polar is not configured
        return successResponse('Plan tiers (default)', {
          tiers: [
            { name: 'Free', planName: 'free', slideLimit: 15 },
            { name: 'Go Plan', planName: 'go_plan', slideLimit: 20 },
            { name: 'Plus Plan', planName: 'plus', slideLimit: 35 },
            { name: 'Pro Plan', planName: 'pro', slideLimit: 50 },
          ],
          freeTier: { name: 'Free', planName: 'free', slideLimit: 15 },
        });
      }

      const productsResponse = await this.polarService.listProducts();
      if (!productsResponse) {
        // Return default tiers on error
        return successResponse('Plan tiers (default)', {
          tiers: [
            { name: 'Free', planName: 'free', slideLimit: 15 },
            { name: 'Go Plan', planName: 'go_plan', slideLimit: 20 },
            { name: 'Plus Plan', planName: 'plus', slideLimit: 35 },
            { name: 'Pro Plan', planName: 'pro', slideLimit: 50 },
          ],
          freeTier: { name: 'Free', planName: 'free', slideLimit: 15 },
        });
      }

      // Extract items from response
      let items: any[] = [];
      if (productsResponse && typeof productsResponse === 'object') {
        if ((productsResponse as any).result?.items) {
          items = Array.isArray((productsResponse as any).result.items)
            ? (productsResponse as any).result.items
            : Array.from((productsResponse as any).result.items || []);
        } else if ((productsResponse as any).items) {
          items = Array.isArray((productsResponse as any).items)
            ? (productsResponse as any).items
            : Array.from((productsResponse as any).items || []);
        } else if (Array.isArray(productsResponse)) {
          items = productsResponse;
        }
      }

      // Build tier list from products
      const tiers = items
        .filter((product: any) => !product.isArchived && !product.is_archived)
        .map((product: any) => {
          const metadata = product.metadata || {};
          const prices = product.prices || [];
          const minPrice = prices.length > 0
            ? Math.min(...prices.map((p: any) => p.priceAmount || p.price_amount || 0))
            : 0;

          return {
            name: product.name,
            planName: metadata.plan_name || product.name.toLowerCase().replace(/\s+/g, '_'),
            slideLimit: metadata.slide_limit ? parseInt(String(metadata.slide_limit), 10) : 10,
            priceAmount: minPrice,
          };
        })
        // Sort by price (lowest first)
        .sort((a: any, b: any) => a.priceAmount - b.priceAmount)
        // Remove priceAmount from output (only used for sorting)
        .map(({ priceAmount, ...tier }: any) => tier);

      // Add free tier at the beginning
      const freeTier = { name: 'Free', planName: 'free', slideLimit: 15 };
      const allTiers = [freeTier, ...tiers];

      return successResponse('Plan tiers retrieved successfully', {
        tiers: allTiers,
        freeTier,
      });
    } catch (error) {
      this.logger.error('Failed to get plan tiers:', error);
      // Return default tiers on error
      return successResponse('Plan tiers (default)', {
        tiers: [
          { name: 'Free', planName: 'free', slideLimit: 15 },
          { name: 'Go Plan', planName: 'go_plan', slideLimit: 20 },
          { name: 'Plus Plan', planName: 'plus', slideLimit: 35 },
          { name: 'Pro Plan', planName: 'pro', slideLimit: 50 },
        ],
        freeTier: { name: 'Free', planName: 'free', slideLimit: 15 },
      });
    }
  }

  /**
   * Get product by ID
   */
  async getProduct(productId: string): Promise<ResponseModel> {
    try {
      if (!this.polarService.isConfigured()) {
        return errorResponse('Polar.sh is not configured');
      }

      const product = await this.polarService.getProduct(productId);
      if (!product) {
        return errorResponse('Product not found');
      }

      // Polar SDK returns snake_case properties
      const prices = (product.prices || []).map((price: any) => ({
        id: price.id,
        productId: product.id,
        amountType: price.amountType || price.amount_type || 'fixed',
        priceAmount: price.priceAmount || price.price_amount || 0,
        priceCurrency: price.priceCurrency || price.price_currency || 'usd',
        metadata: price.metadata || {},
      }));

      // Cast to any to access both camelCase and snake_case properties
      const productAny = product as any;

      // Extract benefits
      const benefits: BenefitResponseDto[] = (
        (product as any).benefits || []
      ).map((benefit: any) => ({
        id: benefit.id,
        type: benefit.type,
        description: benefit.description,
        selectable: benefit.selectable ?? true,
        metadata: benefit.metadata || {},
        properties: benefit.properties || {},
      }));

      // Extract features
      const features = this.extractFeaturesFromProduct(product);

      const productData = {
        id: product.id,
        name: product.name,
        description: product.description || null,
        isArchived: product.isArchived || productAny.is_archived || false,
        recurringInterval:
          product.recurringInterval || productAny.recurring_interval,
        recurringIntervalCount:
          product.recurringIntervalCount ||
          productAny.recurring_interval_count ||
          1,
        prices,
        benefits,
        metadata: product.metadata || {},
        features: features.features,
        createdAt: product.createdAt || productAny.created_at,
        updatedAt:
          productAny.updatedAt ||
          productAny.updated_at ||
          product.createdAt ||
          productAny.created_at,
        monthlyCreditLimit: this.extractCreditLimitFromProduct(product),
      };

      return successResponse('Product retrieved successfully', productData);
    } catch (error) {
      return processException(error);
    }
  }

  /**
   * Create checkout session for a product
   */
  async createCheckout(
    user: User,
    productId: string,
    successUrl?: string,
  ): Promise<ResponseModel> {
    try {
      if (!this.polarService.isConfigured()) {
        return errorResponse(
          'Payment system is not configured. Please contact support.',
        );
      }

      // Validate productId
      if (!productId || productId.trim() === '') {
        return errorResponse('Product ID is required to create a checkout.');
      }

      // Check if user already has an active subscription
      const existingSubscription = await this.prisma.subscription.findUnique({
        where: { userId: user.id },
      });

      if (existingSubscription) {
        const { hasAccess } = await this.hasActiveAccess(user.id);

        this.logger.log(
          `[createCheckout] Checking subscription for user ${user.id}`,
          {
            hasAccess,
            existingProductId: existingSubscription.productId,
            requestedProductId: productId,
            status: existingSubscription.status,
          },
        );

        if (hasAccess) {
          // User has active subscription - block ALL new checkouts
          // Polar.sh does not allow multiple subscriptions per customer
          // Users must manage their subscription (upgrade/downgrade/cancel) through the subscription page
          this.logger.warn(
            `User ${user.id} tried to checkout product ${productId} while having active subscription to ${existingSubscription.productId}`,
          );
          return errorResponse(
            'You already have an active subscription. ' +
            'Please visit your subscription page to manage or change your plan.',
          );
        }
        // If no active access (expired/canceled), allow new subscription
      }

      // Ensure customer exists in Polar
      const customer = await this.polarService.createOrGetCustomer(
        user.id,
        user.email,
        user.name || user.email,
      );

      if (!customer) {
        this.logger.error(
          `Failed to create/get customer for user ${user.id} (${user.email})`,
        );
        return errorResponse(
          'Unable to initialize your customer profile. Please try again or contact support.',
        );
      }

      // Create checkout session
      const checkout = await this.polarService.createCheckout(
        productId,
        user.email,
        successUrl,
      );

      if (!checkout) {
        this.logger.error(
          `Checkout creation returned null for product ${productId}, user ${user.id}`,
        );
        return errorResponse(
          'Unable to create checkout session. The product may be unavailable or there was a payment system error. Please try again.',
        );
      }

      // Return checkout URL - Polar SDK returns checkout object with url property
      const checkoutUrl =
        (checkout as any).url || (checkout as any).checkout_url || null;

      if (!checkoutUrl) {
        this.logger.error('Checkout created but no URL found:', checkout);
        return errorResponse(
          'Checkout was created but the payment link is unavailable. Please try again.',
        );
      }

      return successResponse('Checkout session created successfully', {
        checkoutUrl,
        checkoutId: (checkout as any).id,
      });
    } catch (error: any) {
      this.logger.error(`Failed to create checkout: ${error.message}`, error);

      // Provide more specific error messages based on error type
      let userMessage = 'Failed to create checkout session. Please try again.';

      if (error.message?.includes('product')) {
        userMessage =
          'The selected plan is not available. Please choose a different plan.';
      } else if (error.message?.includes('customer')) {
        userMessage =
          'There was an issue with your account. Please try again or contact support.';
      } else if (
        error.message?.includes('network') ||
        error.message?.includes('timeout')
      ) {
        userMessage =
          'Connection to payment system failed. Please check your internet and try again.';
      } else if (
        error.message?.includes('401') ||
        error.message?.includes('unauthorized')
      ) {
        userMessage =
          'Payment system authentication failed. Please contact support.';
      }

      return errorResponse(userMessage);
    }
  }
}
