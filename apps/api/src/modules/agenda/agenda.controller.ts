import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Request } from '@nestjs/common';
import { AgendaService } from './agenda.service';
import { AppointmentStatus } from '@prisma/client';

@Controller('agenda')
export class AgendaController {
  constructor(private readonly agenda: AgendaService) {}

  // ── Services ──────────────────────────────────────────────────────────────

  @Get('services')
  getServices(@Request() req: { user: { tenantId: string } }) {
    return this.agenda.getServices(req.user.tenantId);
  }

  @Post('services')
  createService(
    @Request() req: { user: { tenantId: string } },
    @Body() body: { name: string; duration: number; price?: number; description?: string },
  ) {
    return this.agenda.createService(req.user.tenantId, body);
  }

  @Patch('services/:id')
  updateService(
    @Request() req: { user: { tenantId: string } },
    @Param('id') id: string,
    @Body() body: Partial<{ name: string; duration: number; price: number; description: string; active: boolean }>,
  ) {
    return this.agenda.updateService(id, req.user.tenantId, body);
  }

  @Delete('services/:id')
  deleteService(@Request() req: { user: { tenantId: string } }, @Param('id') id: string) {
    return this.agenda.deleteService(id, req.user.tenantId);
  }

  // ── Professionals ─────────────────────────────────────────────────────────

  @Get('professionals')
  getProfessionals(@Request() req: { user: { tenantId: string } }) {
    return this.agenda.getProfessionals(req.user.tenantId);
  }

  @Post('professionals')
  createProfessional(
    @Request() req: { user: { tenantId: string } },
    @Body() body: { name: string; specialty?: string },
  ) {
    return this.agenda.createProfessional(req.user.tenantId, body);
  }

  @Patch('professionals/:id')
  updateProfessional(
    @Request() req: { user: { tenantId: string } },
    @Param('id') id: string,
    @Body() body: Partial<{ name: string; specialty: string; active: boolean }>,
  ) {
    return this.agenda.updateProfessional(id, req.user.tenantId, body);
  }

  @Patch('professionals/:id/schedule')
  upsertSchedule(
    @Param('id') id: string,
    @Body() body: { schedule: Array<{ dayOfWeek: number; startTime: string; endTime: string }> },
  ) {
    return this.agenda.upsertSchedule(id, body.schedule);
  }

  @Get('professionals/:id/breaks')
  getWorkBreaks(@Param('id') id: string) {
    return this.agenda.getWorkBreaks(id);
  }

  @Post('professionals/:id/breaks')
  createWorkBreak(
    @Param('id') id: string,
    @Body() body: { startTime: string; endTime: string; label?: string },
  ) {
    return this.agenda.createWorkBreak({ professionalId: id, ...body });
  }

  @Delete('professionals/:id/breaks/:breakId')
  deleteWorkBreak(@Param('id') id: string, @Param('breakId') breakId: string) {
    return this.agenda.deleteWorkBreak(breakId, id);
  }

  @Get('professionals/:id/blocks')
  getTimeBlocks(@Param('id') id: string, @Query('date') date?: string) {
    return this.agenda.getTimeBlocks(id, date);
  }

  @Post('professionals/:id/blocks')
  createTimeBlock(
    @Param('id') id: string,
    @Body() body: { date: string; startTime: string; endTime: string; reason?: string },
  ) {
    return this.agenda.createTimeBlock({ professionalId: id, ...body });
  }

  @Delete('professionals/:id/blocks/:blockId')
  deleteTimeBlock(@Param('id') id: string, @Param('blockId') blockId: string) {
    return this.agenda.deleteTimeBlock(blockId, id);
  }

  // ── Slots ─────────────────────────────────────────────────────────────────

  @Get('slots')
  getSlots(
    @Request() req: { user: { tenantId: string } },
    @Query('date') date: string,
    @Query('serviceId') serviceId: string,
    @Query('professionalId') professionalId?: string,
  ) {
    return this.agenda.getAvailableSlots(req.user.tenantId, date, serviceId, professionalId);
  }

  // ── Appointments ──────────────────────────────────────────────────────────

  @Get('appointments')
  getAppointments(
    @Request() req: { user: { tenantId: string } },
    @Query('date') date?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: AppointmentStatus,
    @Query('professionalId') professionalId?: string,
  ) {
    return this.agenda.getAppointments(req.user.tenantId, { date, startDate, endDate, status, professionalId });
  }

  @Post('appointments')
  createAppointment(
    @Request() req: { user: { tenantId: string } },
    @Body() body: { contactId: string; serviceId: string; professionalId: string; scheduledAt: string; notes?: string },
  ) {
    return this.agenda.createAppointment({ tenantId: req.user.tenantId, ...body });
  }

  @Patch('appointments/:id/status')
  updateStatus(
    @Request() req: { user: { tenantId: string } },
    @Param('id') id: string,
    @Body() body: { status: AppointmentStatus },
  ) {
    return this.agenda.updateAppointmentStatus(id, req.user.tenantId, body.status);
  }
}
