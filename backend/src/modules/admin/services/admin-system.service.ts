import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { successResponse, processException } from 'src/shared/helpers/functions';
import { ResponseModel } from 'src/shared/models/response.model';

@Injectable()
export class AdminSystemService {
  private readonly logger = new Logger(AdminSystemService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getSystemHealth(): Promise<ResponseModel> {
    try {
      const dbStatus = await this.prisma.$queryRaw`SELECT 1`.then(() => 'UP').catch(() => 'DOWN');
      return successResponse('System health retrieved', {
        database: dbStatus,
        version: '1.0.0',
        timestamp: new Date(),
      });
    } catch (error) {
      return processException(error);
    }
  }
}
