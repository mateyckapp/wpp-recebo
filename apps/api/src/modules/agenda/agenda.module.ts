import { Module } from '@nestjs/common';
import { AgendaService } from './agenda.service';
import { AgendaController } from './agenda.controller';
import { AgendaNotificationsModule } from '../agenda-notifications/agenda-notifications.module';

@Module({
  imports: [AgendaNotificationsModule],
  controllers: [AgendaController],
  providers: [AgendaService],
  exports: [AgendaService],
})
export class AgendaModule {}
