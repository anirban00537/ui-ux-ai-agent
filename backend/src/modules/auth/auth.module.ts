import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BetterAuthController } from './better-auth.controller';

@Module({
  imports: [PrismaModule],
  controllers: [BetterAuthController],
})
export class AuthModule {}
