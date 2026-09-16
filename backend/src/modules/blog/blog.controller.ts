import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { BlogService } from './blog.service';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { IsAdmin } from 'src/shared/decorators/is-admin.decorator';
import { ResponseModel } from 'src/shared/models/response.model';
import { Public } from 'src/shared/decorators/public.decorator';
import { BlogAiService } from './blog-ai.service';

@Controller('admin/blog')
@UseGuards(JwtAuthGuard)
@IsAdmin()
export class AdminBlogController {
  constructor(
    private readonly blogService: BlogService,
    private readonly blogAiService: BlogAiService
  ) {}

  @Post('generate')
  async generateBlog(@Req() req: any, @Body() body: { prompt: string }): Promise<ResponseModel> {
    return this.blogAiService.generateBlogContent(req.user, body.prompt);
  }

  @Post('posts')
  async createPost(@Req() req: any, @Body() body: any): Promise<ResponseModel> {
    return this.blogService.createPost(req.user.id, body);
  }

  @Patch('posts/:id')
  async updatePost(@Param('id') id: string, @Body() body: any): Promise<ResponseModel> {
    return this.blogService.updatePost(id, body);
  }

  @Get('posts')
  async getPosts(@Query() query: any): Promise<ResponseModel> {
    return this.blogService.adminGetPosts(query);
  }

  @Delete('posts/:id')
  async deletePost(@Param('id') id: string): Promise<ResponseModel> {
    return this.blogService.deletePost(id);
  }

  @Post('categories')
  async createCategory(@Body() body: any): Promise<ResponseModel> {
    return this.blogService.createCategory(body);
  }

  @Get('categories')
  async getCategories(): Promise<ResponseModel> {
    return this.blogService.getCategories();
  }
}

@Controller('blog')
@Public()
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get('posts')
  async getPublicPosts(@Query() query: any): Promise<ResponseModel> {
    return this.blogService.getPublicPosts(query);
  }

  @Get('posts/:slug')
  async getPost(@Param('slug') slug: string): Promise<ResponseModel> {
    return this.blogService.getPostBySlug(slug);
  }

  @Get('categories')
  async getCategories(): Promise<ResponseModel> {
    return this.blogService.getCategories();
  }
}
