import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Delete,
  Param,
} from '@nestjs/common';
import { LayoutsService } from './layouts.service';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { UserInfo } from 'src/shared/decorators/user.decorators';
import { User } from '@prisma/client';
import { CreateLayoutDto } from './dto/create-layout.dto';
import { UpdateLayoutDto } from './dto/update-layout.dto';

@Controller('layouts')
@UseGuards(JwtAuthGuard)
export class LayoutsController {
  constructor(private readonly layoutsService: LayoutsService) {}

  @Post('create')
  create(@UserInfo() user: User, @Body() createLayoutDto: CreateLayoutDto) {
    return this.layoutsService.create(user.id, createLayoutDto);
  }

  @Get('list')
  findAll(@UserInfo() user: User) {
    return this.layoutsService.findAll(user.id);
  }

  @Get('admin-list')
  findAdminLayouts() {
    return this.layoutsService.findAdminLayouts();
  }

  @Get(':id/get')
  findOne(@Param('id') id: string) {
    return this.layoutsService.findOne(id);
  }

  @Post(':id/update')
  update(
    @Param('id') id: string,
    @UserInfo() user: User,
    @Body() updateLayoutDto: UpdateLayoutDto,
  ) {
    return this.layoutsService.update(id, user.id, updateLayoutDto);
  }

  @Delete(':id/delete')
  remove(@Param('id') id: string, @UserInfo() user: User) {
    return this.layoutsService.remove(id, user.id);
  }
}
