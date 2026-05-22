import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AppointmentStatus } from '@prisma/client';
import { AgendaNotificationsService } from '../agenda-notifications/agenda-notifications.service';

@Injectable()
export class PublicAgendaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: AgendaNotificationsService,
  ) {}

  private async resolveTenant(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true },
    });
    if (!tenant) throw new NotFoundException('Negócio não encontrado');
    return tenant;
  }

  async getTenantInfo(slug: string) {
    const tenant = await this.resolveTenant(slug);
    return { name: tenant.name, slug: tenant.slug };
  }

  async getTenantBranding(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      select: { logoUrl: true, primaryColor: true },
    });
    return {
      logoUrl: tenant?.logoUrl ?? null,
      primaryColor: tenant?.primaryColor ?? '#7c3aed',
    };
  }

  async getServices(slug: string) {
    const tenant = await this.resolveTenant(slug);
    return this.prisma.service.findMany({
      where: { tenantId: tenant.id, active: true },
      select: { id: true, name: true, duration: true, price: true, description: true },
      orderBy: { name: 'asc' },
    });
  }

  async getProfessionals(slug: string) {
    const tenant = await this.resolveTenant(slug);
    return this.prisma.professional.findMany({
      where: { tenantId: tenant.id, active: true },
      select: { id: true, name: true, specialty: true },
      orderBy: { name: 'asc' },
    });
  }

  async getAvailableSlots(slug: string, date: string, serviceId: string, professionalId?: string) {
    const tenant = await this.resolveTenant(slug);

    const service = await this.prisma.service.findFirst({
      where: { id: serviceId, tenantId: tenant.id, active: true },
    });
    if (!service) throw new NotFoundException('Serviço não encontrado');

    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();

    const profWhere = professionalId
      ? { id: professionalId, tenantId: tenant.id, active: true }
      : { tenantId: tenant.id, active: true };

    const professionals = await this.prisma.professional.findMany({
      where: profWhere,
      include: {
        schedule: { where: { dayOfWeek } },
        workBreaks: true,
        timeBlocks: { where: { date } },
        appointments: {
          where: {
            scheduledAt: {
              gte: new Date(`${date}T00:00:00`),
              lt: new Date(`${date}T23:59:59`),
            },
            status: { notIn: [AppointmentStatus.CANCELLED] },
          },
          include: { service: true },
        },
      },
    });

    const slots: { time: string; professionalId: string; professionalName: string; dateTime: string }[] = [];

    for (const prof of professionals) {
      if (prof.schedule.length === 0) continue;

      for (const workDay of prof.schedule) {
        const slotTimes = this.generateSlotTimes(workDay.startTime, workDay.endTime, service.duration);

        for (const time of slotTimes) {
          const slotStart = this.parseTime(time);
          const slotEnd = slotStart + service.duration;

          const isBooked = prof.appointments.some((a) => {
            const s = a.scheduledAt.getHours() * 60 + a.scheduledAt.getMinutes();
            return slotStart < s + a.service.duration && slotEnd > s;
          });

          const isBlocked = prof.timeBlocks.some((b) => {
            return slotStart < this.parseTime(b.endTime) && slotEnd > this.parseTime(b.startTime);
          });

          const isOnBreak = prof.workBreaks.some((b) => {
            return slotStart < this.parseTime(b.endTime) && slotEnd > this.parseTime(b.startTime);
          });

          if (!isBooked && !isBlocked && !isOnBreak) {
            slots.push({
              time,
              professionalId: prof.id,
              professionalName: prof.name,
              dateTime: `${date}T${time}:00`,
            });
          }
        }
      }
    }

    return slots.sort((a, b) => a.dateTime.localeCompare(b.dateTime));
  }

  async book(slug: string, data: {
    serviceId: string;
    professionalId: string;
    scheduledAt: string;
    clientName: string;
    clientPhone: string;
    notes?: string;
  }) {
    const tenant = await this.resolveTenant(slug);

    // Find or create contact by phone
    let contact = await this.prisma.contact.findUnique({
      where: { tenantId_phoneNumber: { tenantId: tenant.id, phoneNumber: data.clientPhone } },
    });

    if (!contact) {
      contact = await this.prisma.contact.create({
        data: { tenantId: tenant.id, phoneNumber: data.clientPhone, name: data.clientName },
      });
    } else if (data.clientName && !contact.name) {
      contact = await this.prisma.contact.update({
        where: { id: contact.id },
        data: { name: data.clientName },
      });
    }

    const cancelToken = randomBytes(20).toString('hex');

    const appointment = await this.prisma.appointment.create({
      data: {
        tenantId: tenant.id,
        contactId: contact.id,
        serviceId: data.serviceId,
        professionalId: data.professionalId,
        scheduledAt: new Date(data.scheduledAt),
        notes: data.notes,
        cancelToken,
      },
      include: { service: true, professional: true },
    });

    void this.notifications.scheduleForAppointment({
      id: appointment.id,
      tenantId: tenant.id,
      scheduledAt: appointment.scheduledAt,
      contact: { phoneNumber: contact.phoneNumber, name: contact.name },
      service: appointment.service,
      professional: appointment.professional,
    });

    return {
      id: appointment.id,
      cancelToken: appointment.cancelToken,
      scheduledAt: appointment.scheduledAt,
      service: { name: appointment.service.name, duration: appointment.service.duration },
      professional: { name: appointment.professional.name },
      clientName: contact.name,
      clientPhone: contact.phoneNumber,
    };
  }

  async getByToken(token: string) {
    const appt = await this.prisma.appointment.findUnique({
      where: { cancelToken: token },
      include: { service: true, professional: true, tenant: { select: { name: true, slug: true } } },
    });
    if (!appt) throw new NotFoundException('Agendamento não encontrado');
    return {
      id: appt.id,
      status: appt.status,
      scheduledAt: appt.scheduledAt,
      service: { name: appt.service.name, duration: appt.service.duration },
      professional: { name: appt.professional.name },
      tenant: appt.tenant,
    };
  }

  async cancelByToken(token: string) {
    const appt = await this.prisma.appointment.findUnique({ where: { cancelToken: token } });
    if (!appt) throw new NotFoundException('Agendamento não encontrado');
    if (appt.status === AppointmentStatus.CANCELLED)
      throw new BadRequestException('Agendamento já cancelado');
    if (appt.scheduledAt < new Date())
      throw new BadRequestException('Não é possível cancelar um agendamento passado');

    await this.prisma.appointment.update({
      where: { id: appt.id },
      data: { status: AppointmentStatus.CANCELLED },
    });

    await this.prisma.appointmentNotificationJob.updateMany({
      where: { appointmentId: appt.id, status: 'PENDING' },
      data: { status: 'CANCELLED' },
    });

    return { success: true };
  }

  async rescheduleByToken(token: string, scheduledAt: string, professionalId: string) {
    const appt = await this.prisma.appointment.findUnique({
      where: { cancelToken: token },
      include: { service: true },
    });
    if (!appt) throw new NotFoundException('Agendamento não encontrado');
    if (appt.status === AppointmentStatus.CANCELLED)
      throw new BadRequestException('Não é possível reagendar um agendamento cancelado');
    if (appt.scheduledAt < new Date())
      throw new BadRequestException('Não é possível reagendar um agendamento passado');

    const newDate = new Date(scheduledAt);
    const dateStr = scheduledAt.split('T')[0]!;
    const slots = await this.getAvailableSlots(appt.tenantId, dateStr, appt.serviceId, professionalId);
    const slotTime = `${String(newDate.getHours()).padStart(2, '0')}:${String(newDate.getMinutes()).padStart(2, '0')}`;
    const available = slots.some((s) => s.time === slotTime && s.professionalId === professionalId);
    if (!available) throw new BadRequestException('Horário não disponível');

    await this.prisma.appointment.update({
      where: { id: appt.id },
      data: { scheduledAt: newDate, professionalId, status: AppointmentStatus.PENDING },
    });

    await this.prisma.appointmentNotificationJob.updateMany({
      where: { appointmentId: appt.id, status: 'PENDING' },
      data: { status: 'CANCELLED' },
    });

    return { success: true };
  }

  private resolveSlug(tenantId: string) {
    return this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { slug: true } })
      .then((t) => t?.slug ?? tenantId);
  }

  private generateSlotTimes(startTime: string, endTime: string, duration: number): string[] {
    const slots: string[] = [];
    let current = this.parseTime(startTime);
    const end = this.parseTime(endTime);
    while (current + duration <= end) {
      slots.push(this.formatTime(current));
      current += duration;
    }
    return slots;
  }

  private parseTime(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return (h ?? 0) * 60 + (m ?? 0);
  }

  private formatTime(minutes: number): string {
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }
}
