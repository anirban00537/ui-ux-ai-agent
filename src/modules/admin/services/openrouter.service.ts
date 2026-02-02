import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenRouter } from '@openrouter/sdk';
import { successResponse, processException } from 'src/shared/helpers/functions';
import { ResponseModel } from 'src/shared/models/response.model';

@Injectable()
export class OpenRouterService {
  private readonly logger = new Logger(OpenRouterService.name);
  private openRouter: OpenRouter;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENROUTER_API_KEY');
    this.openRouter = new OpenRouter({
      apiKey: apiKey ?? "",
    });
  }

  async getAccountInfo(): Promise<ResponseModel> {
    try {
      const apiKey = this.configService.get<string>('OPENROUTER_API_KEY');
      
      if (!apiKey) {
        throw new Error('OpenRouter API Key is not configured');
      }

      // Using the SDK as requested
      const result = await this.openRouter.credits.getCredits();

      // Return the result directly. 
      // The SDK response structure for getCredits is typically:
      // { data: { total_credits: number, total_usage: number, ... } }
      return successResponse('OpenRouter credits retrieved', result);
    } catch (error) {
      this.logger.error('Failed to fetch OpenRouter info', error);
      return processException(error);
    }
  }
}
