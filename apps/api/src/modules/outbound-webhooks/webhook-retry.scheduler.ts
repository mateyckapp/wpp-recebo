import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OutboundWebhooksService } from './outbound-webhooks.service';

@Injectable()
export class WebhookRetryScheduler {
  private readonly logger = new Logger(WebhookRetryScheduler.name);

  constructor(private readonly webhooks: OutboundWebhooksService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async processRetries(): Promise<void> {
    try {
      await this.webhooks.processPendingRetries();
    } catch (err) {
      this.logger.error(`Erro ao processar retries de webhooks: ${String(err)}`);
    }
  }
}
