import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import type { Request, Response } from 'express';

@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(SentryExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException ? exception.getStatus() : 500;

    if (status >= 500) {
      Sentry.captureException(exception, {
        extra: { path: request.url, method: request.method },
      });
      this.logger.error(`Erro interno: ${String(exception)}`);
    }

    if (!response.headersSent) {
      const body =
        exception instanceof HttpException
          ? exception.getResponse()
          : { statusCode: 500, message: 'Erro interno do servidor' };

      response.status(status).json(body);
    }
  }
}
