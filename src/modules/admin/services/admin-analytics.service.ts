import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { successResponse, processException } from 'src/shared/helpers/functions';
import { ResponseModel } from 'src/shared/models/response.model';
import { Polar } from '@polar-sh/sdk';

@Injectable()
export class AdminAnalyticsService {
  private readonly logger = new Logger(AdminAnalyticsService.name);
  
  // Pricing constants from glm-4.7 model
  private readonly INPUT_TOKEN_COST = 0.27 / 1_000_000;  // per token
  private readonly OUTPUT_TOKEN_COST = 1.10 / 1_000_000; // per token

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
   * New User Management Analytics
   */
  async getUserAnalytics(): Promise<ResponseModel> {
    try {
      // 1. Get user counts
      const [totalUsers, usersWithSubscription] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({
          where: {
            Subscription: {
              status: 'active'
            }
          }
        })
      ]);

      const freeUsers = totalUsers - usersWithSubscription;

      // 2. Calculate revenue from active subscriptions
      const subscriptions = await this.prisma.subscription.findMany({
        where: { status: 'active' },
        select: { 
          productId: true,
          priceId: true 
        }
      });

      const revenueData = await this.calculateRevenue(subscriptions);

      // 3. Calculate AI usage and costs
      const aiUsageData = await this.calculateAiUsage();

      // 4. Calculate costs by user type
      const costBreakdown = await this.calculateCostBreakdown(aiUsageData);

      // 5. Calculate profitability metrics
      const profitability = this.calculateProfitability(
        revenueData,
        costBreakdown
      );

      // 6. Calculate engagement metrics
      const engagement = await this.calculateEngagement();

      return successResponse('User analytics retrieved successfully', {
        users: {
          total: totalUsers,
          free: freeUsers,
          paid: usersWithSubscription,
        },
        revenue: revenueData,
        aiUsage: aiUsageData,
        costs: costBreakdown,
        profitability: profitability,
        engagement: {
          ...engagement,
          averageCostPerDesign: engagement.totalDesigns > 0 ? aiUsageData.totalCost / engagement.totalDesigns : 0,
          averageCostPerArtboard: engagement.totalArtboards > 0 ? aiUsageData.totalCost / engagement.totalArtboards : 0,
        },
      });
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

  private async calculateAiUsage() {
    const result = await this.prisma.aiUsage.aggregate({
      _sum: {
        inputTokens: true,
        outputTokens: true,
      },
      _count: true,
    });

    const inputTokens = result._sum.inputTokens || 0;
    const outputTokens = result._sum.outputTokens || 0;
    const totalCost = 
      (inputTokens * this.INPUT_TOKEN_COST) +
      (outputTokens * this.OUTPUT_TOKEN_COST);

    return {
      totalInputTokens: inputTokens,
      totalOutputTokens: outputTokens,
      totalTokens: inputTokens + outputTokens,
      totalCost: totalCost,
      averagePerUser: 0, 
    };
  }

  private async calculateCostBreakdown(aiUsageData: any) {
    // Get costs for users with active subscriptions (paid)
    const paidUsersCost = await this.prisma.aiUsage.aggregate({
      where: {
        user: {
          Subscription: {
            status: 'active'
          }
        }
      },
      _sum: {
        inputTokens: true,
        outputTokens: true,
      }
    });

    const paidCost = this.calculateCostFromTokens(
      paidUsersCost._sum.inputTokens || 0,
      paidUsersCost._sum.outputTokens || 0
    );

    const freeUsersCost = aiUsageData.totalCost - paidCost;

    return {
      total: aiUsageData.totalCost,
      freeUsers: freeUsersCost,
      paidUsers: paidCost,
      averagePerUser: 0,
    };
  }

