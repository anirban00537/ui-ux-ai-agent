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
        { include: { screens: { select: { id: true, title: true } } } },
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
          },
          screens: {
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
  async createDesignConversation(title: string, userId: string) {
    try {
      const design = await this.prisma.design.create({
        data: {
          userId,
          title,
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
    data: { title?: string },
  ): Promise<ResponseModel> {
    try {
      const existing = await this.prisma.design.findUnique({ where: { id } });
      if (!existing || existing.userId !== userId) {
        return errorResponse('User does not have this Design');
      }
      const updated = await this.prisma.design.update({
        where: { id },
        data: {
          title: data.title ?? existing.title,
        },
      });
      return successResponse('Design updated successfully', updated);
    } catch (error) {
      return errorResponse(error.message);
    }
  }
}
