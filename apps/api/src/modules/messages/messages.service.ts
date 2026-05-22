import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { MessageDirection, MessageStatus, MessageType } from '@prisma/client';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsapp: WhatsappService,
    private readonly ws: WebsocketGateway,
  ) {}

  async getMessages(conversationId: string, tenantId: string, cursor?: string, limit = 30) {
    const conv = await this.prisma.conversation.findFirst({
      where: { id: conversationId, tenantId },
      select: { id: true },
    });
    if (!conv) throw new NotFoundException('Conversa não encontrada');

    const messages = await this.prisma.message.findMany({
      where: { conversationId, tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id: true,
        direction: true,
        type: true,
        content: true,
        mediaUrl: true,
        status: true,
        sentByAI: true,
        createdAt: true,
        sentByUser: { select: { id: true, name: true } },
      },
    });

    const hasMore = messages.length > limit;
    const items = hasMore ? messages.slice(0, limit) : messages;
    const nextCursor = hasMore ? items[items.length - 1]?.id : null;

    return { items: items.reverse(), nextCursor, hasMore };
  }

  async sendMessage(
    conversationId: string,
    tenantId: string,
    userId: string,
    text: string,
  ) {
    const conv = await this.prisma.conversation.findFirst({
      where: { id: conversationId, tenantId },
      include: {
        contact: { select: { phoneNumber: true } },
        tenant: {
          select: {
            whatsappPhoneNumberId: true,
            whatsappAccessToken: true,
          },
        },
      },
    });

    if (!conv) throw new NotFoundException('Conversa não encontrada');

    const { whatsappPhoneNumberId, whatsappAccessToken } = conv.tenant;
    if (!whatsappPhoneNumberId || !whatsappAccessToken) {
      throw new BadRequestException('WhatsApp não configurado para este tenant');
    }

    const whatsappId = await this.whatsapp.sendTextMessage(
      whatsappPhoneNumberId,
      conv.contact.phoneNumber,
      text,
      whatsappAccessToken,
    );

    const message = await this.prisma.message.create({
      data: {
        tenantId,
        conversationId,
        whatsappId,
        direction: MessageDirection.OUTBOUND,
        type: MessageType.TEXT,
        content: text,
        status: MessageStatus.SENT,
        sentByUserId: userId,
      },
      select: {
        id: true,
        direction: true,
        type: true,
        content: true,
        mediaUrl: true,
        status: true,
        sentByAI: true,
        createdAt: true,
        sentByUser: { select: { id: true, name: true } },
      },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    this.ws.emitToTenant(tenantId, 'new_message', { conversationId, message });
    this.ws.emitToTenant(tenantId, 'conversation_updated', {
      conversationId,
      unreadCount: 0,
      lastMessageAt: new Date(),
    });

    return message;
  }
}
