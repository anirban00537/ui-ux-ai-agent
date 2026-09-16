import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { successResponse, processException } from 'src/shared/helpers/functions';
import { ResponseModel } from 'src/shared/models/response.model';
import { Polar } from '@polar-sh/sdk';

@Injectable()
export class AdminUsersService {
  private readonly logger = new Logger(AdminUsersService.name);
  private readonly polar: Polar;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.polar = new Polar({
      accessToken: this.configService.get('POLAR_ACCESS_TOKEN'),
      server: this.configService.get('POLAR_ENVIRONMENT') === 'production' 
        ? 'production' 
        : 'sandbox',
    });
  }

  /**
   * Enrich subscription data with product/price details from Polar
   */
  private async enrichSubscription(subscription: any) {
    if (!subscription || !subscription.productId || !subscription.priceId) {
      return subscription;
    }

    try {
      // Fetch product details from Polar
      const product = await this.polar.products.get({ id: subscription.productId });
      
      // Find the specific price from the product
      const price = product.prices?.find(p => p.id === subscription.priceId);

      // Extract price amount based on type
      let priceAmount = 0;
      if (price && 'amountType' in price) {
        if (price.amountType === 'fixed') {
          priceAmount = (price as any).priceAmount || 0;
        }
      }

      return {
        ...subscription,
        planId: product.name || 'Unknown Plan',
        price: priceAmount,
        interval: price?.recurringInterval || 'month',
      };
    } catch (error) {
      this.logger.warn(`Failed to enrich subscription ${subscription.id}:`, error.message);
      // Return original subscription if enrichment fails
      return {
        ...subscription,
        planId: 'Unknown Plan',
        price: 0,
        interval: 'month',
      };
    }
  }

  async getUsers(query: any): Promise<ResponseModel> {
    try {
      const { page = 1, perPage = 20, search = '' } = query;
      const skip = (page - 1) * perPage;

      const where: any = {};
      if (search) {
        where.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          skip: Number(skip),
          take: Number(perPage),
          include: {
            Subscription: true,
            CreditBalance: true,
            AiUsages: {
              orderBy: { createdAt: 'desc' },
            },
            Docs: {
              select: {
                id: true,
                title: true,
                createdAt: true,
                _count: {
                  select: { cards: true }
                }
              }
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.user.count({ where }),
      ]);

      // Enrich subscriptions with Polar product data
      const enrichedUsers = await Promise.all(
        users.map(async (user) => {
          if (user.Subscription) {
            const enrichedSubscription = await this.enrichSubscription(user.Subscription);
            return {
              ...user,
              Subscription: enrichedSubscription,
            };
          }
          return user;
        })
      );

      return successResponse('Users retrieved successfully', {
        users: enrichedUsers,
        pagination: {
          page: Number(page),
          perPage: Number(perPage),
          total,
          totalPages: Math.ceil(total / perPage),
        },
      });
    } catch (error) {
      return processException(error);
    }
  }

  async getUserActivity(userId: string): Promise<ResponseModel> {
    try {
      const activities = await this.prisma.systemActivity.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
      return successResponse('User activity retrieved', activities);
    } catch (error) {
      return processException(error);
    }
  }

  async adjustUserCredits(userId: string, amount: number, type: string, description: string): Promise<ResponseModel> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const balance = await tx.creditBalance.findUnique({ where: { userId } });
        if (!balance) throw new Error('Credit balance not found');

        const currentBalance = balance.balance;
        const finalBalance = currentBalance + amount;

        const updated = await tx.creditBalance.update({
          where: { userId },
          data: {
            balance: finalBalance,
          },
        });

        await tx.creditTransaction.create({
          data: {
            userId,
            amount,
            type,
            description,
            balanceAfter: finalBalance,
          },
        });

        return successResponse('Credits adjusted successfully', updated);
      });
    } catch (error) {
      return processException(error);
    }
  }

  async updateUserStatus(userId: string, status: number): Promise<ResponseModel> {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { status },
      });
      return successResponse('User status updated', user);
    } catch (error) {
      return processException(error);
    }
  }
}
