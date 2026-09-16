import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { successResponse, processException } from 'src/shared/helpers/functions';
import { ResponseModel } from 'src/shared/models/response.model';
import { Polar } from '@polar-sh/sdk';

@Injectable()
export class AdminFinanceService {
  private readonly logger = new Logger(AdminFinanceService.name);
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

  async getSubscriptions(query: any): Promise<ResponseModel> {
    try {
      const { page = 1, perPage = 20, search = '', userId, status } = query;
      const skip = (page - 1) * perPage;

      const where: any = {};
      if (search) {
        where.OR = [
          { polarSubscriptionId: { contains: search, mode: 'insensitive' } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { user: { name: { contains: search, mode: 'insensitive' } } },
        ];
      }
      if (userId) where.userId = userId;
      if (status) where.status = status;

      const [subscriptions, total] = await Promise.all([
        this.prisma.subscription.findMany({
          where,
          skip: Number(skip),
          take: Number(perPage),
          include: {
            user: { 
              select: { 
                email: true, 
                name: true,
                CreditBalance: true,
              } 
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.subscription.count({ where }),
      ]);

      // Fetch AI usage statistics for these users
      const userIds = subscriptions.map(s => s.userId);
      
      const usageStats = await this.prisma.aiUsage.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds } },
        _sum: {
          inputTokens: true,
          outputTokens: true,
          cost: true,
        },
      });
      
      // Map usage stats back to subscriptions
      const subscriptionsWithUsage = subscriptions.map(sub => {
        const usage = usageStats.find(u => u.userId === sub.userId)?._sum || {
          inputTokens: 0,
          outputTokens: 0,
          cost: 0,
        };

        return {
          ...sub,
          usage: {
            inputTokens: usage.inputTokens || 0,
            outputTokens: usage.outputTokens || 0,
            totalTokens: (usage.inputTokens || 0) + (usage.outputTokens || 0),
            cost: usage.cost || 0,
          },
          creditBalance: (sub.user as any).CreditBalance,
        };
      });

      return successResponse('Subscriptions retrieved successfully', {
        subscriptions: subscriptionsWithUsage,
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

  async getRevenueAnalytics(): Promise<ResponseModel> {
    try {
      const activeSubscriptions = await this.prisma.subscription.findMany({
        where: { status: 'active' },
        select: { productId: true, priceId: true }
      });
      
      const [activeSubsCount, churnedSubsCount] = await Promise.all([
        this.prisma.subscription.count({ where: { status: 'active' } }),
        this.prisma.subscription.count({ where: { status: 'canceled' } }),
      ]);

      const revenueData = await this.calculateRevenue(activeSubscriptions);

      // Return MRR as revenue
      return successResponse('Revenue analytics retrieved', {
        revenue: revenueData.mrr / 100, // Convert cents to dollars
        activeSubscriptions: activeSubsCount,
        churnedSubscriptions: churnedSubsCount,
      });
    } catch (error) {
      return processException(error);
    }
  }

  async getExpiringSubscriptions(): Promise<ResponseModel> {
    try {
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      const subscriptions = await this.prisma.subscription.findMany({
        where: {
          status: 'active',
          currentPeriodEnd: {
            lte: sevenDaysFromNow,
            gte: new Date(),
          },
        },
        include: { user: true },
      });

      return successResponse('Expiring subscriptions retrieved', subscriptions);
    } catch (error) {
      return processException(error);
    }
  }

  private async calculateRevenue(subscriptions: any[]) {
    if (subscriptions.length === 0) {
      return { mrr: 0, arr: 0, average: 0 };
    }

    // Identify unique products to fetch
    const uniqueProductIds = [...new Set(subscriptions.map(s => s.productId).filter(Boolean))];
    
    // Fetch products and create a price map
    const priceMap = new Map<string, any>(); // priceId -> price object
    
    // We'll cache product fetches to avoid duplicates
    await Promise.all(uniqueProductIds.map(async (productId) => {
      try {
        const product = await this.polar.products.get({ id: productId });
        if (product && product.prices) {
          product.prices.forEach(price => {
            priceMap.set(price.id, price);
          });
        }
      } catch (err) {
        this.logger.warn(`Failed to fetch product ${productId}`, err);
      }
    }));

    let mrr = 0;
    
    for (const sub of subscriptions) {
      if (sub.priceId && priceMap.has(sub.priceId)) {
        const price = priceMap.get(sub.priceId);
        let amount = 0;
        
        if ('priceAmount' in price) {
           amount = price.priceAmount || 0;
        } else if ('amountType' in price && price.amountType === 'fixed') {
           amount = (price as any).priceAmount || 0;
        }

        // Normalize to monthly revenue
        if (price.recurringInterval === 'year') {
          mrr += Math.round(amount / 12);
        } else {
          mrr += amount;
        }
      }
    }

    const arr = mrr * 12;
    const average = subscriptions.length > 0 ? Math.round(mrr / subscriptions.length) : 0;

    return { mrr, arr, average };
  }
}


