import { Module } from '@nestjs/common';
import { DesignsController } from './designs.controller';
import { DesignsService } from './designs.service';
import { DesignsChatService } from './designs-chat.service';
import { DesignsExportService } from './designs-export.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { ImagesModule } from '../images/images.module';

@Module({
  imports: [PrismaModule, SubscriptionModule, ImagesModule],
  controllers: [DesignsController],
  providers: [DesignsService, DesignsChatService, DesignsExportService],
  exports: [DesignsService, DesignsChatService, DesignsExportService],
})
export class DesignsModule {}
