import { Module } from '@nestjs/common';
import { AgendaNotificationsService } from './agenda-notifications.service';
import { AgendaNotificationsController } from './agenda-notifications.controller';

@Module({
  controllers: [AgendaNotificationsController],
  providers: [AgendaNotificationsService],
  exports: [AgendaNotificationsService],
})
export class AgendaNotificationsModule {}
