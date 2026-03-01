import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { successResponse, processException } from 'src/shared/helpers/functions';
import { ResponseModel } from 'src/shared/models/response.model';
import axios from 'axios';

@Injectable()
export class OpenRouterService {
  private readonly logger = new Logger(OpenRouterService.name);

  constructor(private readonly configService: ConfigService) { }

  async getAccountInfo(): Promise<ResponseModel> {
    try {
      const apiKey = this.configService.get<string>('OPENROUTER_API_KEY');

      if (!apiKey) {
        throw new Error('OpenRouter API Key is not configured');
      }

      // Use the OpenRouter REST API directly to get credits
      const result = await axios.get('https://openrouter.ai/api/v1/auth/key', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      return successResponse('OpenRouter credits retrieved', result.data);
    } catch (error) {
      this.logger.error('Failed to fetch OpenRouter info', error);
      return processException(error);
    }
  }
}
