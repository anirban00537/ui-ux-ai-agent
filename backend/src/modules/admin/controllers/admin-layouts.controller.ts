import {
  Controller,
  Get,
  Delete,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { IsAdmin } from 'src/shared/decorators/is-admin.decorator';
import { ResponseModel } from 'src/shared/models/response.model';
import { AdminLayoutsService } from '../services/admin-layouts.service';

@Controller('admin/layouts')
@UseGuards(JwtAuthGuard)
@IsAdmin()
export class AdminLayoutsController {
  constructor(private readonly layoutsService: AdminLayoutsService) {}

  @Get()
  async getLayouts(): Promise<ResponseModel> {
    return this.layoutsService.getLayouts();
  }

  @Get(':id')
  async getLayout(@Param('id') id: string): Promise<ResponseModel> {
    return this.layoutsService.getLayout(id);
  }

  @Patch(':id')
  async updateLayout(
    @Param('id') id: string,
    @Body() updateData: {
      name?: string;
      description?: string;
      tags?: string[];
      thumbnail?: string;
      published?: boolean;
      data?: any;
    },
  ): Promise<ResponseModel> {
    return this.layoutsService.updateLayout(id, updateData);
  }

  @Delete(':id')
  async deleteLayout(@Param('id') id: string): Promise<ResponseModel> {
    return this.layoutsService.deleteLayout(id);
  }
}
