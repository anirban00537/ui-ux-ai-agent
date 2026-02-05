import {
  Controller,
  Get,
  Param,
  Delete,
  Query,
  Post,
  Body,
  Sse,
  Patch,
} from '@nestjs/common';
import { DesignsChatService } from './designs-chat.service';
import { DesignsService } from './designs.service';
import { UserInfo } from 'src/shared/decorators/user.decorators';
import { User } from '@prisma/client';
import { ResponseModel } from 'src/shared/models/response.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Public } from 'src/shared/decorators/public.decorator';

@Controller('designs')
export class DesignsController {
  constructor(
    private readonly designsChatService: DesignsChatService,
    private readonly designsService: DesignsService,
  ) {}

  @Get()
  async getAllDesigns(
    @UserInfo() user: User,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('sortBy') sortBy = 'createdAt',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<ResponseModel> {
    return this.designsService.getAllDesigns(user.id, {
      page: Number(page),
      pageSize: Number(pageSize),
      orderBy: { [sortBy]: sortOrder },
    });
  }

  @Get(':id')
  async getDesignById(
    @Param('id') id: string,
    @UserInfo() user: User,
  ): Promise<ResponseModel> {
    return this.designsService.getDesignById(id, user.id);
  }

  @Get(':id/messages')
  async getDesignMessages(
    @Param('id') id: string,
    @UserInfo() user: User,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('sortBy') sortBy = 'createdAt',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<ResponseModel> {
    return this.designsService.getDesignMessages(id, user.id, {
      page: Number(page),
      pageSize: Number(pageSize),
      orderBy: { [sortBy]: sortOrder },
    });
  }

  @Public()
  @Get('public/:id')
  async getPublicDesignById(
    @Param('id') id: string,
  ): Promise<ResponseModel> {
    return this.designsService.getPublicDesignById(id);
  }

  @Post('conversations')
  async createDesignConversation(
    @Body() body: { title: string; type?: string },
    @UserInfo() user: User,
  ): Promise<ResponseModel> {
    return this.designsService.createDesignConversation(body.title, user.id, body.type);
  }

  @Patch('artboards/:id')
  async updateArtboard(
    @Param('id') id: string,
    @Body() body: { x?: number; y?: number; width?: number; height?: number },
    @UserInfo() user: User,
  ): Promise<ResponseModel> {
    return this.designsService.updateArtboard(id, user.id, body);
  }

  @Delete('artboards/:id')
  async deleteArtboard(
    @Param('id') id: string,
    @UserInfo() user: User,
  ): Promise<ResponseModel> {
    return this.designsService.deleteArtboard(id, user.id);
  }

  @Patch(':id')
  async updateDesign(
    @Param('id') id: string,
    @Body() body: { title?: string; colorPalette?: Record<string, string>; isPublic?: boolean },
    @UserInfo() user: User,
  ): Promise<ResponseModel> {
    return this.designsService.updateDesign(id, user.id, body);
  }

  @Delete(':id')
  async deleteDesign(
    @Param('id') id: string,
    @UserInfo() user: User,
  ): Promise<ResponseModel> {
    return this.designsService.deleteDesign(id, user.id);
  }

  @Sse('chat/stream/:designId')
  async chatStream(
    @Param('designId') designId: string,
    @Query('prompt') prompt: string,
    @UserInfo() user: User,
  ): Promise<Observable<any>> {
    const source$ = await this.designsChatService.chatStream(
      prompt,
      user.id,
      designId,
    );
    return source$.pipe(map((update: any) => ({ data: update })));
  }
  @Sse('chat/stream-update/:designId')
  async chatStreamUpdate(
    @Param('designId') designId: string,
    @Query('prompt') prompt: string,
    @Query('artboardId') artboardId: string,
    @UserInfo() user: User,
  ): Promise<Observable<any>> {
    const source$ = await this.designsChatService.chatStreamUpdateArtboard(
      prompt,
      user.id,
      designId,
      artboardId,
    );
    return source$.pipe(map((update: any) => ({ data: update })));
  }
}
