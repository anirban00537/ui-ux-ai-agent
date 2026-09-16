import { Module, NestModule, RequestMethod } from '@nestjs/common';
import { MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { MailConfig } from 'src/shared/configs/mail.config';
import { UsersModule } from '../users/users.module';
import { MailModule } from 'src/shared/mail/mail.module';
import { ApiSecretCheckMiddleware } from 'src/shared/middlewares/apisecret.middleware';
import { coreConstant } from 'src/shared/helpers/coreConstant';
import { LoggerModule } from '../logger/logger.module';
import { SchedulingModule } from '../scheduling/scheduling.module';
import { ImagesModule } from '../images/images.module';
import { ThemesModule } from '../themes/themes.module';
import { LayoutsModule } from '../layouts/layouts.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { AdminModule } from '../admin/admin.module';
import { BlogModule } from '../blog/blog.module';
import { ContactModule } from '../contact/contact.module';
import { DesignsModule } from '../designs/designs.module';
import { API_PREFIX } from 'src/shared/constants/global.constants';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [MailConfig],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    MailModule,
    LoggerModule,
    SchedulingModule,
    ImagesModule,
    ThemesModule,
    LayoutsModule,
    SubscriptionModule,
    AdminModule,
    BlogModule,
    ContactModule,
    DesignsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiSecretCheckMiddleware)
      .exclude(
        {
          path: `/${coreConstant.FILE_DESTINATION}/*`,
          method: RequestMethod.ALL,
        },
        {
          path: `${API_PREFIX}/subscription/webhook`,
          method: RequestMethod.POST,
        },
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
