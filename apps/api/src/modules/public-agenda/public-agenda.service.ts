import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class PublicAgendaService {
  constructor(private readonly prisma: PrismaService) {}

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

    const appointment = await this.prisma.appointment.create({
      data: {
        tenantId: tenant.id,
        contactId: contact.id,
        serviceId: data.serviceId,
        professionalId: data.professionalId,
        scheduledAt: new Date(data.scheduledAt),
        notes: data.notes,
      },
      include: { service: true, professional: true },
    });

    return {
      id: appointment.id,
      scheduledAt: appointment.scheduledAt,
      service: { name: appointment.service.name, duration: appointment.service.duration },
      professional: { name: appointment.professional.name },
      clientName: contact.name,
      clientPhone: contact.phoneNumber,
    };
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
