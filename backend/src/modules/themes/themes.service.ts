import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import {
  successResponse,
  errorResponse,
  paginatioOptions,
  paginationMetaData,
  processException,
} from 'src/shared/helpers/functions';
import { ResponseModel } from 'src/shared/models/response.model';
import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';

@Injectable()
export class ThemesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: User, payload: CreateThemeDto): Promise<ResponseModel> {
    try {
      // Only admins can create admin themes
      if (payload.isAdmin && user.role !== 1) {
        throw new ForbiddenException('Only admins can create official themes');
      }

      const theme = await this.prisma.theme.create({
        data: {
          name: payload.name,
          description: payload.description,
          themeData: payload.themeData as any, // Store as JSON
          userId: payload.isAdmin ? null : user.id,
          isAdmin: payload.isAdmin || false,
        },
      });

      // Transform response to include individual fields for backward compatibility
      const response = this.transformThemeResponse(theme);

      return successResponse('Theme created successfully', response);
    } catch (error) {
      processException(error);
    }
  }

  async findAll(user: User, query: any): Promise<ResponseModel> {
    try {
      const { includeAdmin, includeUser, page, limit } = query;

      // If no pagination params provided, return all items
      // Check if page or limit are explicitly provided (not undefined/null/empty)
      const shouldPaginate =
        (page !== undefined && page !== null && page !== '') ||
        (limit !== undefined && limit !== null && limit !== '');
      const paginate = shouldPaginate ? await paginatioOptions(query) : {};

      const where: any = {
        deletedAt: null,
      };

      // If user is not admin, only show admin themes and their own themes
      if (user.role !== 1) {
        where.OR = [{ isAdmin: true }, { userId: user.id }];
      }

      // Filter by theme type if specified
      if (includeAdmin === 'false') {
        where.isAdmin = false;
      }
      if (includeUser === 'false') {
        where.isAdmin = true;
      }

      const themes = await this.prisma.theme.findMany({
        where,
        ...paginate,
        orderBy: [
          { isAdmin: 'asc' }, // User themes first (false comes before true)
          { usageCount: 'desc' }, // Then by usage
          { createdAt: 'desc' },
        ],
      });

      const total = await this.prisma.theme.count({ where });

      // Transform themes to include individual fields for backward compatibility
      const transformedThemes = themes.map((theme) =>
        this.transformThemeResponse(theme),
      );

      // Only include pagination meta if pagination was requested
      const data: any = {
        list: transformedThemes,
      };

      if (shouldPaginate) {
        const paginationMeta = await paginationMetaData('theme', query);
        data.meta = paginationMeta;
      } else {
        // Return simple meta when no pagination
        data.meta = {
          total,
          lastPage: 1,
          currentPage: 1,
          perPage: total,
          prev: null,
          next: null,
        };
      }

      return successResponse('Themes retrieved successfully', data);
    } catch (error) {
      processException(error);
    }
  }

  async findAdminThemes(query: any): Promise<ResponseModel> {
    try {
      const { page, limit } = query;

      // If no pagination params provided, return all items
      // Check if page or limit are explicitly provided (not undefined/null/empty)
      const shouldPaginate =
        (page !== undefined && page !== null && page !== '') ||
        (limit !== undefined && limit !== null && limit !== '');
      const paginate = shouldPaginate ? await paginatioOptions(query) : {};

      const where = {
        deletedAt: null,
        isAdmin: true,
      };

      const themes = await this.prisma.theme.findMany({
        where,
        ...paginate,
        orderBy: [
          { usageCount: 'desc' }, // Sort by usage
          { createdAt: 'desc' },
        ],
      });

      const total = await this.prisma.theme.count({ where });

      // Transform themes to include individual fields for backward compatibility
      const transformedThemes = themes.map((theme) =>
        this.transformThemeResponse(theme),
      );

      // Only include pagination meta if pagination was requested
      const data: any = {
        list: transformedThemes,
      };

      if (shouldPaginate) {
        const paginationMeta = await paginationMetaData('theme', query);
        data.meta = paginationMeta;
      } else {
        // Return simple meta when no pagination
        data.meta = {
          total,
          lastPage: 1,
          currentPage: 1,
          perPage: total,
          prev: null,
          next: null,
        };
      }

      return successResponse('Admin themes retrieved successfully', data);
    } catch (error) {
      processException(error);
    }
  }

  async findOne(id: string, user: User): Promise<ResponseModel> {
    try {
      const theme = await this.prisma.theme.findFirst({
        where: {
          id,
          deletedAt: null,
          OR: [
            { isAdmin: true }, // Admin themes are visible to all
            { userId: user.id }, // User's own themes
          ],
        },
      });

      if (!theme) {
        throw new NotFoundException('Theme not found');
      }

      // Transform response to include individual fields for backward compatibility
      const response = this.transformThemeResponse(theme);

      return successResponse('Theme retrieved successfully', response);
    } catch (error) {
      processException(error);
    }
  }

  async update(
    id: string,
    user: User,
    payload: UpdateThemeDto,
  ): Promise<ResponseModel> {
    try {
      const theme = await this.prisma.theme.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!theme) {
        throw new NotFoundException('Theme not found');
      }

      // Only admins can update admin themes, users can only update their own themes
      if (theme.isAdmin && user.role !== 1) {
        throw new ForbiddenException('Only admins can update official themes');
      }

      if (!theme.isAdmin && theme.userId !== user.id) {
        throw new ForbiddenException('You can only update your own themes');
      }

      // Prepare update data
      const updateData: any = {};
      if (payload.name !== undefined) updateData.name = payload.name;
      if (payload.description !== undefined)
        updateData.description = payload.description;
      if (payload.themeData !== undefined) {
        // If themeData is provided, merge with existing themeData
        const existingThemeData = (theme.themeData as any) || {};
        updateData.themeData = {
          ...existingThemeData,
          ...payload.themeData,
        };
      }

      const updatedTheme = await this.prisma.theme.update({
        where: { id },
        data: updateData,
      });

      // Transform response to include individual fields for backward compatibility
      const response = this.transformThemeResponse(updatedTheme);

      return successResponse('Theme updated successfully', response);
    } catch (error) {
      processException(error);
    }
  }

  async remove(id: string, user: User): Promise<ResponseModel> {
    try {
      const theme = await this.prisma.theme.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!theme) {
        throw new NotFoundException('Theme not found');
      }

      // Only admins can delete admin themes, users can only delete their own themes
      if (theme.isAdmin && user.role !== 1) {
        throw new ForbiddenException('Only admins can delete official themes');
      }

      if (!theme.isAdmin && theme.userId !== user.id) {
        throw new ForbiddenException('You can only delete your own themes');
      }

      // Soft delete
      await this.prisma.theme.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return successResponse('Theme deleted successfully', null);
    } catch (error) {
      processException(error);
    }
  }

  async incrementUsage(id: string): Promise<void> {
    try {
      await this.prisma.theme.update({
        where: { id },
        data: {
          usageCount: {
            increment: 1,
          },
        },
      });
    } catch (error) {
      // Silently fail - usage tracking is not critical
      console.error('Failed to increment theme usage:', error);
    }
  }

  /**
   * Return theme in raw DB shape with themeData JSON (no derived fields)
   */
  private transformThemeResponse(theme: any): any {
    const themeData = (theme.themeData as any) || {};
    return {
      id: theme.id,
      userId: theme.userId,
      name: theme.name,
      description: theme.description,
      themeData: themeData,
      isAdmin: theme.isAdmin,
      usageCount: theme.usageCount,
      createdAt: theme.createdAt,
      updatedAt: theme.updatedAt,
    };
  }
}
