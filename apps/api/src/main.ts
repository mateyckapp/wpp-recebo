import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser');
import { AppModule } from './app.module';
import { SentryExceptionFilter } from './common/filters/sentry-exception.filter';
import type { Request, Response, NextFunction } from 'express';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  // Sentry — init opcional, não bloqueia o arranque se falhar
  try {
    const sentryDsn = process.env['SENTRY_DSN'];
    if (sentryDsn) {
      const Sentry = await import('@sentry/node');
      Sentry.init({
        dsn: sentryDsn,
        environment: process.env['NODE_ENV'] ?? 'development',
        tracesSampleRate: process.env['NODE_ENV'] === 'production' ? 0.2 : 1.0,
      });
      logger.log('Sentry inicializado');
    }
  } catch (e) {
    logger.warn(`Sentry não inicializado: ${String(e)}`);
  }

  const app = await NestFactory.create(AppModule, { rawBody: true });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const appDomain = configService.get<string>('APP_DOMAIN', 'wpprecebo.com');
  const corsOriginEnv = configService.get<string>('CORS_ORIGIN', '');
  const allowedOrigins = corsOriginEnv
    ? corsOriginEnv.split(',').map((o) => o.trim())
    : [];
  const escapedDomain = appDomain.replace(/\./g, '\\.');
  const appDomainRegex = new RegExp(
    `^https?://([a-z0-9-]+\\.)?${escapedDomain}(:\\d+)?$`,
  );

  // CORS manual — antes de qualquer outro middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers['origin'] as string | undefined;
    const isAllowed =
      !origin ||
      allowedOrigins.includes(origin) ||
      appDomainRegex.test(origin) ||
      (nodeEnv !== 'production' && /^https?:\/\/([a-z0-9-]+\.)?localhost(:\d+)?$/.test(origin));

    res.setHeader('Vary', 'Origin');
    if (origin) {
      if (isAllowed) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,X-API-Key');
      }
      // Preflight sempre responde (mesmo a origens não permitidas) para não deixar pendente
      if (req.method === 'OPTIONS') {
        res.status(isAllowed ? 204 : 403).end();
        return;
      }
    }

    next();
  });

  app.use(helmet());
  app.use(cookieParser());

  app.useGlobalFilters(new SentryExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.setGlobalPrefix('api/v1');

  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Wpp-Recebo API')
      .setDescription('API de gestão de WhatsApp para negócios')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
    logger.log(`Swagger disponível em http://localhost:${port}/api/docs`);
  }

  await app.listen(port);
  logger.log(`Servidor a correr na porta ${port} [${nodeEnv}]`);
}

bootstrap();
