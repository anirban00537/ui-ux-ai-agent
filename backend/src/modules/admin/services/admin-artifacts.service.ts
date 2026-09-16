import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { successResponse, processException } from 'src/shared/helpers/functions';
import { ResponseModel } from 'src/shared/models/response.model';

@Injectable()
export class AdminArtifactsService {
  private readonly logger = new Logger(AdminArtifactsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getDesigns(query: any): Promise<ResponseModel> {
    try {
      const { page = 1, perPage = 20, search = '', userId } = query;
      const skip = (page - 1) * perPage;

      // 1. Calculate system-wide stats first (Total Tokens, Total Cost, Total Artboards)
      // We do this independently of pagination/search to provide global context
      const [usageStats, totalArtboards] = await Promise.all([
        (this.prisma.aiUsage as any).aggregate({
          where: {
            // If filtering by user, show their totals. Otherwise show platform totals.
            ...(userId ? { userId } : { docId: { not: null } }),
          },
          _sum: {
            inputTokens: true,
            outputTokens: true,
            cost: true,
            credits: true,
          }
        }),
        this.prisma.artboard.count({
          where: userId ? { design: { userId } } : {}
        })
      ]);

      const systemStats = {
        totalTokens: ((usageStats as any)._sum.inputTokens || 0) + ((usageStats as any)._sum.outputTokens || 0),
        totalCost: (usageStats as any)._sum.cost || 0,
        totalCredits: (usageStats as any)._sum.credits || 0,
        totalArtboards: totalArtboards || 0,
      };

      // 2. Fetch designs with pagination
      const where: any = {};
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (userId) where.userId = userId;

      const [designs, total] = await Promise.all([
        this.prisma.design.findMany({
          where,
          skip: Number(skip),
          take: Number(perPage),
          include: {
            user: { select: { email: true, name: true, user_name: true } },
            _count: { select: { artboards: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.design.count({ where }),
      ]);

      // 3. Enrich designs with AI usage data
      const designsWithUsage = await Promise.all(
        designs.map(async (design) => {
          const aiUsages = await this.prisma.aiUsage.findMany({
            where: {
              docId: design.id,
            },
            select: {
              inputTokens: true,
              outputTokens: true,
              cost: true,
              credits: true,
            },
          } as any);

          const totalTokens = aiUsages.reduce(
            (sum, usage) => sum + usage.inputTokens + usage.outputTokens,
            0,
          );
          const totalCost = aiUsages.reduce((sum, usage) => sum + usage.cost, 0);
          const totalCredits = (aiUsages as any[]).reduce((sum, usage) => sum + (usage.credits || 0), 0);

          return {
            ...design,
            aiUsage: {
              totalTokens,
              totalCost,
              totalCredits,
            },
          };
        }),
      );

      this.logger.log(`[GET_DESIGNS] Stats: ${JSON.stringify(systemStats)}`);

      return successResponse('Designs retrieved successfully', {
        designs: designsWithUsage,
        stats: systemStats,
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

  async deleteDesign(id: string): Promise<ResponseModel> {
    try {
      await this.prisma.design.delete({ where: { id } });
      return successResponse('Design deleted successfully');
    } catch (error) {
      return processException(error);
    }
  }
}
