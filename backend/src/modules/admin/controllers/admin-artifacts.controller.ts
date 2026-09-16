import { Controller, Get, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { IsAdmin } from 'src/shared/decorators/is-admin.decorator';
import { ResponseModel } from 'src/shared/models/response.model';
import { AdminArtifactsService } from '../services/admin-artifacts.service';

@Controller('admin')
@UseGuards(JwtAuthGuard)
@IsAdmin()
export class AdminArtifactsController {
  constructor(private readonly artifactsService: AdminArtifactsService) {}

  @Get('designs')
  async getDesigns(@Query() query: any): Promise<ResponseModel> {
    console.log('[ArtifactsController] GET /designs called');
    return this.artifactsService.getDesigns(query);
  }

  @Delete('designs/:id')
  async deleteDesign(@Param('id') id: string): Promise<ResponseModel> {
    return this.artifactsService.deleteDesign(id);
  }
}