  private calculateProfitability(revenue: any, costs: any) {
    const monthlyRevenue = revenue.mrr / 100; // Convert cents to dollars
    const totalProfit = monthlyRevenue - costs.total;
    const overallMargin = monthlyRevenue > 0 
      ? (totalProfit / monthlyRevenue) * 100 
      : 0;

    // Free users have negative margin (cost only, no revenue)
    const freeUserMargin = -100;

    // Paid users margin
    const paidUserMargin = monthlyRevenue > 0
      ? ((monthlyRevenue - costs.paidUsers) / monthlyRevenue) * 100
      : 0;

    const roi = costs.total > 0
      ? (totalProfit / costs.total) * 100
      : 0;

    return {
      totalProfit,
      overallMargin,
      freeUserMargin,
      paidUserMargin,
      roi,
    };
  }

  private async calculateEngagement() {
    const [
      totalDesigns,
      totalArtboards
    ] = await Promise.all([
      this.prisma.design.count(),
      this.prisma.artboard.count(),
    ]);

    return {
      totalDesigns,
      totalArtboards,
      averageDesignsPerUser: 0,
      averageArtboardsPerDesign: totalDesigns > 0
        ? totalArtboards / totalDesigns
        : 0,
    };
  }

  private calculateCostFromTokens(input: number, output: number): number {
    return (
      (input * this.INPUT_TOKEN_COST) +
      (output * this.OUTPUT_TOKEN_COST)
    );
  }

  // Legacy Stats Method
  async getStats(): Promise<ResponseModel> {
    try {
      const [totalUsers, activeSubscriptions, totalTokensInput, totalTokensOutput, totalCost] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.subscription.count({ where: { status: 'active' } }),
        this.prisma.aiUsage.aggregate({ _sum: { inputTokens: true } }),
        this.prisma.aiUsage.aggregate({ _sum: { outputTokens: true } }),
        this.prisma.aiUsage.aggregate({ _sum: { cost: true } }),
      ]);

