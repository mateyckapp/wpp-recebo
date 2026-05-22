import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppointmentStatus } from '@prisma/client';

export interface AvailableSlot {
  time: string; // "10:00"
  professionalId: string;
  professionalName: string;
  dateTime: string; // ISO string
}

@Injectable()
export class AgendaService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Services ──────────────────────────────────────────────────────────────

  async getServices(tenantId: string) {
    return this.prisma.service.findMany({
      where: { tenantId, active: true },
      orderBy: { name: 'asc' },
    });
  }

  async createService(tenantId: string, data: { name: string; duration: number; price?: number; description?: string }) {
    return this.prisma.service.create({ data: { tenantId, ...data } });
  }

  async updateService(id: string, tenantId: string, data: Partial<{ name: string; duration: number; price: number; description: string; active: boolean }>) {
    return this.prisma.service.update({ where: { id, tenantId }, data });
  }

  async deleteService(id: string, tenantId: string) {
    return this.prisma.service.update({ where: { id, tenantId }, data: { active: false } });
  }

  // ── Professionals ─────────────────────────────────────────────────────────

  async getProfessionals(tenantId: string) {
    return this.prisma.professional.findMany({
      where: { tenantId, active: true },
      include: { schedule: true },
      orderBy: { name: 'asc' },
    });
  }

  async createProfessional(tenantId: string, data: { name: string; specialty?: string }) {
    return this.prisma.professional.create({ data: { tenantId, ...data } });
  }

  async updateProfessional(id: string, tenantId: string, data: Partial<{ name: string; specialty: string; active: boolean }>) {
    return this.prisma.professional.update({ where: { id, tenantId }, data });
  }

  // ── Work Breaks ───────────────────────────────────────────────────────────

  async getWorkBreaks(professionalId: string) {
    return this.prisma.workBreak.findMany({
      where: { professionalId },
      orderBy: { startTime: 'asc' },
    });
  }

  async createWorkBreak(data: { professionalId: string; startTime: string; endTime: string; label?: string }) {
    return this.prisma.workBreak.create({ data });
  }

  async deleteWorkBreak(id: string, professionalId: string) {
    return this.prisma.workBreak.delete({ where: { id, professionalId } });
  }

  // ── Time Blocks ───────────────────────────────────────────────────────────

  async getTimeBlocks(professionalId: string, date?: string) {
    return this.prisma.timeBlock.findMany({
      where: { professionalId, ...(date ? { date } : {}) },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }

  async createTimeBlock(data: { professionalId: string; date: string; startTime: string; endTime: string; reason?: string }) {
    return this.prisma.timeBlock.create({ data });
  }

  async deleteTimeBlock(id: string, professionalId: string) {
    return this.prisma.timeBlock.delete({ where: { id, professionalId } });
  }

  // ── Work Schedule ─────────────────────────────────────────────────────────

  async upsertSchedule(professionalId: string, schedule: Array<{ dayOfWeek: number; startTime: string; endTime: string }>) {
    await this.prisma.workSchedule.deleteMany({ where: { professionalId } });
    if (schedule.length > 0) {
      await this.prisma.workSchedule.createMany({
        data: schedule.map((s) => ({ professionalId, dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime })),
      });
    }
  }

  // ── Available Slots ───────────────────────────────────────────────────────

  async getAvailableSlots(tenantId: string, date: string, serviceId: string, professionalId?: string): Promise<AvailableSlot[]> {
    const service = await this.prisma.service.findFirst({ where: { id: serviceId, tenantId, active: true } });
    if (!service) throw new NotFoundException('Serviço não encontrado');

    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();

    const profWhere = professionalId
      ? { id: professionalId, tenantId, active: true }
      : { tenantId, active: true };

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

    const slots: AvailableSlot[] = [];

    for (const prof of professionals) {
      if (prof.schedule.length === 0) continue;

      for (const workDay of prof.schedule) {
        const slotTimes = this.generateSlotTimes(workDay.startTime, workDay.endTime, service.duration);

        for (const time of slotTimes) {
          const slotStart = this.parseTime(time);
          const slotEnd = slotStart + service.duration;

          const isBooked = prof.appointments.some((appt) => {
            const apptStart = appt.scheduledAt.getHours() * 60 + appt.scheduledAt.getMinutes();
            const apptEnd = apptStart + appt.service.duration;
            return slotStart < apptEnd && slotEnd > apptStart;
          });

          const isBlocked = prof.timeBlocks.some((block) => {
            const blockStart = this.parseTime(block.startTime);
            const blockEnd = this.parseTime(block.endTime);
            return slotStart < blockEnd && slotEnd > blockStart;
          });

          const isOnBreak = prof.workBreaks.some((br) => {
            const brStart = this.parseTime(br.startTime);
            const brEnd = this.parseTime(br.endTime);
            return slotStart < brEnd && slotEnd > brStart;
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

  private generateSlotTimes(startTime: string, endTime: string, durationMin: number): string[] {
    const slots: string[] = [];
    let current = this.parseTime(startTime);
    const end = this.parseTime(endTime);
    while (current + durationMin <= end) {
      slots.push(this.formatTime(current));
      current += durationMin;
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

  // ── Appointments ──────────────────────────────────────────────────────────

  async createAppointment(data: {
    tenantId: string;
    contactId: string;
    conversationId?: string;
    serviceId: string;
    professionalId: string;
    scheduledAt: string; // ISO string or "YYYY-MM-DDTHH:mm:00"
    notes?: string;
  }) {
    return this.prisma.appointment.create({
      data: {
        tenantId: data.tenantId,
        contactId: data.contactId,
        conversationId: data.conversationId,
        serviceId: data.serviceId,
        professionalId: data.professionalId,
        scheduledAt: new Date(data.scheduledAt),
        notes: data.notes,
      },
      include: { service: true, professional: true, contact: true },
    });
  }

  async getAppointments(tenantId: string, filters?: { date?: string; startDate?: string; endDate?: string; status?: AppointmentStatus; professionalId?: string }) {
    const where: Record<string, unknown> = { tenantId };

    if (filters?.startDate && filters?.endDate) {
      where['scheduledAt'] = {
        gte: new Date(filters.startDate),
        lt: new Date(filters.endDate),
      };
    } else if (filters?.date) {
      where['scheduledAt'] = {
        gte: new Date(`${filters.date}T00:00:00`),
        lt: new Date(`${filters.date}T23:59:59`),
      };
    }
    if (filters?.status) where['status'] = filters.status;
    if (filters?.professionalId) where['professionalId'] = filters.professionalId;

    return this.prisma.appointment.findMany({
      where,
      include: { service: true, professional: true, contact: true },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async getContactAppointments(tenantId: string, contactId: string) {
    return this.prisma.appointment.findMany({
      where: { tenantId, contactId },
      include: { service: true, professional: true },
      orderBy: { scheduledAt: 'desc' },
      take: 10,
    });
  }

  async updateAppointmentStatus(id: string, tenantId: string, status: AppointmentStatus) {
    return this.prisma.appointment.update({
      where: { id, tenantId },
      data: { status },
      include: { service: true, professional: true, contact: true },
    });
  }

  async hasAgenda(tenantId: string): Promise<boolean> {
    const count = await this.prisma.service.count({ where: { tenantId, active: true } });
    return count > 0;
  }
}
