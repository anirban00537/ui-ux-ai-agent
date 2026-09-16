import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserController } from './users.controller';
import { UserVerificationCodeService } from '../verification_code/user-verify-code.service';
import { PrismaModule } from '../prisma/prisma.module'; 
import { NotificationService } from 'src/shared/notification/notification.service';
import { UserVerificationCodeModule } from '../verification_code/user-verify-code.module';
import { NotificationModule } from 'src/shared/notification/notification.module';

@Module({
  controllers: [UserController],
  providers: [UsersService, UserVerificationCodeService, NotificationService],
  imports: [
    PrismaModule,
    UserVerificationCodeModule,
    NotificationModule,
  ],
  exports: [UsersService],
})
export class UsersModule {}
