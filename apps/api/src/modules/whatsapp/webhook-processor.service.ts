import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WhatsappService } from './whatsapp.service';
import { AiService } from '../ai/ai.service';
import type {
  WhatsappWebhookPayload,
  WhatsappMessage,
  WhatsappStatus,
  WhatsappContact,
} from './types/webhook.types';
import { MessageDirection, MessageStatus, MessageType } from '@prisma/client';

@Injectable()
export class WebhookProcessorService {
  private readonly logger = new Logger(WebhookProcessorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsapp: WhatsappService,
    private readonly ai: AiService,
  ) {}

  async process(payload: WhatsappWebhookPayload): Promise<void> {
    if (payload.object !== 'whatsapp_business_account') return;

    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        if (change.field !== 'messages') continue;

        const { value } = change;
        const phoneNumberId = value.metadata.phone_number_id;

        const tenant = await this.prisma.tenant.findFirst({
          where: { whatsappPhoneNumberId: phoneNumberId },
          select: { id: true, whatsappAccessToken: true },
        });

        if (!tenant) {
          this.logger.warn(`Tenant não encontrado para phoneNumberId: ${phoneNumberId}`);
          continue;
        }

        // Processar mensagens recebidas
        if (value.messages?.length) {
          for (const message of value.messages) {
            const contact = value.contacts?.find((c) => c.wa_id === message.from);
            await this.processIncomingMessage(tenant.id, phoneNumberId, message, contact, tenant.whatsappAccessToken ?? '');
          }
        }

        // Processar atualizações de status
        if (value.statuses?.length) {
          for (const status of value.statuses) {
            await this.processStatusUpdate(status);
          }
        }
      }
    }
  }

  // ─── Mensagem recebida ────────────────────────────────────────────────────

  private async processIncomingMessage(
    tenantId: string,
    phoneNumberId: string,
    message: WhatsappMessage,
    contactInfo: WhatsappContact | undefined,
    accessToken: string,
  ): Promise<void> {
    try {
      const phoneNumber = this.whatsapp.toE164(message.from);

      // 1. Criar ou atualizar contacto
      const contact = await this.prisma.contact.upsert({
        where: { tenantId_phoneNumber: { tenantId, phoneNumber } },
        update: {
          lastInteraction: new Date(),
          ...(contactInfo?.profile.name ? { name: contactInfo.profile.name } : {}),
        },
        create: {
          tenantId,
          phoneNumber,
          name: contactInfo?.profile.name,
          lastInteraction: new Date(),
        },
      });

      // 2. Encontrar conversa aberta ou criar nova
      const defaultColumn = await this.prisma.kanbanColumn.findFirst({
        where: { tenantId, isDefault: true },
        orderBy: { position: 'asc' },
      });

      if (!defaultColumn) {
        this.logger.error(`Tenant ${tenantId} não tem coluna Kanban padrão`);
        return;
      }

      let conversation = await this.prisma.conversation.findFirst({
        where: { tenantId, contactId: contact.id, status: 'OPEN' },
        orderBy: { createdAt: 'desc' },
      });

      if (!conversation) {
        conversation = await this.prisma.conversation.create({
          data: {
            tenantId,
            contactId: contact.id,
            kanbanColumnId: defaultColumn.id,
            status: 'OPEN',
          },
        });
        this.logger.log(`Nova conversa criada: ${conversation.id}`);
      }

      // 3. Guardar mensagem
      const { type, content } = this.extractMessageContent(message);

      await this.prisma.message.create({
        data: {
          tenantId,
          conversationId: conversation.id,
          whatsappId: message.id,
          direction: MessageDirection.INBOUND,
          type,
          content,
          status: MessageStatus.DELIVERED,
        },
      });

      // 4. Atualizar última mensagem da conversa
      await this.prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: new Date(),
          unreadCount: { increment: 1 },
        },
      });

      // 5. Marcar como lida no WhatsApp
      await this.whatsapp.markAsRead(phoneNumberId, message.id, accessToken);

      // 6. Auto-reply com IA (apenas para mensagens de texto)
      if (type === MessageType.TEXT && content) {
        await this.triggerAiReply(tenantId, conversation.id, contact.id, phoneNumber, phoneNumberId, content, accessToken);
      }

      this.logger.log(`Mensagem processada: ${message.id} (${type}) de ${phoneNumber}`);
    } catch (err) {
      this.logger.error(`Erro ao processar mensagem ${message.id}: ${String(err)}`);
    }
  }

  // ─── Auto-reply com IA ────────────────────────────────────────────────────

  private async triggerAiReply(
    tenantId: string,
    conversationId: string,
    contactId: string,
    toPhone: string,
    phoneNumberId: string,
    incomingText: string,
    accessToken: string,
  ): Promise<void> {
    try {
      // Plano START não tem acesso à IA
      const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { plan: true } });
      if (!tenant || tenant.plan === 'START') return;

      // Buscar histórico recente (50 mensagens) para contexto
      const recentMessages = await this.prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        take: 50,
        select: { direction: true, content: true },
      });

      const result = await this.ai.generateReply(
        tenantId,
        conversationId,
        incomingText,
        recentMessages.map((m) => ({ direction: m.direction, content: m.content })),
        { contactId },
      );

      if (!result) return; // IA desactivada ou erro

      // Enviar resposta via WhatsApp
      const waMessageId = await this.whatsapp.sendTextMessage(
        phoneNumberId,
        toPhone,
        result.reply,
        accessToken,
      );

      // Guardar mensagem de resposta da IA na base de dados
      await this.prisma.message.create({
        data: {
          tenantId,
          conversationId,
          whatsappId: waMessageId,
          direction: MessageDirection.OUTBOUND,
          type: MessageType.TEXT,
          content: result.reply,
          sentByAI: true,
          status: MessageStatus.SENT,
        },
      });

      await this.prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      });

      this.logger.log(`IA respondeu à conversa ${conversationId} (${result.tokensInput}+${result.tokensOutput} tokens)`);
    } catch (err) {
      this.logger.error(`Erro no auto-reply IA para conversa ${conversationId}: ${String(err)}`);
    }
  }

  // ─── Atualização de status ────────────────────────────────────────────────

  private async processStatusUpdate(status: WhatsappStatus): Promise<void> {
    const statusMap: Record<string, MessageStatus> = {
      sent: MessageStatus.SENT,
      delivered: MessageStatus.DELIVERED,
      read: MessageStatus.READ,
      failed: MessageStatus.FAILED,
    };

    const newStatus = statusMap[status.status];
    if (!newStatus) return;

    try {
      await this.prisma.message.updateMany({
        where: { whatsappId: status.id },
        data: { status: newStatus },
      });
    } catch (err) {
      this.logger.warn(`Erro ao atualizar status da mensagem ${status.id}: ${String(err)}`);
    }
  }

  // ─── Helper: extrai conteúdo da mensagem ──────────────────────────────────

  private extractMessageContent(message: WhatsappMessage): {
    type: MessageType;
    content: string | null;
  } {
    switch (message.type) {
      case 'text':
        return { type: MessageType.TEXT, content: message.text?.body ?? null };
      case 'image':
        return { type: MessageType.IMAGE, content: message.image?.caption ?? null };
      case 'audio':
        return { type: MessageType.AUDIO, content: null };
      case 'video':
        return { type: MessageType.VIDEO, content: message.video?.caption ?? null };
      case 'document':
        return {
          type: MessageType.DOCUMENT,
          content: message.document?.caption ?? message.document?.filename ?? null,
        };
      case 'location':
        return {
          type: MessageType.LOCATION,
          content: message.location
            ? `${message.location.latitude},${message.location.longitude}`
            : null,
        };
      default:
        return { type: MessageType.TEXT, content: `[${message.type}]` };
    }
  }
}
