import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { IsAdmin } from 'src/shared/decorators/is-admin.decorator';
import { ResponseModel } from 'src/shared/models/response.model';
import { AdminFinanceService } from '../services/admin-finance.service';

@Controller('admin')
@UseGuards(JwtAuthGuard)
@IsAdmin()
export class AdminFinanceController {
  constructor(private readonly financeService: AdminFinanceService) {}

  @Get('subscriptions')
  async getSubscriptions(@Query() query: any): Promise<ResponseModel> {
    return this.financeService.getSubscriptions(query);
  }

  @Get('revenue/analytics')
  async getRevenueAnalytics(): Promise<ResponseModel> {
    return this.financeService.getRevenueAnalytics();
  }

  @Get('subscriptions/expiring')
  async getExpiringSubscriptions(): Promise<ResponseModel> {
    return this.financeService.getExpiringSubscriptions();
  }
}
