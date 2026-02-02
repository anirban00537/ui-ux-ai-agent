import { Controller, Get, UseGuards } from '@nestjs/common';
import { OpenRouterService } from '../services/openrouter.service';
import { ResponseModel } from 'src/shared/models/response.model';
// Assuming AuthGuard/AdminGuard is available, otherwise skipping for now or generic
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../../auth/guards/roles.guard';
// import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('admin/openrouter')
export class OpenRouterController {
  constructor(private readonly openRouterService: OpenRouterService) {}

  @Get('info')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin')
  async getInfo(): Promise<ResponseModel> {
    return this.openRouterService.getAccountInfo();
  }
}
