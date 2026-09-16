import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PolarService } from './services/polar.service';
import { CreditService } from './services/credit.service';
import { ConfigModule } from '@nestjs/config';
import { AiUsageService } from './services/ai-usage.service';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, PolarService, CreditService, AiUsageService],
  exports: [SubscriptionService, CreditService, PolarService, AiUsageService],
})
export class SubscriptionModule {}

