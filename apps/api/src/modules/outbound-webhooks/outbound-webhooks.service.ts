import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { createHmac, randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

const RETRY_DELAYS_MS = [0, 5_000, 30_000, 120_000, 600_000];

export interface WebhookEvent {
  event: string;
  tenantId: string;
  data: unknown;
}

@Injectable()
export class OutboundWebhooksService {
  private readonly logger = new Logger(OutboundWebhooksService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── CRUD ──────────────────────────────────────────────────────────────────

  async create(
    tenantId: string,
    dto: { url: string; events: string[]; secret?: string; description?: string },
  ) {
    const webhook = await this.prisma.webhook.create({
      data: { tenantId, ...dto },
      select: {
        id: true, url: true, events: true, description: true,
        active: true, createdAt: true,
      },
    });
    return { data: webhook };
  }

  async findAll(tenantId: string) {
    const webhooks = await this.prisma.webhook.findMany({
      where: { tenantId },
      select: {
        id: true, url: true, events: true, description: true,
        active: true, lastDeliveredAt: true, failureCount: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return { data: webhooks };
  }

  async remove(tenantId: string, id: string) {
    const webhook = await this.prisma.webhook.findFirst({ where: { id, tenantId } });
    if (!webhook) throw new NotFoundException('Webhook não encontrado');
    await this.prisma.webhook.delete({ where: { id } });
    return { message: 'Webhook removido com sucesso' };
  }

  async update(
    tenantId: string,
    id: string,
    dto: { active?: boolean; events?: string[]; description?: string },
  ) {
    const webhook = await this.prisma.webhook.findFirst({ where: { id, tenantId } });
    if (!webhook) throw new NotFoundException('Webhook não encontrado');
    const updated = await this.prisma.webhook.update({
      where: { id },
      data: dto,
      select: { id: true, url: true, events: true, active: true, description: true, updatedAt: true },
    });
    return { data: updated };
  }

  // ─── Dispatcher ────────────────────────────────────────────────────────────

  async dispatch(payload: WebhookEvent): Promise<void> {
    const { tenantId, event: eventType, data } = payload;

    const webhooks = await this.prisma.webhook.findMany({
      where: {
        tenantId,
        active: true,
        OR: [
          { events: { has: eventType } },
          { events: { has: '*' } },
        ],
      },
    });

    if (webhooks.length === 0) return;

    const eventId = randomUUID();
    const timestamp = new Date().toISOString();

    const fullPayload = { id: `evt_${eventId}`, event: eventType, tenantId, timestamp, data };

    await Promise.allSettled(
      webhooks.map((wh) => this.deliverOne(wh, fullPayload, eventType, eventId)),
    );
  }

  private async deliverOne(
    webhook: { id: string; url: string; secret: string | null },
    payload: Record<string, unknown>,
    eventType: string,
    eventId: string,
  ): Promise<void> {
    const body = JSON.stringify(payload);
    const signature = webhook.secret
      ? createHmac('sha256', webhook.secret).update(body).digest('hex')
      : undefined;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'WppRecebo-Webhooks/1.0',
    };
    if (signature) headers['X-WPP-Signature'] = signature;

    let delivery = await this.prisma.webhookDelivery.upsert({
      where: { eventId: `${webhook.id}:${eventId}` },
      update: {},
      create: {
        webhookId: webhook.id,
        eventType,
        eventId: `${webhook.id}:${eventId}`,
        payload: payload as object,
      },
    });

    await this.attempt(webhook.id, delivery.id, webhook.url, body, headers);
  }

  async attempt(
    webhookId: string,
    deliveryId: string,
    url: string,
    body: string,
    headers: Record<string, string>,
  ): Promise<void> {
    let statusCode: number | null = null;
    let succeeded = false;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body,
        signal: AbortSignal.timeout(10_000),
      });
      statusCode = response.status;
      succeeded = response.ok;
    } catch {
      statusCode = null;
    }

    const delivery = await this.prisma.webhookDelivery.update({
      where: { id: deliveryId },
      data: {
        statusCode,
        attempts: { increment: 1 },
        succeeded,
        nextRetryAt: succeeded ? null : this.nextRetryAt(0),
      },
    });

    if (succeeded) {
      await this.prisma.webhook.update({
        where: { id: webhookId },
        data: { lastDeliveredAt: new Date(), failureCount: 0 },
      });
    } else {
      const attempt = delivery.attempts;
      if (attempt >= RETRY_DELAYS_MS.length) {
        // Mark webhook as problematic after all retries exhausted
        await this.prisma.webhook.update({
          where: { id: webhookId },
          data: { failureCount: { increment: 1 } },
        });
        this.logger.warn(`Webhook ${webhookId}: todas as tentativas falharam`);
        return;
      }
      await this.prisma.webhookDelivery.update({
        where: { id: deliveryId },
        data: { nextRetryAt: this.nextRetryAt(attempt) },
      });
    }
  }

  private nextRetryAt(attempt: number): Date | null {
    const delay = RETRY_DELAYS_MS[attempt + 1];
    if (!delay) return null;
    return new Date(Date.now() + delay);
  }

  // ─── Retry scheduler (called by cron) ─────────────────────────────────────

  async processPendingRetries(): Promise<void> {
    const pending = await this.prisma.webhookDelivery.findMany({
      where: {
        succeeded: false,
        nextRetryAt: { lte: new Date() },
      },
      include: { webhook: { select: { id: true, url: true, secret: true, active: true } } },
      take: 50,
    });

    for (const delivery of pending) {
      if (!delivery.webhook.active) {
        await this.prisma.webhookDelivery.update({
          where: { id: delivery.id },
          data: { nextRetryAt: null },
        });
        continue;
      }

      const body = JSON.stringify(delivery.payload);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (delivery.webhook.secret) {
        headers['X-WPP-Signature'] = createHmac('sha256', delivery.webhook.secret)
          .update(body)
          .digest('hex');
      }

      await this.attempt(delivery.webhook.id, delivery.id, delivery.webhook.url, body, headers);
    }
  }
}
