import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { PublicAgendaService } from './public-agenda.service';
import { Public } from '../auth/decorators/public.decorator';

@Public()
@Controller('public/agenda')
export class PublicAgendaController {
  constructor(private readonly service: PublicAgendaService) {}

  @Get('info')
  getInfo(@Query('slug') slug: string) {
    return this.service.getTenantInfo(slug);
  }

  @Get('services')
  getServices(@Query('slug') slug: string) {
    return this.service.getServices(slug);
  }

  @Get('professionals')
  getProfessionals(@Query('slug') slug: string) {
    return this.service.getProfessionals(slug);
  }

  @Get('slots')
  getSlots(
    @Query('slug') slug: string,
    @Query('date') date: string,
    @Query('serviceId') serviceId: string,
    @Query('professionalId') professionalId?: string,
  ) {
    return this.service.getAvailableSlots(slug, date, serviceId, professionalId);
  }

  @Post('book')
  book(
    @Body()
    body: {
      slug: string;
      serviceId: string;
      professionalId: string;
      scheduledAt: string;
      clientName: string;
      clientPhone: string;
      notes?: string;
    },
  ) {
    return this.service.book(body.slug, body);
  }
}
