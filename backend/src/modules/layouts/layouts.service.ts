import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  successResponse,
  errorResponse,
  processException,
} from 'src/shared/helpers/functions';
import { ResponseModel } from 'src/shared/models/response.model';
import { User } from '@prisma/client';
import { CreateLayoutDto } from './dto/create-layout.dto';

@Injectable()
export class LayoutsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    payload: CreateLayoutDto,
  ): Promise<ResponseModel> {
    try {
      const layout = await this.prisma.layout.create({
        data: {
          userId: userId,
          name: payload.name,
          description: payload.description,
          thumbnail: payload.thumbnail,
          data: payload.data as any,
          type: 'admin', // TODO: For testing - will change later
          tags: payload.tags || [],
          isAdmin: true, // TODO: For testing - will change later
          published: payload.published !== undefined ? payload.published : true,
        },
      });
      return successResponse('Layout created successfully', layout);
    } catch (error) {
      console.error('Error creating layout:', error);
      return errorResponse('Failed to create layout', []);
    }
  }
  async findAll(userId: string): Promise<ResponseModel> {
    try {
      // TODO: For testing - return all admin layouts. Will filter by userId later
      const where: any = {
        deletedAt: null,
        isAdmin: true,
      };

      const layouts = await this.prisma.layout.findMany({
        where,
        orderBy: [{ usageCount: 'desc' }, { createdAt: 'desc' }],
      });
      return successResponse('Layouts retrieved successfully', layouts);
    } catch (error) {
      console.error('Error retrieving layouts:', error);
      return errorResponse('Failed to retrieve layouts', []);
    }
  }

  async findAdminLayouts(): Promise<ResponseModel> {
    try {
      const layouts = await this.prisma.layout.findMany({
        where: {
          isAdmin: true,
          published: true,
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          description: true,
          thumbnail: true,
          data: true,
          published: true,
        },
        orderBy: [{ usageCount: 'desc' }, { createdAt: 'desc' }],
      });

      const processedLayouts = layouts.map((layout) => {
        const data = layout.data as any;
        return {
          id: layout.id,
          name: layout.name,
          description: layout.description,
          thumbnail: layout.thumbnail,
          published: layout.published,
          icon: data?.icon || 'IconLayout',
        };
      });

      return successResponse(
        'Admin layouts retrieved successfully',
        processedLayouts,
      );
    } catch (error) {
      console.error('Error retrieving admin layouts:', error);
      return errorResponse('Failed to retrieve admin layouts', []);
    }
  }

  async findOne(id: string): Promise<ResponseModel> {
    try {
      const layout = await this.prisma.layout.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!layout) {
        return errorResponse('Layout not found');
      }

      return successResponse('Layout retrieved successfully', layout);
    } catch (error) {
      console.error('Error retrieving layout:', error);
      return errorResponse('Failed to retrieve layout');
    }
  }

  async update(
    id: string,
    userId: string,
    payload: any,
  ): Promise<ResponseModel> {
    try {
      // Check if layout exists
      const existingLayout = await this.prisma.layout.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!existingLayout) {
        return errorResponse('Layout not found');
      }

      // Debug logging for published field
      console.log('Update payload received:', {
        published: payload.published,
        publishedType: typeof payload.published,
        hasPublished: 'published' in payload,
      });

      // Prepare update data
      const updateData: any = {
        name: payload.name,
        description: payload.description,
        thumbnail: payload.thumbnail,
        type: payload.type || existingLayout.type,
        tags: payload.tags || existingLayout.tags,
      };

      // Only update data if provided
      if (payload.data !== undefined) {
        updateData.data = payload.data as any;
      }

      // Handle published field explicitly
      if ('published' in payload) {
        updateData.published = payload.published;
        console.log('Setting published to:', payload.published);
      }

      // Update layout
      const layout = await this.prisma.layout.update({
        where: { id },
        data: updateData,
      });

      return successResponse('Layout updated successfully', layout);
    } catch (error) {
      console.error('Error updating layout:', error);
      return errorResponse('Failed to update layout', []);
    }
  }

  async remove(id: string, userId: string): Promise<ResponseModel> {
    try {
      // TODO: For testing - allow deleting any admin layout. Will verify userId ownership later
      const layout = await this.prisma.layout.findFirst({
        where: {
          id,
          deletedAt: null,
          isAdmin: true, // TODO: For testing - will verify userId later
        },
      });

      if (!layout) {
        return errorResponse('Layout not found');
      }

      await this.prisma.layout.delete({ where: { id } });

      return successResponse('Layout deleted successfully', null);
    } catch (error) {
      processException(error);
    }
  }
}
