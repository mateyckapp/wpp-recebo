import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';

const GRAPH_API_VERSION = 'v21.0';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly client: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    this.client = axios.create({
      baseURL: `https://graph.facebook.com/${GRAPH_API_VERSION}`,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ─── Envio de mensagens ────────────────────────────────────────────────────

  async sendTextMessage(
    phoneNumberId: string,
    to: string,
    text: string,
    accessToken: string,
  ): Promise<string> {
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: this.normalizePhone(to),
      type: 'text',
      text: { body: text, preview_url: false },
    };

    return this.sendRequest(phoneNumberId, payload, accessToken);
  }

  async sendImageMessage(
    phoneNumberId: string,
    to: string,
    imageUrl: string,
    caption: string | undefined,
    accessToken: string,
  ): Promise<string> {
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: this.normalizePhone(to),
      type: 'image',
      image: { link: imageUrl, ...(caption ? { caption } : {}) },
    };

    return this.sendRequest(phoneNumberId, payload, accessToken);
  }

  async sendDocumentMessage(
    phoneNumberId: string,
    to: string,
    documentUrl: string,
    filename: string,
    caption: string | undefined,
    accessToken: string,
  ): Promise<string> {
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: this.normalizePhone(to),
      type: 'document',
      document: { link: documentUrl, filename, ...(caption ? { caption } : {}) },
    };

    return this.sendRequest(phoneNumberId, payload, accessToken);
  }

  async sendTemplateMessage(
    phoneNumberId: string,
    to: string,
    templateName: string,
    languageCode: string,
    parameters: string[],
    accessToken: string,
  ): Promise<string> {
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: this.normalizePhone(to),
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components: [
          {
            type: 'body',
            parameters: parameters.map((text) => ({ type: 'text', text })),
          },
        ],
      },
    };
    return this.sendRequest(phoneNumberId, payload, accessToken);
  }

  async markAsRead(
    phoneNumberId: string,
    messageId: string,
    accessToken: string,
  ): Promise<void> {
    try {
      await this.client.post(
        `/${phoneNumberId}/messages`,
        { messaging_product: 'whatsapp', status: 'read', message_id: messageId },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
    } catch (err) {
      this.logger.warn(`Falha ao marcar mensagem ${messageId} como lida: ${String(err)}`);
    }
  }

  async getMediaUrl(mediaId: string, accessToken: string): Promise<string> {
    const { data } = await this.client.get<{ url: string }>(`/${mediaId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return data.url;
  }

  // ─── Verificação de assinatura do webhook ──────────────────────────────────

  verifySignature(rawBody: Buffer, signature: string, appSecret: string): boolean {
    const expected = `sha256=${crypto
      .createHmac('sha256', appSecret)
      .update(rawBody)
      .digest('hex')}`;

    try {
      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch {
      return false;
    }
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  normalizePhone(phone: string): string {
    // Remove tudo excepto dígitos, adiciona + se necessário
    const digits = phone.replace(/\D/g, '');
    return digits.startsWith('+') ? digits : digits;
  }

  toE164(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    return `+${digits}`;
  }

  private async sendRequest(
    phoneNumberId: string,
    payload: Record<string, unknown>,
    accessToken: string,
  ): Promise<string> {
    try {
      const { data } = await this.client.post<{
        messages: Array<{ id: string }>;
      }>(`/${phoneNumberId}/messages`, payload, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const messageId = data.messages[0]?.id;
      if (!messageId) throw new Error('Sem ID na resposta do WhatsApp');

      return messageId;
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? JSON.stringify(err.response?.data)
        : String(err);
      this.logger.error(`Erro ao enviar mensagem WhatsApp: ${message}`);
      throw new InternalServerErrorException('Falha ao enviar mensagem WhatsApp');
    }
  }
}
