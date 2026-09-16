import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { API_PREFIX } from './shared/constants/global.constants';
import { setApp } from './shared/helpers/functions';
import { NestExpressApplication } from '@nestjs/platform-express';
import { coreConstant } from './shared/helpers/coreConstant';
import { MyLogger } from './modules/logger/logger.service';
import { AppModule } from './modules/app/app.module';
import express from 'express';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });
  const configService = app.get(ConfigService);
  setApp(app);
  app.setGlobalPrefix(API_PREFIX);

  // Update CORS configuration
  const corsOrigins = configService.get('CORS_ORIGIN').split(',');
  app.enableCors({
    origin: corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.use(cookieParser());

  const staticAssetsPath = path.join(
    __dirname,
    '..',
    '..',
    coreConstant.FILE_DESTINATION,
  );
  app.useStaticAssets(staticAssetsPath, {
    prefix: `/${coreConstant.FILE_DESTINATION}/`,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const logger = app.get(MyLogger);
  app.useLogger(logger);

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Capture raw body for webhook signature verification
  // Always capture for webhook routes (check path and Standard Webhooks headers)
  const rawBodyBuffer = (req, res, buffer, encoding) => {
    // Check if this is a webhook request by path or headers
    // Polar.sh uses Standard Webhooks format with 'webhook-signature' header
    const isWebhookRequest =
      req.path?.includes('/subscription/webhook') ||
      req.originalUrl?.includes('/subscription/webhook') ||
      req.url?.includes('/subscription/webhook') ||
      req.headers['webhook-signature'] ||  // Standard Webhooks (Polar.sh)
      req.headers['x-polar-signature'] ||
      req.headers['x-signature'];

    if (isWebhookRequest && buffer && buffer.length) {
      // Store both as Buffer and string for flexibility
      req.rawBody = buffer;
      req.rawBodyString = buffer.toString(encoding || 'utf8');
    }
  };

  // Apply body parser with raw body capture for webhooks
  app.use(
    bodyParser.json({
      verify: rawBodyBuffer,
      limit: '10mb',
    }),
  );
  app.use(
    bodyParser.urlencoded({
      verify: rawBodyBuffer,
      extended: true,
      limit: '10mb',
    }),
  );

  await app.listen(configService.get('APP_PORT') || 3001);
}
bootstrap();
