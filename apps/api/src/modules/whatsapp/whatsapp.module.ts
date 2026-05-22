import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WebhookProcessorService } from './webhook-processor.service';
import { WhatsappWebhookController } from './whatsapp-webhook.controller';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [WhatsappWebhookController],
  providers: [WhatsappService, WebhookProcessorService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
