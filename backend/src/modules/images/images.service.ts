import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createApi } from 'unsplash-js';
import {
  successResponse,
  errorResponse,
  processException,
} from 'src/shared/helpers/functions';
import { ResponseModel } from 'src/shared/models/response.model';
import { PrismaService } from '../prisma/prisma.service';
import { SearchPhotosDto } from './dto/search-photos.dto';
import { GetPhotoDto } from './dto/get-photo.dto';
import { GetRandomPhotosDto } from './dto/get-random-photos.dto';
import { UploadMediaDto } from './dto/upload-media.dto';
import { ListMediaDto } from './dto/list-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import {
  uploadFile,
  deleteFileFromS3,
} from 'src/shared/configs/multer-upload.config';
import { coreConstant } from 'src/shared/helpers/coreConstant';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class ImagesService {
  private unsplash;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly subscriptionService: SubscriptionService,
  ) {
    const accessKey = this.configService.get<string>('UNSPLASH_ACCESS_KEY');

    if (!accessKey) {
      console.warn(
        'UNSPLASH_ACCESS_KEY is not set. Unsplash API will not work.',
      );
    }

    this.unsplash = createApi({
      accessKey: accessKey || '',
    });
  }

  async searchUnsplashPhotos(
    searchDto: SearchPhotosDto,
  ): Promise<ResponseModel> {
    try {
      const {
        query,
        page = 1,
        perPage = 10,
        orientation,
        color,
        orderBy,
      } = searchDto;

      const result = await this.unsplash.search.getPhotos({
        query,
        page,
        perPage,
        orientation,
        color,
        orderBy: orderBy || 'relevant',
      });

      if (result.errors) {
        return errorResponse(result.errors[0] || 'Failed to search photos');
      }

      const { total, results } = result.response;

      // Transform the response to include optimized image URLs
      const transformedResults = results.map((photo) => ({
        id: photo.id,
        width: photo.width,
        height: photo.height,
        color: photo.color,
        description: photo.description,
        altDescription: photo.alt_description,
        urls: {
          raw: photo.urls.raw,
          full: photo.urls.full,
          regular: photo.urls.regular,
          small: photo.urls.small,
          thumb: photo.urls.thumb,
          // Add optimized URL with parameters
          optimized: `${photo.urls.raw}?auto=format&fit=crop&w=1200&q=80`,
        },
        links: {
          self: photo.links.self,
          html: photo.links.html,
          download: photo.links.download,
          downloadLocation: photo.links.download_location,
        },
        user: {
          id: photo.user.id,
          username: photo.user.username,
          name: photo.user.name,
          profileImage: photo.user.profile_image,
        },
        createdAt: photo.created_at,
        likes: photo.likes,
      }));

      return successResponse('Photos retrieved successfully', {
        total,
        results: transformedResults,
        page,
        perPage,
      });
    } catch (error) {
      processException(error);
    }
  }

  /**
   * Professional Unsplash search with randomization and fallback
   * Used for AI-powered image discovery during card generation
   * 
   * @param query - The search term
   * @param orientation - Image orientation preference
   * @param excludeUrls - URLs to exclude (prevents duplicates across cards)
   */
  async searchUnsplashSimple(
    query: string,
    orientation: 'landscape' | 'portrait' | 'squarish' = 'landscape',
    excludeUrls: string[] = [],
  ): Promise<string> {
    // Professional fallback images by category
    const fallbackImages = {
      landscape: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=80',
      portrait: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      squarish: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=1000&q=80',
    };

    try {
      if (!query || query.trim() === '') {
        console.warn('Empty query provided to searchUnsplashSimple, returning fallback');
        return fallbackImages[orientation];
      }

      // Fetch multiple results for variety
      const result = await this.unsplash.search.getPhotos({
        query: query.trim(),
        page: 1,
        perPage: 10, // 10 provides good variety without large payload
        orientation,
        orderBy: 'relevant',
      });

      if (result.errors) {
        console.warn(`Unsplash API error for query "${query}":`, result.errors);
        return fallbackImages[orientation];
      }

      const { total, results } = result.response || { total: 0, results: [] };
      
      console.log(`[Unsplash] Query "${query}" returned ${total} total results, fetched ${results.length}`);

      if (!results || results.length === 0) {
        console.warn(`No Unsplash results for query: "${query}", using fallback`);
        return fallbackImages[orientation];
      }

      // Filter out already-used URLs to prevent duplicates
      const availablePhotos = results.filter(photo => {
        const url = `${photo.urls.raw}?auto=format&fit=crop&w=1200&q=80`;
        return !excludeUrls.includes(url);
      });

      // If all photos are excluded, pick from all results anyway
      const photosToPickFrom = availablePhotos.length > 0 ? availablePhotos : results;

      // Pick a random photo from available results
      const randomIndex = Math.floor(Math.random() * photosToPickFrom.length);
      const photo = photosToPickFrom[randomIndex];

      // Return optimized URL with good quality for docs
      return `${photo.urls.raw}?auto=format&fit=crop&w=1200&q=80`;
    } catch (error) {
      console.error(`Unsplash search error for "${query}":`, error);
      return fallbackImages[orientation];
    }
  }

  async getUnsplashPhoto(getPhotoDto: GetPhotoDto): Promise<ResponseModel> {
    try {
      const { photoId } = getPhotoDto;

      const result = await this.unsplash.photos.get({ photoId });

      if (result.errors) {
        return errorResponse(result.errors[0] || 'Failed to get photo');
      }

      const photo = result.response;

      // Transform the response
      const transformedPhoto = {
        id: photo.id,
        width: photo.width,
        height: photo.height,
        color: photo.color,
        description: photo.description,
        altDescription: photo.alt_description,
        urls: {
          raw: photo.urls.raw,
          full: photo.urls.full,
          regular: photo.urls.regular,
          small: photo.urls.small,
          thumb: photo.urls.thumb,
          optimized: `${photo.urls.raw}?auto=format&fit=crop&w=1200&q=80`,
        },
        links: {
          self: photo.links.self,
          html: photo.links.html,
          download: photo.links.download,
          downloadLocation: photo.links.download_location,
        },
        user: {
          id: photo.user.id,
          username: photo.user.username,
          name: photo.user.name,
          profileImage: photo.user.profile_image,
        },
        createdAt: photo.created_at,
        likes: photo.likes,
      };

      return successResponse('Photo retrieved successfully', transformedPhoto);
    } catch (error) {
      processException(error);
    }
  }

  async getRandomUnsplashPhotos(
    getRandomDto: GetRandomPhotosDto,
  ): Promise<ResponseModel> {
    try {
      const {
        query,
        username,
        featured,
        collectionIds,
        topicIds,
        count = 1,
      } = getRandomDto;

      const result = await this.unsplash.photos.getRandom({
        query,
        username,
        featured,
        collectionIds,
        topicIds,
        count: count > 1 ? count : undefined,
      });

      if (result.errors) {
        return errorResponse(result.errors[0] || 'Failed to get random photos');
      }

      const photos = Array.isArray(result.response)
        ? result.response
        : [result.response];

      // Transform the response
      const transformedPhotos = photos.map((photo) => ({
        id: photo.id,
        width: photo.width,
        height: photo.height,
        color: photo.color,
        description: photo.description,
        altDescription: photo.alt_description,
        urls: {
          raw: photo.urls.raw,
          full: photo.urls.full,
          regular: photo.urls.regular,
          small: photo.urls.small,
          thumb: photo.urls.thumb,
          optimized: `${photo.urls.raw}?auto=format&fit=crop&w=1200&q=80`,
        },
        links: {
          self: photo.links.self,
          html: photo.links.html,
          download: photo.links.download,
          downloadLocation: photo.links.download_location,
        },
        user: {
          id: photo.user.id,
          username: photo.user.username,
          name: photo.user.name,
          profileImage: photo.user.profile_image,
        },
        createdAt: photo.created_at,
        likes: photo.likes,
      }));

      return successResponse(
        'Random photos retrieved successfully',
        count === 1 ? transformedPhotos[0] : transformedPhotos,
      );
    } catch (error) {
      processException(error);
    }
  }

  async trackUnsplashDownload(
    downloadLocation: string,
  ): Promise<ResponseModel> {
    try {
      const result = await this.unsplash.photos.trackDownload({
        downloadLocation,
      });

      if (result.errors) {
        return errorResponse(result.errors[0] || 'Failed to track download');
      }

      return successResponse('Download tracked successfully', result.response);
    } catch (error) {
      processException(error);
    }
  }

  // Media Management Methods
  async uploadMedia(
    file: Express.Multer.File,
    uploadDto: UploadMediaDto,
    userId: string,
  ): Promise<ResponseModel> {
    try {
      // 1. Check User Role & Subscription
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
      }

      // If NOT Admin, enforce subscription check
      if (user.role !== coreConstant.USER_ROLE_ADMIN) {
        // Check storage limit
        const storageLimit = await this.subscriptionService.getStorageLimit(userId);
        const currentUsage = await this.subscriptionService.getStorageUsage(userId);
        const fileSizeGB = file.size / (1024 * 1024 * 1024);

        if (currentUsage + fileSizeGB > storageLimit) {
          throw new HttpException(
            `Storage limit exceeded. You have ${storageLimit.toFixed(2)} GB storage. Current usage: ${currentUsage.toFixed(2)} GB. This file would exceed your limit.`,
            HttpStatus.FORBIDDEN,
          );
        }
      }

      if (!file) {
        return errorResponse('No file provided');
      }

      // Upload file to B2
      const fileUrl = await uploadFile(file, userId);
      if (!fileUrl) {
        return errorResponse('Failed to upload file');
      }

      // Get image dimensions if it's an image (optional)
      let width: number | undefined;
      let height: number | undefined;
      // Note: To get image dimensions, you can install 'image-size' package
      // and uncomment the following code:
      // if (file.mimetype.startsWith('image/')) {
      //   try {
      //     const sizeOf = require('image-size');
      //     const dimensions = sizeOf(file.buffer);
      //     width = dimensions.width;
      //     height = dimensions.height;
      //   } catch (error) {
      //     console.warn('Failed to get image dimensions:', error);
      //   }
      // }

      // Create media record in database
      const media = await this.prisma.media.create({
        data: {
          userId,
          name: uploadDto.name || file.originalname,
          imageUrl: fileUrl,
          mimeType: file.mimetype,
          size: file.size,
          width,
          height,
          tags: uploadDto.tags || [],
        },
      });

      return successResponse('Media uploaded successfully', media);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error uploading media:', error);
      return errorResponse('Failed to upload media');
    }
  }

  async listMedia(
    listDto: ListMediaDto,
    userId: string,
  ): Promise<ResponseModel> {
    try {
      const {
        page = 1,
        perPage = 20,
        search,
        category = 'all',
        mimeType,
      } = listDto;

      const skip = (page - 1) * perPage;

      // Build where clause
      const where: any = {
        userId,
        deletedAt: null,
      };

      // Search filter
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { tags: { hasSome: [search] } },
        ];
      }

      // Category filter
      if (category === 'favorites') {
        where.isFavorite = true;
      }

      // Mime type filter
      if (mimeType) {
        where.mimeType = mimeType;
      }

      // Get total count
      const total = await this.prisma.media.count({ where });

      // Get media items
      const media = await this.prisma.media.findMany({
        where,
        skip,
        take: perPage,
        orderBy:
          category === 'recent' ? { createdAt: 'desc' } : { createdAt: 'desc' },
      });

      return successResponse('Media retrieved successfully', {
        list: media,
        pagination: {
          page,
          perPage,
          total,
          totalPages: Math.ceil(total / perPage),
        },
      });
    } catch (error) {
      console.error('Error listing media:', error);
      return errorResponse('Failed to retrieve media');
    }
  }

  async getMedia(id: string, userId: string): Promise<ResponseModel> {
    try {
      const media = await this.prisma.media.findFirst({
        where: {
          id,
          userId,
          deletedAt: null,
        },
      });

      if (!media) {
        return errorResponse('Media not found');
      }

      return successResponse('Media retrieved successfully', media);
    } catch (error) {
      console.error('Error getting media:', error);
      return errorResponse('Failed to retrieve media');
    }
  }

  async updateMedia(
    id: string,
    updateDto: UpdateMediaDto,
    userId: string,
  ): Promise<ResponseModel> {
    try {
      // Check if media exists and belongs to user
      const existingMedia = await this.prisma.media.findFirst({
        where: {
          id,
          userId,
          deletedAt: null,
        },
      });

      if (!existingMedia) {
        return errorResponse('Media not found');
      }

      // Update media
      const media = await this.prisma.media.update({
        where: { id },
        data: {
          ...(updateDto.name && { name: updateDto.name }),
          ...(updateDto.tags && { tags: updateDto.tags }),
          ...(updateDto.isFavorite !== undefined && {
            isFavorite: updateDto.isFavorite,
          }),
        },
      });

      return successResponse('Media updated successfully', media);
    } catch (error) {
      console.error('Error updating media:', error);
      return errorResponse('Failed to update media');
    }
  }

  async deleteMedia(id: string, userId: string): Promise<ResponseModel> {
    try {
      // Check if media exists and belongs to user
      const existingMedia = await this.prisma.media.findFirst({
        where: {
          id,
          userId,
          deletedAt: null,
        },
      });

      if (!existingMedia) {
        return errorResponse('Media not found');
      }

      // Delete file from B2
      try {
        await deleteFileFromS3(existingMedia.imageUrl);
      } catch (error) {
        console.error('Error deleting file from B2:', error);
        // Continue with database deletion even if B2 deletion fails
      }

      // Soft delete media (set deletedAt)
      await this.prisma.media.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });

      return successResponse('Media deleted successfully');
    } catch (error) {
      console.error('Error deleting media:', error);
      return errorResponse('Failed to delete media');
    }
  }
}
