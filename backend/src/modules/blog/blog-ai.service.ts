import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { coreConstant } from 'src/shared/helpers/coreConstant';
import { ResponseModel } from 'src/shared/models/response.model';
import { successResponse, processException, errorResponse } from 'src/shared/helpers/functions';
import slugify from 'slugify';
import { AiUsageService } from '../subscription/services/ai-usage.service';
import { User } from '@prisma/client';
import OpenAI from 'openai';

@Injectable()
export class BlogAiService implements OnModuleInit {
  private readonly logger = new Logger(BlogAiService.name);
  private client: OpenAI | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly aiUsageService: AiUsageService
  ) { }

  async onModuleInit() {
    const apiKey = this.configService.get<string>('OPENROUTER_API_KEY');
    if (!apiKey) {
      this.logger.warn('OPENROUTER_API_KEY is not set - AI features disabled');
      return;
    }

    try {
      this.client = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey,
      });
      this.logger.log('OpenAI client initialized for OpenRouter');
    } catch (error) {
      this.logger.error('Failed to initialize OpenAI client:', error);
    }
  }

  async generateBlogContent(user: User, prompt: string): Promise<ResponseModel> {
    try {
      if (!this.client) {
        return errorResponse('AI service not configured');
      }

      const systemPrompt = `
        You are an expert blog post generator and SEO specialist.
        Generate a comprehensive, high-quality blog post based on the user's prompt.
        
        The output MUST be a valid JSON object with the following structure:
        {
          "title": "A catchy, SEO-friendly title",
          "excerpt": "A professional summary (150-160 characters)",
          "content": "Full blog post content in Markdown format. Use H2, H3, lists, and bold text for readability. Minimum 600 words.",
          "metaTitle": "SEO meta title (50-60 characters)",
          "metaDescription": "SEO meta description (150-160 characters)",
          "metaKeywords": "keyword1, keyword2, keyword3",
          "categorySuggestion": "A single category name that fits the post"
        }
        
        Rules:
        1. Maintain a professional yet engaging tone.
        2. Content must be original and value-driven.
        3. Ensure SEO best practices are followed.
        4. Return ONLY the JSON object.
      `;

      const response = await this.client.chat.completions.create({
        model: coreConstant.AI_MODELS.AGENT.NAME,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
      });

      let content = response.choices[0]?.message?.content || '{}';
      // Strip markdown code blocks if present
      if (content.trim().startsWith('```')) {
        content = content.trim().replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '');
      }
      const blogData = JSON.parse(content);

      // Log usage
      const usage = response.usage;
      if (usage) {
        await this.aiUsageService.logUsage({
          userId: user.id,
          modelName: coreConstant.AI_MODELS.AGENT.NAME,
          type: 'blog_generation',
          inputTokens: usage.prompt_tokens || 0,
          outputTokens: usage.completion_tokens || 0,
        });
      }

      // Auto-generate slug if not provided by AI (though we can trust slugify)
      blogData.slug = slugify(blogData.title, { lower: true, strict: true });

      return successResponse('Blog content generated successfully', blogData);
    } catch (error) {
      this.logger.error('Error generating blog content:', error);
      return processException(error);
    }
  }
}
