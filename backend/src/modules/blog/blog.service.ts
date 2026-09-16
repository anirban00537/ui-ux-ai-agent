import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ResponseModel } from 'src/shared/models/response.model';
import { successResponse, errorResponse, processException } from 'src/shared/helpers/functions';
import slugify from 'slugify';

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  // Admin Methods
  async createPost(userId: string, data: any): Promise<ResponseModel> {
    try {
      const slug = data.slug || slugify(data.title, { lower: true, strict: true });
      
      // Sanitization: Remove fields not present in prisma schema or that need special handling
      const { 
        categorySuggestion, 
        contentRaw, 
        id, 
        createdAt, 
        updatedAt,
        author,
        category,
        ...postData 
      } = data;

      const post = await this.prisma.blogPost.create({
        data: {
          ...postData,
          slug,
          authorId: userId,
          content: data.content || {},
          publishedAt: data.status === 'published' ? new Date() : null,
        },
      });
      return successResponse('Blog post created successfully', post);
    } catch (error) {
      return processException(error);
    }
  }

  async updatePost(id: string, data: any): Promise<ResponseModel> {
    try {
      const { 
        id: _id, 
        author, 
        authorId, 
        category, 
        createdAt, 
        updatedAt, 
        contentRaw, 
        categorySuggestion, 
        ...updateData 
      } = data;

      if (updateData.title && !updateData.slug) {
        updateData.slug = slugify(updateData.title, { lower: true, strict: true });
      }

      if (updateData.status === 'published' && !updateData.publishedAt) {
        updateData.publishedAt = new Date();
      }

      const post = await this.prisma.blogPost.update({
        where: { id },
        data: {
          ...updateData,
          content: data.content || updateData.content || {},
        },
      });
      return successResponse('Blog post updated successfully', post);
    } catch (error) {
      return processException(error);
    }
  }

  async adminGetPosts(query: any): Promise<ResponseModel> {
    try {
      const { page = 1, perPage = 20, status, search, id } = query;
      const skip = (page - 1) * perPage;

      const where: any = {};
      if (id) where.id = id;
      if (status) where.status = status;
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [posts, total] = await Promise.all([
        this.prisma.blogPost.findMany({
          where,
          skip: Number(skip),
          take: Number(perPage),
          include: {
            author: { select: { name: true, email: true, image: true } },

            category: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.blogPost.count({ where }),
      ]);

      return successResponse('Posts retrieved', { posts, total });
    } catch (error) {
      return processException(error);
    }
  }

  async deletePost(id: string): Promise<ResponseModel> {
    try {
      await this.prisma.blogPost.delete({ where: { id } });
      return successResponse('Post deleted successfully');
    } catch (error) {
      return processException(error);
    }
  }

  // Public Methods
  async getPublicPosts(query: any): Promise<ResponseModel> {
    try {
      const { page = 1, perPage = 10, category, tag } = query;
      const skip = (page - 1) * perPage;

      const where: any = { status: 'published' };
      if (category) where.category = { slug: category };
      if (tag) where.tags = { some: { slug: tag } };

      const [posts, total] = await Promise.all([
        this.prisma.blogPost.findMany({
          where,
          skip: Number(skip),
          take: Number(perPage),
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            featuredImg: true,
            publishedAt: true,
            category: { select: { name: true, slug: true } },
            author: { select: { name: true, image: true } },

          },
          orderBy: { publishedAt: 'desc' },
        }),
        this.prisma.blogPost.count({ where }),
      ]);

      return successResponse('Public posts retrieved', { posts, total });
    } catch (error) {
      return processException(error);
    }
  }

  async getPostBySlug(slug: string): Promise<ResponseModel> {
    try {
      const post = await this.prisma.blogPost.findUnique({
        where: { slug },
        include: {
          author: { select: { name: true, image: true } },

          category: true,
          tags: true,
        },
      });

      if (!post || post.status !== 'published') {
        return errorResponse('Post not found');
      }

      // Increment view count
      await this.prisma.blogPost.update({
        where: { id: post.id },
        data: { viewCount: { increment: 1 } },
      });

      return successResponse('Post retrieved', post);
    } catch (error) {
      return processException(error);
    }
  }

  // Categories & Tags
  async getCategories(): Promise<ResponseModel> {
    try {
      const categories = await this.prisma.blogCategory.findMany({
        include: { _count: { select: { posts: { where: { status: 'published' } } } } },
      });
      return successResponse('Categories retrieved', categories);
    } catch (error) {
      return processException(error);
    }
  }

  async createCategory(data: any): Promise<ResponseModel> {
    try {
      const slug = data.slug || slugify(data.name, { lower: true, strict: true });
      const category = await this.prisma.blogCategory.create({
        data: { ...data, slug },
      });
      return successResponse('Category created', category);
    } catch (error) {
      return processException(error);
    }
  }
}
