import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OutboundWebhooksService } from '../outbound-webhooks/outbound-webhooks.service';

@Injectable()
export class ConversationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outboundWebhooks: OutboundWebhooksService,
  ) {}

  async findAll(
    tenantId: string,
    options: { status?: string; search?: string; page: number; limit: number },
  ) {
    const { status, search, page, limit } = options;

    const where = {
      tenantId,
      ...(status ? { status: status as 'OPEN' | 'CLOSED' | 'ARCHIVED' } : {}),
      ...(search
        ? {
            OR: [
              { contact: { name: { contains: search, mode: 'insensitive' as const } } },
              { contact: { phoneNumber: { contains: search } } },
            ],
          }
        : {}),
    };

    const [total, rows] = await Promise.all([
      this.prisma.conversation.count({ where }),
      this.prisma.conversation.findMany({
        where,
        orderBy: { lastMessageAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          contact: true,
          assignedUser: { select: { id: true, name: true } },
          kanbanColumn: { select: { id: true, name: true, color: true } },
          tags: { include: { tag: { select: { id: true, name: true, color: true } } } },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { content: true, type: true, direction: true, createdAt: true },
          },
        },
      }),
    ]);

    return {
      items: rows.map((conv) => ({
        ...conv,
        tags: conv.tags.map((t) => t.tag),
        lastMessage: conv.messages[0] ?? null,
        messages: undefined,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, tenantId: string) {
    const conv = await this.prisma.conversation.findFirst({
      where: { id, tenantId },
      include: {
        contact: true,
        assignedUser: { select: { id: true, name: true } },
        kanbanColumn: { select: { id: true, name: true, color: true } },
        tags: { include: { tag: { select: { id: true, name: true, color: true } } } },
      },
    });

    if (!conv) throw new NotFoundException('Conversa não encontrada');

    return {
      ...conv,
      tags: conv.tags.map((t) => t.tag),
    };
  }

  async markAsRead(id: string, tenantId: string) {
    return this.prisma.conversation.update({
      where: { id, tenantId },
      data: { unreadCount: 0 },
      select: { id: true, unreadCount: true },
    });
  }

  async updateStatus(id: string, tenantId: string, status: string) {
    const updated = await this.prisma.conversation.update({
      where: { id, tenantId },
      data: { status: status as 'OPEN' | 'CLOSED' | 'ARCHIVED' },
      select: { id: true, status: true },
    });

    if (status === 'CLOSED') {
      void this.outboundWebhooks.dispatch({
        event: 'conversation.resolved',
        tenantId,
        data: { conversation: { id, resolvedAt: new Date() } },
      });
    }

    return updated;
  }
}
