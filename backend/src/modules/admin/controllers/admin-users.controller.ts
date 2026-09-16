import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { IsAdmin } from 'src/shared/decorators/is-admin.decorator';
import { ResponseModel } from 'src/shared/models/response.model';
import { AdminUsersService } from '../services/admin-users.service';
import { AdminAnalyticsService } from '../services/admin-analytics.service';

@Controller('admin/users')
@UseGuards(JwtAuthGuard)
@IsAdmin()
export class AdminUsersController {
  constructor(
    private readonly usersService: AdminUsersService,
    private readonly adminAnalyticsService: AdminAnalyticsService,
  ) {}

  @Get('analytics')
  async getUserAnalytics(): Promise<ResponseModel> {
    return this.adminAnalyticsService.getUserAnalytics();
  }

  @Get()
  async getUsers(@Query() query: any): Promise<ResponseModel> {
    return this.usersService.getUsers(query);
  }

  @Get(':id/activity')
  async getUserActivity(@Param('id') userId: string): Promise<ResponseModel> {
    return this.usersService.getUserActivity(userId);
  }

  @Post(':id/adjust-credits')
  async adjustCredits(
    @Param('id') userId: string,
    @Body() body: { amount: number; type: string; description: string },
  ): Promise<ResponseModel> {
    return this.usersService.adjustUserCredits(userId, body.amount, body.type, body.description);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') userId: string,
    @Body('status') status: number,
  ): Promise<ResponseModel> {
    return this.usersService.updateUserStatus(userId, status);
  }
}
