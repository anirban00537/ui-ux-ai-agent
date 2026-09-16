import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogAiService } from './blog-ai.service';
import { BlogController, AdminBlogController } from './blog.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [PrismaModule, ConfigModule, SubscriptionModule],
  controllers: [BlogController, AdminBlogController],
  providers: [BlogService, BlogAiService],
  exports: [BlogService, BlogAiService],
})
export class BlogModule {}
