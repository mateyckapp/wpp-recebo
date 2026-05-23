import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(SentryExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} → ${status}: ${String(exception)}`,
      );
      // Sentry captura de forma lazy para não bloquear se não estiver instalado
      void import('@sentry/node')
        .then((Sentry) => Sentry.captureException(exception))
        .catch(() => undefined);
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