      return successResponse('Admin stats retrieved successfully', {
        totalUsers,
        activeSubscriptions,
        totalTokens: (totalTokensInput._sum.inputTokens || 0) + (totalTokensOutput._sum.outputTokens || 0),
        totalCost: totalCost._sum.cost || 0,
      });
    } catch (error) {
      return processException(error);
    }
  }

  // Legacy Analytics Method
  async getAnalytics(): Promise<ResponseModel> {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Fetch base data
      const [
        totalUsers,
        activeSubscriptionsCount,
        totalDesigns,
        totalArtboards,
        totalMedia,
        totalTokensInput,
        totalTokensOutput,
        totalCost,
        userGrowth,
        revenueTrend,
        aiUsageOverview,
        aiModelDistribution,
        subscriptionBreakdown,
        geoDistribution,
        statusDistribution,
        activeSubscriptionsList // NEW: For MRR calculation
      ] = await Promise.all([
        // Totals
        this.prisma.user.count(),
        this.prisma.subscription.count({ where: { status: 'active' } }),
        this.prisma.design.count(),
        this.prisma.artboard.count(),
        this.prisma.media.count(),
        this.prisma.aiUsage.aggregate({ _sum: { inputTokens: true } }),
        this.prisma.aiUsage.aggregate({ _sum: { outputTokens: true } }),
        this.prisma.aiUsage.aggregate({ _sum: { cost: true } }),

        // Registration Growth
        this.prisma.$queryRaw`
          SELECT DATE_TRUNC('day', "createdAt") as date, COUNT(*)::int as value
          FROM "User"
          WHERE "createdAt" >= ${thirtyDaysAgo}
          GROUP BY 1
          ORDER BY 1 ASC
        ` as Promise<any[]>,

        // Revenue Trend (from credit transactions)
        this.prisma.$queryRaw`
          SELECT DATE_TRUNC('day', "createdAt") as date, SUM("amount")::int as value
          FROM "credit_transactions"
          WHERE "type" = 'purchase' AND "createdAt" >= ${thirtyDaysAgo}
          GROUP BY 1
          ORDER BY 1 ASC
        ` as Promise<any[]>,

        // AI Usage Overview
        this.prisma.aiUsage.groupBy({
          by: ['type'],
          _count: { _all: true },
          _sum: { cost: true, inputTokens: true, outputTokens: true },
        }),

        // AI Model Distribution
        this.prisma.aiUsage.groupBy({
          by: ['modelName'],
          _count: { _all: true },
        }),

        // Subscription Breakdown
        this.prisma.subscription.groupBy({
          by: ['status'],
          _count: { _all: true },
        }),

        // User Geo Distribution
        this.prisma.user.groupBy({
          by: ['country'],
          _count: { _all: true },
          where: { country: { not: null } },
          orderBy: { _count: { country: 'desc' } },
          take: 10
        }),

        // User Role Distribution
        this.prisma.user.groupBy({
          by: ['role'],
          _count: { _all: true },
        }),

        // NEW: Active Subscriptions for Financials
        this.prisma.subscription.findMany({
          where: { status: 'active' },
          select: { productId: true, priceId: true }
        })
      ]);

      // Calculate Advanced Financials
      const revenueData = await this.calculateRevenue(activeSubscriptionsList);
      
      const aiUsageTotal = {
        totalCost: totalCost._sum.cost || 0,
        totalInputTokens: totalTokensInput._sum.inputTokens || 0,
        totalOutputTokens: totalTokensOutput._sum.outputTokens || 0
      };

      const costBreakdown = await this.calculateCostBreakdown(aiUsageTotal);
      const profitability = this.calculateProfitability(revenueData, costBreakdown);

      const formatSQLTrend = (data: any[]) => data.map(item => ({
        date: new Date(item.date).toISOString().split('T')[0],
        value: item.value
      }));

      // Generate Insights
      const insights = [];
      
      // 1. Churn Risk / Payment Failures
      const failedPayments = subscriptionBreakdown.find(s => s.status === 'past_due')?._count._all || 0;
      if (failedPayments > 0) {
        insights.push({
          type: 'alert',
          title: 'Payment Failures',
          message: `${failedPayments} subscriptions are past due.`,
          action: 'Review'
        });
      }

      // 2. Resource Usage
      if (profitability.overallMargin < 0) {
        insights.push({
          type: 'warning',
          title: 'Negative Margin',
          message: 'AI costs exceeding revenue.',
          action: 'Analyze'
        });
      } else if (profitability.overallMargin < 20) {
         insights.push({
          type: 'warning',
          title: 'Low Margin',
          message: `Profit margin is only ${profitability.overallMargin.toFixed(1)}%.`,
          action: 'Optimize'
        });
      }

      // 3. User Growth
      const newUsersThisWeek = userGrowth.slice(-7).reduce((acc, curr) => acc + curr.value, 0);
      if (newUsersThisWeek > 0) {
        insights.push({
           type: 'success',
           title: 'User Growth',
           message: `${newUsersThisWeek} new users this week.`,
           action: 'View'
        });
      }

      return successResponse('Analytics retrieved successfully', {
        summary: {
          totalUsers,
          activeSubscriptions: activeSubscriptionsCount,
          totalDesigns: totalDesigns,
          totalArtboards: totalArtboards,
          totalMedia,
          totalTokens: (totalTokensInput._sum.inputTokens || 0) + (totalTokensOutput._sum.outputTokens || 0),
          totalCost: totalCost._sum.cost || 0,
        },
        financials: {
          mrr: revenueData.mrr,
          arr: revenueData.arr,
          margin: profitability.overallMargin,
          profit: profitability.totalProfit
        },
        insights,
        trends: {
          registrations: formatSQLTrend(userGrowth),
          revenue: formatSQLTrend(revenueTrend),
        },
        distributions: {
          aiUsage: aiUsageOverview.map(u => ({
            type: u.type,
            count: u._count._all,
            cost: u._sum.cost,
            tokens: (u._sum.inputTokens || 0) + (u._sum.outputTokens || 0)
          })),
          aiModels: aiModelDistribution.map(m => ({
            name: m.modelName,
            count: m._count._all
          })),
          subscriptions: subscriptionBreakdown.map(s => ({
            status: s.status,
            count: s._count._all
          })),
          geo: geoDistribution.map(g => ({
            country: g.country,
            count: g._count._all
          })),
          roles: statusDistribution.map(r => ({
            role: r.role,
            count: r._count._all
          }))
        }
      });
    } catch (error) {
      return processException(error);
    }
  }
}
