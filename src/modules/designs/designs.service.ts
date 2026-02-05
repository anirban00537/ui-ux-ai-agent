import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ResponseModel } from 'src/shared/models/response.model';
import { successResponse, errorResponse } from 'src/shared/helpers/functions';
import {
  paginatedQuery,
  PaginationOptions,
} from 'src/shared/utils/pagination.util';

@Injectable()
export class DesignsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllDesigns(
    userId: string,
    paginationOptions: PaginationOptions,
  ): Promise<ResponseModel> {
    try {
      const where = { userId };
      const result = await paginatedQuery(
        this.prisma,
        'design',
        where,
        paginationOptions,
        { include: { artboards: { select: { id: true, title: true } } } },
      );

      return successResponse('Designs fetched successfully', result);
    } catch (error) {
      return errorResponse(error.message);
    }
  }

  async getDesignById(id: string, userId: string): Promise<ResponseModel> {
    try {
      const design = await this.prisma.design.findUnique({
        where: {
          id,
        },
        include: {
          messages: {
            orderBy: {
              createdAt: 'asc',
            },
            take: -50, // Take LATEST 50 messages in ascending order
          },
          artboards: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });
      if (!design || design.userId !== userId) {
        return errorResponse('User does not have this Design');
      }
      return successResponse('Design fetched successfully', design);
    } catch (error) {
      return errorResponse(error.message);
    }
  }

  async getDesignMessages(
    id: string,
    userId: string,
    paginationOptions: PaginationOptions,
  ): Promise<ResponseModel> {
    try {
      const design = await this.prisma.design.findUnique({ where: { id } });
      if (!design || design.userId !== userId) {
        return errorResponse('User does not have this Design');
      }

      const result = await paginatedQuery(
        this.prisma,
        'message',
        { designId: id },
        paginationOptions,
      );

      return successResponse('Messages fetched successfully', result);
    } catch (error) {
      return errorResponse(error.message);
    }
  }

  async getPublicDesignById(id: string): Promise<ResponseModel> {
    try {
      const design = await this.prisma.design.findUnique({
        where: {
          id,
        },
        include: {
          artboards: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });

      if (!design || !design.isPublic) {
        return errorResponse('Design is not public or does not exist');
      }

      return successResponse('Public design fetched successfully', design);
    } catch (error) {
      return errorResponse(error.message);
    }
  }
  async deleteDesign(id: string, userId: string): Promise<ResponseModel> {
    try {
      const existing = await this.prisma.design.findUnique({ where: { id } });
      if (!existing || existing.userId !== userId) {
        return errorResponse('User does not have this Design');
      }
      const design = await this.prisma.design.delete({
        where: {
          id,
        },
      });
      return successResponse('Design deleted successfully', design);
    } catch (error) {
      return errorResponse(error.message);
    }
  }

  async saveUserMessage(designId: string, role: string, content: string) {
    const message = await this.prisma.message.create({
      data: {
        designId,
        role,
        content,
      },
    });
    return message;
  }
  async createDesignConversation(title: string, userId: string, type?: string) {
    try {
      const design = await this.prisma.design.create({
        data: {
          userId,
          title,
          type: type || 'mobile_app',
        },
      });
      return successResponse(
        'Design conversation created successfully',
        design,
      );
    } catch (error) {
      return errorResponse(error.message);
    }
  }

  async updateDesign(
    id: string,
    userId: string,
    data: { title?: string; colorPalette?: Record<string, string>; isPublic?: boolean },
  ): Promise<ResponseModel> {
    try {
      const existing = await this.prisma.design.findUnique({ where: { id } });
      if (!existing || existing.userId !== userId) {
        return errorResponse('User does not have this Design');
      }
      
      const updateData: any = {};
      if (data.title !== undefined) {
        updateData.title = data.title;
      }
      if (data.colorPalette !== undefined) {
        updateData.colorPalette = data.colorPalette;
      }
      if (data.isPublic !== undefined) {
        updateData.isPublic = data.isPublic;
      }
      
      const updated = await this.prisma.design.update({
        where: { id },
        data: updateData,
      });
      return successResponse('Design updated successfully', updated);
    } catch (error) {
      return errorResponse(error.message);
    }
  }

  async updateArtboard(
    id: string,
    userId: string,
    data: { x?: number; y?: number; width?: number; height?: number },
  ): Promise<ResponseModel> {
    try {
      const artboard = await this.prisma.artboard.findUnique({
        where: { id },
        include: { design: true },
      });

      if (!artboard || artboard.design.userId !== userId) {
        return errorResponse('User does not have permission to update this artboard');
      }

      const updated = await this.prisma.artboard.update({
        where: { id },
        data,
      });

      return successResponse('Artboard updated successfully', updated);
    } catch (error) {
      return errorResponse(error.message);
    }
  }

  async deleteArtboard(id: string, userId: string): Promise<ResponseModel> {
    try {
      const artboard = await this.prisma.artboard.findUnique({
        where: { id },
        include: { design: true },
      });

      if (!artboard || artboard.design.userId !== userId) {
        return errorResponse('User does not have permission to delete this artboard');
      }

      await this.prisma.artboard.delete({
        where: { id },
      });

      return successResponse('Artboard deleted successfully');
    } catch (error) {
      return errorResponse(error.message);
    }
  }
}
