import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { IsAdmin } from 'src/shared/decorators/is-admin.decorator';
import { ResponseModel } from 'src/shared/models/response.model';
import { AdminAiService } from '../services/admin-ai.service';

@Controller('admin')
@UseGuards(JwtAuthGuard)
@IsAdmin()
export class AdminAiController {
  constructor(private readonly aiService: AdminAiService) {}

  @Get('ai-usage')
  async getAiUsage(@Query() query: any): Promise<ResponseModel> {
    return this.aiService.getAiUsage(query);
  }

  @Get('ai/model-efficiency')
  async getModelEfficiency(): Promise<ResponseModel> {
    return this.aiService.getModelEfficiency();
  }

  @Post('ai/config')
  async setAiConfig(@Body() body: { key: string; value: string }): Promise<ResponseModel> {
    return this.aiService.setAiConfig(body.key, body.value);
  }

  @Post('ai-usage/reset')
  async resetAiUsage(): Promise<ResponseModel> {
    return this.aiService.resetAiUsage();
  }
}
