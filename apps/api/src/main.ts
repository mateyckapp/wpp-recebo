import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser');
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, { rawBody: true });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  app.use(helmet());
  app.use(cookieParser());

  const corsOriginEnv = configService.get<string>('CORS_ORIGIN', '');
  const allowedOrigins = corsOriginEnv
    ? corsOriginEnv.split(',').map((o) => o.trim())
    : [];

  const appDomain = configService.get<string>('APP_DOMAIN', 'wpprecebo.pt');
  const appDomainRegex = new RegExp(
    `^https?://([a-z0-9-]+\\.)?${appDomain.replace('.', '\\.')}(:\\d+)?$`,
  );

  app.enableCors({
    origin: (origin, callback) => {
      // Sem origin (ex: curl, Postman, SSR) → permitir
      if (!origin) return callback(null, true);
      // Lista explícita do env
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Qualquer subdomínio do domínio principal da app
      if (appDomainRegex.test(origin)) return callback(null, true);
      // Em dev: qualquer subdomínio de localhost
      if (nodeEnv !== 'production' && /^https?:\/\/([a-z0-9-]+\.)?localhost(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS bloqueado: ${origin}`));
    },
    credentials: true,
  });

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
