import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { successResponse, processException } from 'src/shared/helpers/functions';
import { ResponseModel } from 'src/shared/models/response.model';

@Injectable()
export class AdminAiService {
  private readonly logger = new Logger(AdminAiService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getAiUsage(query: any): Promise<ResponseModel> {
    try {
      const { page = 1, perPage = 50, type, userId, isSuccess } = query;
      const skip = (page - 1) * perPage;

      const where: any = {};
      if (type) where.type = type;
      if (userId) where.userId = userId;
      if (isSuccess !== undefined) where.isSuccess = isSuccess === 'true';

      const [usage, total] = await Promise.all([
        this.prisma.aiUsage.findMany({
          where,
          skip: Number(skip),
          take: Number(perPage),
          include: {
            user: {
              select: {
                email: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.aiUsage.count({ where }),
      ]);

      return successResponse('AI usage logs retrieved successfully', {
        usage,
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

  async getModelEfficiency(): Promise<ResponseModel> {
    try {
      const stats = await (this.prisma.aiUsage as any).groupBy({
        by: ['modelName'],
        _count: { _all: true },
        _sum: { cost: true, inputTokens: true, outputTokens: true, credits: true },
        _avg: { cost: true, credits: true },
      });

      const failedCounts = await (this.prisma.aiUsage as any).groupBy({
        by: ['modelName'],
        where: { isSuccess: false },
        _count: { _all: true },
      });

      const efficiency = stats.map(s => {
        const failed = failedCounts.find(f => f.modelName === s.modelName)?._count._all || 0;
        return {
          model: s.modelName,
          totalCalls: s._count._all,
          failedCalls: failed,
          failureRate: (failed / s._count._all) * 100,
          totalCost: s._sum.cost,
          avgCost: s._avg.cost,
          totalCredits: s._sum.credits,
          avgCredits: s._avg.credits,
          totalTokens: (s._sum.inputTokens || 0) + (s._sum.outputTokens || 0),
        };
      });

      return successResponse('Model efficiency stats retrieved', efficiency);
    } catch (error) {
      return processException(error);
    }
  }

  async setAiConfig(key: string, value: string): Promise<ResponseModel> {
    try {
      const config = await this.prisma.globalConfig.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
      return successResponse('Configuration updated', config);
    } catch (error) {
      return processException(error);
    }
  }
  async resetAiUsage(): Promise<ResponseModel> {
    try {
      await this.prisma.aiUsage.deleteMany({});
      return successResponse('AI usage logs reset successfully');
    } catch (error) {
      return processException(error);
    }
  }
}
