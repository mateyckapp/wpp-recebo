import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AppointmentNotificationType,
  AppointmentNotificationJobStatus,
  AppointmentStatus,
} from '@prisma/client';
import axios from 'axios';

const WA_API = 'https://graph.facebook.com/v21.0';

interface NotificationParams {
  clientName: string;
  serviceName: string;
  professionalName: string;
  date: string;
  time: string;
}

const DEFAULT_CONFIG = {
  confirmationEnabled: true,
  confirmationDelayMinutes: 2,
  confirmationTemplate: 'appointment_confirmation',
  reminder2dEnabled: true,
  reminder2dTemplate: 'appointment_reminder_2d',
  reminder1dEnabled: true,
  reminder1dTemplate: 'appointment_reminder_1d',
  reminder2hEnabled: true,
  reminder2hTemplate: 'appointment_reminder_2h',
  reminder1hEnabled: true,
  reminder1hTemplate: 'appointment_reminder_1h',
};

@Injectable()
export class AgendaNotificationsService {
  private readonly logger = new Logger(AgendaNotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ── Config ────────────────────────────────────────────────────────────────

  async getConfig(tenantId: string) {
    const config = await this.prisma.appointmentNotificationConfig.findUnique({
      where: { tenantId },
    });
    return config ?? { tenantId, id: '', updatedAt: new Date(), ...DEFAULT_CONFIG };
  }

  async upsertConfig(
    tenantId: string,
    data: Partial<{
      confirmationEnabled: boolean;
      confirmationDelayMinutes: number;
      confirmationTemplate: string;
      reminder2dEnabled: boolean;
      reminder2dTemplate: string;
      reminder1dEnabled: boolean;
      reminder1dTemplate: string;
      reminder2hEnabled: boolean;
      reminder2hTemplate: string;
      reminder1hEnabled: boolean;
      reminder1hTemplate: string;
    }>,
  ) {
    return this.prisma.appointmentNotificationConfig.upsert({
      where: { tenantId },
      create: { tenantId, ...DEFAULT_CONFIG, ...data },
      update: data,
    });
  }

  // ── Scheduling ────────────────────────────────────────────────────────────

  async scheduleForAppointment(appointment: {
    id: string;
    tenantId: string;
    scheduledAt: Date;
    contact: { phoneNumber: string; name: string | null };
    service: { name: string };
    professional: { name: string };
  }) {
    const config = await this.getConfig(appointment.tenantId);
    const now = new Date();
    const scheduledAt = appointment.scheduledAt;
    const BUFFER_MS = 5 * 60 * 1000;

    const params: NotificationParams = {
      clientName: appointment.contact.name ?? appointment.contact.phoneNumber,
      serviceName: appointment.service.name,
      professionalName: appointment.professional.name,
      date: scheduledAt.toLocaleDateString('pt-PT', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
      time: scheduledAt.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
    };

    const jobs: Array<{
      tenantId: string;
      appointmentId: string;
      type: AppointmentNotificationType;
      scheduledAt: Date;
      phoneNumber: string;
      templateName: string;
      params: NotificationParams;
    }> = [];

    if (config.confirmationEnabled) {
      jobs.push({
        tenantId: appointment.tenantId,
        appointmentId: appointment.id,
        type: AppointmentNotificationType.CONFIRMATION,
        scheduledAt: new Date(now.getTime() + config.confirmationDelayMinutes * 60 * 1000),
        phoneNumber: appointment.contact.phoneNumber,
        templateName: config.confirmationTemplate,
        params,
      });
    }

    const fire2d = new Date(scheduledAt.getTime() - 48 * 60 * 60 * 1000);
    if (config.reminder2dEnabled && fire2d.getTime() > now.getTime() + BUFFER_MS) {
      jobs.push({
        tenantId: appointment.tenantId,
        appointmentId: appointment.id,
        type: AppointmentNotificationType.REMINDER_2D,
        scheduledAt: fire2d,
        phoneNumber: appointment.contact.phoneNumber,
        templateName: config.reminder2dTemplate,
        params,
      });
    }

    const fire1d = new Date(scheduledAt.getTime() - 24 * 60 * 60 * 1000);
    if (config.reminder1dEnabled && fire1d.getTime() > now.getTime() + BUFFER_MS) {
      jobs.push({
        tenantId: appointment.tenantId,
        appointmentId: appointment.id,
        type: AppointmentNotificationType.REMINDER_1D,
        scheduledAt: fire1d,
        phoneNumber: appointment.contact.phoneNumber,
        templateName: config.reminder1dTemplate,
        params,
      });
    }

    const fire2h = new Date(scheduledAt.getTime() - 2 * 60 * 60 * 1000);
    if (config.reminder2hEnabled && fire2h.getTime() > now.getTime() + BUFFER_MS) {
      jobs.push({
        tenantId: appointment.tenantId,
        appointmentId: appointment.id,
        type: AppointmentNotificationType.REMINDER_2H,
        scheduledAt: fire2h,
        phoneNumber: appointment.contact.phoneNumber,
        templateName: config.reminder2hTemplate,
        params,
      });
    }

    const fire1h = new Date(scheduledAt.getTime() - 60 * 60 * 1000);
    if (config.reminder1hEnabled && fire1h.getTime() > now.getTime() + BUFFER_MS) {
      jobs.push({
        tenantId: appointment.tenantId,
        appointmentId: appointment.id,
        type: AppointmentNotificationType.REMINDER_1H,
        scheduledAt: fire1h,
        phoneNumber: appointment.contact.phoneNumber,
        templateName: config.reminder1hTemplate,
        params,
      });
    }

    if (jobs.length > 0) {
      await this.prisma.appointmentNotificationJob.createMany({
        data: jobs.map((j) => ({ ...j, params: j.params as object })),
      });
      this.logger.log(`Agendadas ${jobs.length} notificações para agendamento ${appointment.id}`);
    }
  }

  async cancelForAppointment(appointmentId: string) {
    const result = await this.prisma.appointmentNotificationJob.updateMany({
      where: { appointmentId, status: AppointmentNotificationJobStatus.PENDING },
      data: { status: AppointmentNotificationJobStatus.CANCELLED },
    });
    if (result.count > 0) {
      this.logger.log(`Canceladas ${result.count} notificações do agendamento ${appointmentId}`);
    }
  }

  // ── Cron processor ────────────────────────────────────────────────────────

  @Cron(CronExpression.EVERY_MINUTE)
  async processDueJobs() {
    const jobs = await this.prisma.appointmentNotificationJob.findMany({
      where: {
        status: AppointmentNotificationJobStatus.PENDING,
        scheduledAt: { lte: new Date() },
      },
      take: 50,
    });

    for (const job of jobs) {
      await this.processJob(job);
    }
  }

  private async processJob(job: {
    id: string;
    tenantId: string;
    appointmentId: string;
    type: AppointmentNotificationType;
    phoneNumber: string;
    templateName: string;
    params: unknown;
  }) {
    try {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id: job.appointmentId },
        select: { status: true },
      });

      if (!appointment || appointment.status === AppointmentStatus.CANCELLED) {
        await this.prisma.appointmentNotificationJob.update({
          where: { id: job.id },
          data: { status: AppointmentNotificationJobStatus.CANCELLED },
        });
        return;
      }

      const tenant = await this.prisma.tenant.findUnique({
        where: { id: job.tenantId },
        select: { whatsappPhoneNumberId: true, whatsappAccessToken: true },
      });

      if (!tenant?.whatsappPhoneNumberId || !tenant.whatsappAccessToken) {
        this.logger.warn(`Tenant ${job.tenantId} sem credenciais WhatsApp`);
        await this.prisma.appointmentNotificationJob.update({
          where: { id: job.id },
          data: { status: AppointmentNotificationJobStatus.FAILED },
        });
        return;
      }

      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentMessage = await this.prisma.message.findFirst({
        where: {
          tenantId: job.tenantId,
          direction: 'INBOUND',
          createdAt: { gte: twentyFourHoursAgo },
          conversation: { contact: { phoneNumber: job.phoneNumber } },
        },
        select: { id: true },
      });

      const params = job.params as NotificationParams;
      const phone = job.phoneNumber.replace(/\D/g, '');

      if (recentMessage) {
        await this.sendText(
          tenant.whatsappPhoneNumberId,
          phone,
          this.buildFreeformText(job.type, params),
          tenant.whatsappAccessToken,
        );
      } else {
        await this.sendTemplate(
          tenant.whatsappPhoneNumberId,
          phone,
          job.templateName,
          [params.clientName, params.serviceName, params.professionalName, params.date, params.time],
          tenant.whatsappAccessToken,
        );
      }

      await this.prisma.appointmentNotificationJob.update({
        where: { id: job.id },
        data: { status: AppointmentNotificationJobStatus.SENT, sentAt: new Date() },
      });
    } catch (err) {
      this.logger.error(`Erro ao processar notificação ${job.id}: ${String(err)}`);
      await this.prisma.appointmentNotificationJob.update({
        where: { id: job.id },
        data: { status: AppointmentNotificationJobStatus.FAILED },
      });
    }
  }

  // ── WhatsApp HTTP helpers ─────────────────────────────────────────────────

  private async sendText(phoneNumberId: string, to: string, text: string, token: string) {
    await axios.post(
      `${WA_API}/${phoneNumberId}/messages`,
      { messaging_product: 'whatsapp', recipient_type: 'individual', to, type: 'text', text: { body: text, preview_url: false } },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } },
    );
  }

  private async sendTemplate(phoneNumberId: string, to: string, templateName: string, parameters: string[], token: string) {
    await axios.post(
      `${WA_API}/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'pt_PT' },
          components: [{ type: 'body', parameters: parameters.map((text) => ({ type: 'text', text })) }],
        },
      },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } },
    );
  }

  private buildFreeformText(type: AppointmentNotificationType, p: NotificationParams): string {
    const base = `*Serviço:* ${p.serviceName}\n*Profissional:* ${p.professionalName}\n*Data:* ${p.date}\n*Hora:* ${p.time}`;
    switch (type) {
      case AppointmentNotificationType.CONFIRMATION:
        return `Olá ${p.clientName}! 👋\n\nO seu agendamento foi confirmado:\n\n${base}\n\nAté já! 😊`;
      case AppointmentNotificationType.REMINDER_2D:
        return `Olá ${p.clientName}! 👋\n\nLembramos que tem um agendamento *daqui a 2 dias*:\n\n${base}\n\nAté já! 😊`;
      case AppointmentNotificationType.REMINDER_1D:
        return `Olá ${p.clientName}! 👋\n\nLembramos que tem um agendamento *amanhã*:\n\n${base}\n\nAté já! 😊`;
      case AppointmentNotificationType.REMINDER_2H:
        return `Olá ${p.clientName}! 👋\n\nLembramos que tem um agendamento *daqui a 2 horas*:\n\n${base}\n\nAté já! 😊`;
      case AppointmentNotificationType.REMINDER_1H:
        return `Olá ${p.clientName}! 👋\n\nLembramos que tem um agendamento *daqui a 1 hora*:\n\n${base}\n\nAté já! 😊`;
    }
  }
}
