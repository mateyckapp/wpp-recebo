import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { MessageDirection, MessageStatus, MessageType, ScheduledStatus } from '@prisma/client';

@Injectable()
export class ScheduledMessagesService {
  private readonly logger = new Logger(ScheduledMessagesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsapp: WhatsappService,
  ) {}

  async findAll(tenantId: string) {
    return this.prisma.scheduledMessage.findMany({
      where: { tenantId },
      orderBy: { scheduledFor: 'asc' },
    });
  }

  async create(tenantId: string, conversationId: string, content: string, scheduledFor: Date) {
    if (scheduledFor <= new Date()) {
      throw new BadRequestException('A data de agendamento deve ser no futuro');
    }

    const conv = await this.prisma.conversation.findFirst({
      where: { id: conversationId, tenantId },
    });
    if (!conv) throw new NotFoundException('Conversa não encontrada');

    return this.prisma.scheduledMessage.create({
      data: { tenantId, conversationId, content, scheduledFor },
    });
  }

  async cancel(id: string, tenantId: string) {
    const msg = await this.prisma.scheduledMessage.findFirst({
      where: { id, tenantId },
    });
    if (!msg) throw new NotFoundException('Mensagem agendada não encontrada');
    if (msg.status !== ScheduledStatus.PENDING) {
      throw new BadRequestException('Só é possível cancelar mensagens pendentes');
    }

    return this.prisma.scheduledMessage.update({
      where: { id },
      data: { status: ScheduledStatus.CANCELLED },
    });
  }

  // ─── Cron: corre a cada minuto ────────────────────────────────────────────

  @Cron(CronExpression.EVERY_MINUTE)
  async processPending(): Promise<void> {
    const pending = await this.prisma.scheduledMessage.findMany({
      where: {
        status: ScheduledStatus.PENDING,
        scheduledFor: { lte: new Date() },
      },
      include: {
        tenant: {
          select: {
            whatsappPhoneNumberId: true,
            whatsappAccessToken: true,
          },
        },
      },
      // sem filtro por tenantId — o middleware não corre aqui
    });

    for (const scheduled of pending) {
      await this.sendScheduled(scheduled);
    }
  }

  private async sendScheduled(
    scheduled: Awaited<ReturnType<typeof this.prisma.scheduledMessage.findFirst>> & {
      tenant: { whatsappPhoneNumberId: string | null; whatsappAccessToken: string | null };
    },
  ): Promise<void> {
    if (!scheduled) return;

    try {
      const conv = await this.prisma.conversation.findFirst({
        where: { id: scheduled.conversationId },
        include: { contact: { select: { phoneNumber: true } } },
      });

      if (!conv) throw new Error('Conversa não encontrada');

      const { whatsappPhoneNumberId, whatsappAccessToken } = scheduled.tenant;
      if (!whatsappPhoneNumberId || !whatsappAccessToken) {
        throw new Error('WhatsApp não configurado');
      }

      const whatsappId = await this.whatsapp.sendTextMessage(
        whatsappPhoneNumberId,
        conv.contact.phoneNumber,
        scheduled.content,
        whatsappAccessToken,
      );

      await this.prisma.$transaction([
        this.prisma.scheduledMessage.update({
          where: { id: scheduled.id },
          data: { status: ScheduledStatus.SENT },
        }),
        this.prisma.message.create({
          data: {
            tenantId: scheduled.tenantId,
            conversationId: scheduled.conversationId,
            whatsappId,
            direction: MessageDirection.OUTBOUND,
            type: MessageType.TEXT,
            content: scheduled.content,
            status: MessageStatus.SENT,
          },
        }),
        this.prisma.conversation.update({
          where: { id: scheduled.conversationId },
          data: { lastMessageAt: new Date() },
        }),
      ]);

      this.logger.log(`Mensagem agendada ${scheduled.id} enviada com sucesso`);
    } catch (err) {
      this.logger.error(`Falha ao enviar mensagem agendada ${scheduled.id}: ${String(err)}`);
      await this.prisma.scheduledMessage.update({
        where: { id: scheduled.id },
        data: { status: ScheduledStatus.FAILED },
      });
    }
  }
}
