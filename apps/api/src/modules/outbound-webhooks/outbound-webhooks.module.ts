import { Global, Module } from '@nestjs/common';
import { OutboundWebhooksController } from './outbound-webhooks.controller';
import { OutboundWebhooksService } from './outbound-webhooks.service';
import { WebhookRetryScheduler } from './webhook-retry.scheduler';

@Global()
@Module({
  controllers: [OutboundWebhooksController],
  providers: [OutboundWebhooksService, WebhookRetryScheduler],
  exports: [OutboundWebhooksService],
})
export class OutboundWebhooksModule {}
