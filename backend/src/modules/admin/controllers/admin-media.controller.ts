import { Controller, Get, Delete, Query, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { IsAdmin } from 'src/shared/decorators/is-admin.decorator';
import { ResponseModel } from 'src/shared/models/response.model';
import { AdminMediaService } from '../services/admin-media.service';

@Controller('admin/media')
@UseGuards(JwtAuthGuard)
@IsAdmin()
export class AdminMediaController {
  constructor(private readonly mediaService: AdminMediaService) {}

  @Get()
  async getMedia(@Query() query: any): Promise<ResponseModel> {
    return this.mediaService.getMedia(query);
  }

  @Delete(':id')
  async deleteMedia(@Param('id') id: string): Promise<ResponseModel> {
    return this.mediaService.deleteMedia(id);
  }
}
