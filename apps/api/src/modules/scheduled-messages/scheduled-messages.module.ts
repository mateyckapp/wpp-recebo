import { Module } from '@nestjs/common';
import { ScheduledMessagesService } from './scheduled-messages.service';
import { ScheduledMessagesController } from './scheduled-messages.controller';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [WhatsappModule],
  controllers: [ScheduledMessagesController],
  providers: [ScheduledMessagesService],
})
export class ScheduledMessagesModule {}
