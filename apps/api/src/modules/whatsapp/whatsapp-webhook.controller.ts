import {
  Controller,
  Get,
  Post,
  Query,
  Headers,
  RawBodyRequest,
  Req,
  Res,
  HttpCode,
  Logger,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { Public } from '../auth/decorators/public.decorator';
import { WhatsappService } from './whatsapp.service';
import { WebhookProcessorService } from './webhook-processor.service';
import type { WhatsappWebhookPayload } from './types/webhook.types';

@Public()
@Controller('webhooks/whatsapp')
export class WhatsappWebhookController {
  private readonly logger = new Logger(WhatsappWebhookController.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly whatsapp: WhatsappService,
    private readonly processor: WebhookProcessorService,
  ) {}

  // ─── Verificação do webhook pelo Meta ─────────────────────────────────────

  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ): void {
    const verifyToken = this.configService.get<string>('app.whatsapp.verifyToken');

    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log('Webhook verificado com sucesso');
      res.status(200).send(challenge);
    } else {
      this.logger.warn(`Falha na verificação do webhook (token inválido)`);
      res.status(403).send('Forbidden');
    }
  }

  // ─── Receber eventos do WhatsApp ──────────────────────────────────────────

  @Post()
  @HttpCode(200)
  async receiveWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-hub-signature-256') signature: string,
  ): Promise<void> {
    const appSecret = this.configService.get<string>('app.whatsapp.appSecret') ?? '';
    const rawBody = req.rawBody;

    if (!rawBody) {
      throw new BadRequestException('Corpo da requisição em falta');
    }

    if (!signature) {
      throw new ForbiddenException('Assinatura em falta');
    }

    const isValid = this.whatsapp.verifySignature(rawBody, signature, appSecret);
    if (!isValid) {
      this.logger.warn('Assinatura do webhook inválida');
      throw new ForbiddenException('Assinatura inválida');
    }

    let payload: WhatsappWebhookPayload;
    try {
      payload = JSON.parse(rawBody.toString()) as WhatsappWebhookPayload;
    } catch {
      throw new BadRequestException('Payload JSON inválido');
    }

    // Processar em background — o Meta espera 200 em <5s
    void this.processor.process(payload).catch((err: unknown) => {
      this.logger.error(`Erro no processamento do webhook: ${String(err)}`);
    });
  }
}
