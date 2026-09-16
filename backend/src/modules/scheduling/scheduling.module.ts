import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from 'src/shared/mail/mail.module';
import { SchedulingService } from './scheduling.service';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    MailModule,
    SubscriptionModule, // For CreditService
  ],
  providers: [SchedulingService],
  exports: [SchedulingService],
})
export class SchedulingModule {}