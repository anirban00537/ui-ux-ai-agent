import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { IsAdmin } from 'src/shared/decorators/is-admin.decorator';
import { ResponseModel } from 'src/shared/models/response.model';
import { AdminAnalyticsService } from '../services/admin-analytics.service';

@Controller('admin')
@UseGuards(JwtAuthGuard)
@IsAdmin()
export class AdminAnalyticsController {
  constructor(private readonly analyticsService: AdminAnalyticsService) {}

  @Get('stats')
  async getStats(): Promise<ResponseModel> {
    return this.analyticsService.getStats();
  }

  @Get('analytics')
  async getAnalytics(): Promise<ResponseModel> {
    return this.analyticsService.getAnalytics();
  }
}
