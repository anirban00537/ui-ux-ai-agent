import { Module } from '@nestjs/common';
import { DesignsController } from './designs.controller';
import { DesignsService } from './designs.service';
import { DesignsChatService } from './designs-chat.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DesignsController],
  providers: [DesignsService, DesignsChatService],
  exports: [DesignsService, DesignsChatService],
})
export class DesignsModule {}
