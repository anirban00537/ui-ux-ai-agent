import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ThemesService } from './themes.service';
import { UserInfo } from 'src/shared/decorators/user.decorators';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';

@Controller('themes')
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  // Public endpoint for admin themes (no auth required)
  @Get('public/admin/list')
  findPublicAdminThemes(@Query() query: any) {
    return this.themesService.findAdminThemes(query);
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  create(@UserInfo() user: User, @Body() createThemeDto: CreateThemeDto) {
    return this.themesService.create(user, createThemeDto);
  }

  @Get('list')
  @UseGuards(JwtAuthGuard)
  findAll(@UserInfo() user: User, @Query() query: any) {
    return this.themesService.findAll(user, query);
  }

  @Get('admin/list')
  @UseGuards(JwtAuthGuard)
  findAdminThemes(@Query() query: any) {
    return this.themesService.findAdminThemes(query);
  }

  @Get(':id/get')
  findOne(@Param('id') id: string, @UserInfo() user: User) {
    return this.themesService.findOne(id, user);
  }

  @Patch(':id/update')
  update(
    @Param('id') id: string,
    @UserInfo() user: User,
    @Body() updateThemeDto: UpdateThemeDto,
  ) {
    return this.themesService.update(id, user, updateThemeDto);
  }

  @Delete(':id/delete')
  remove(@Param('id') id: string, @UserInfo() user: User) {
    return this.themesService.remove(id, user);
  }
}

