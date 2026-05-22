import { Module } from '@nestjs/common';
import { PublicAgendaController } from './public-agenda.controller';
import { PublicAgendaService } from './public-agenda.service';
import { AgendaNotificationsModule } from '../agenda-notifications/agenda-notifications.module';

@Module({
  imports: [AgendaNotificationsModule],
  controllers: [PublicAgendaController],
  providers: [PublicAgendaService],
})
export class PublicAgendaModule {}
