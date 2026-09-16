import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images.service';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { SearchPhotosDto } from './dto/search-photos.dto';
import { GetPhotoDto } from './dto/get-photo.dto';
import { GetRandomPhotosDto } from './dto/get-random-photos.dto';
import { UploadMediaDto } from './dto/upload-media.dto';
import { ListMediaDto } from './dto/list-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { multerUploadConfig } from 'src/shared/configs/multer-upload.config';

@Controller('images')
@UseGuards(JwtAuthGuard)
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  // Unsplash APIs
  @Get('unsplash-search')
  searchUnsplashPhotos(@Query() searchDto: SearchPhotosDto) {
    return this.imagesService.searchUnsplashPhotos(searchDto);
  }

  @Get('unsplash-simple')
  async searchUnsplashSimple(
    @Query('query') query: string,
    @Query('orientation')
    orientation: 'landscape' | 'portrait' | 'squarish' = 'landscape',
  ) {
    return this.imagesService.searchUnsplashSimple(query, orientation);
  }

  @Get('unsplash-random')
  getRandomUnsplashPhotos(@Query() getRandomDto: GetRandomPhotosDto) {
    return this.imagesService.getRandomUnsplashPhotos(getRandomDto);
  }

  @Get('unsplash/:photoId/get')
  getUnsplashPhoto(@Param('photoId') photoId: string) {
    return this.imagesService.getUnsplashPhoto({ photoId });
  }

  @Post('unsplash/track-download')
  trackUnsplashDownload(@Body() body: { downloadLocation: string }) {
    return this.imagesService.trackUnsplashDownload(body.downloadLocation);
  }

  // Media Management APIs
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerUploadConfig))
  async uploadMedia(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadMediaDto,
    @Request() req: any,
  ) {
    return this.imagesService.uploadMedia(file, uploadDto, req.user.id);
  }

  @Get()
  async listMedia(@Query() listDto: ListMediaDto, @Request() req: any) {
    return this.imagesService.listMedia(listDto, req.user.id);
  }

  @Get(':id')
  async getMedia(@Param('id') id: string, @Request() req: any) {
    return this.imagesService.getMedia(id, req.user.id);
  }

  @Put(':id')
  async updateMedia(
    @Param('id') id: string,
    @Body() updateDto: UpdateMediaDto,
    @Request() req: any,
  ) {
    return this.imagesService.updateMedia(id, updateDto, req.user.id);
  }

  @Delete(':id')
  async deleteMedia(@Param('id') id: string, @Request() req: any) {
    return this.imagesService.deleteMedia(id, req.user.id);
  }
}
