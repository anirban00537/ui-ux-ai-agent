import { Controller, Get, Delete, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { IsAdmin } from 'src/shared/decorators/is-admin.decorator';
import { ResponseModel } from 'src/shared/models/response.model';
import { AdminActivityService } from '../services/admin-activity.service';

@Controller('admin/activities')
@UseGuards(JwtAuthGuard)
@IsAdmin()
export class AdminActivityController {
  constructor(private readonly activityService: AdminActivityService) {}

  @Get()
  async getActivities(@Query() query: any): Promise<ResponseModel> {
    return this.activityService.getSystemActivities(query);
  }

  @Delete()
  async deleteActivities(@Query('level') level: string): Promise<ResponseModel> {
    return this.activityService.deleteLogs(level);
  }
}
