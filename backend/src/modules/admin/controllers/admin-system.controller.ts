import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { IsAdmin } from 'src/shared/decorators/is-admin.decorator';
import { ResponseModel } from 'src/shared/models/response.model';
import { AdminSystemService } from '../services/admin-system.service';

@Controller('admin/system')
@UseGuards(JwtAuthGuard)
@IsAdmin()
export class AdminSystemController {
  constructor(private readonly systemService: AdminSystemService) {}

  @Get('health')
  async getSystemHealth(): Promise<ResponseModel> {
    return this.systemService.getSystemHealth();
  }
}
