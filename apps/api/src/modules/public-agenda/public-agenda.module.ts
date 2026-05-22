import { Module } from '@nestjs/common';
import { PublicAgendaController } from './public-agenda.controller';
import { PublicAgendaService } from './public-agenda.service';

@Module({
  controllers: [PublicAgendaController],
  providers: [PublicAgendaService],
})
export class PublicAgendaModule {}
