import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { successResponse, processException } from 'src/shared/helpers/functions';
import { ResponseModel } from 'src/shared/models/response.model';

@Injectable()
export class AdminMediaService {
  private readonly logger = new Logger(AdminMediaService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getMedia(query: any): Promise<ResponseModel> {
    try {
      const { page = 1, perPage = 20, search = '', userId, type } = query;
      const skip = (page - 1) * perPage;

      const where: any = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { mimeType: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (userId) where.userId = userId;
      if (type) where.mimeType = { startsWith: type };

      const [media, total, storageStats] = await Promise.all([
        this.prisma.media.findMany({
          where,
          skip: Number(skip),
          take: Number(perPage),
          include: {
            user: { select: { email: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.media.count({ where }),
        this.prisma.media.aggregate({
          _sum: { size: true }
        })
      ]);

      return successResponse('Media retrieved successfully', {
        media,
        pagination: {
          page: Number(page),
          perPage: Number(perPage),
          total,
          totalPages: Math.ceil(total / perPage),
          totalSize: storageStats._sum.size || 0
        },
      });
    } catch (error) {
      return processException(error);
    }
  }

  async deleteMedia(id: string): Promise<ResponseModel> {
    try {
      await this.prisma.media.delete({ where: { id } });
      return successResponse('Media deleted successfully');
    } catch (error) {
      return processException(error);
    }
  }
}
