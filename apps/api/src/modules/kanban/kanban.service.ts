import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class KanbanService {
  constructor(private readonly prisma: PrismaService) {}

  async getBoard(tenantId: string) {
    const columns = await this.prisma.kanbanColumn.findMany({
      where: { tenantId },
      orderBy: { position: 'asc' },
      include: {
        conversations: {
          where: { status: 'OPEN' },
          orderBy: { lastMessageAt: 'desc' },
          include: {
            contact: {
              select: { id: true, name: true, phoneNumber: true, avatarUrl: true },
            },
            assignedUser: {
              select: { id: true, name: true },
            },
            tags: {
              include: {
                tag: { select: { id: true, name: true, color: true } },
              },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: { content: true, type: true, direction: true, createdAt: true },
            },
          },
        },
      },
    });

    return columns.map((col) => ({
      id: col.id,
      name: col.name,
      color: col.color,
      position: col.position,
      isDefault: col.isDefault,
      conversations: col.conversations.map((conv) => ({
        id: conv.id,
        status: conv.status,
        unreadCount: conv.unreadCount,
        lastMessageAt: conv.lastMessageAt,
        estimatedValue: conv.estimatedValue,
        aiEnabled: conv.aiEnabled,
        contact: conv.contact,
        assignedUser: conv.assignedUser,
        tags: conv.tags.map((t) => t.tag),
        lastMessage: conv.messages[0] ?? null,
      })),
    }));
  }

  async moveConversation(conversationId: string, columnId: string, tenantId: string) {
    return this.prisma.conversation.update({
      where: { id: conversationId, tenantId },
      data: { kanbanColumnId: columnId },
      select: { id: true, kanbanColumnId: true },
    });
  }

  // ── Column CRUD ───────────────────────────────────────────────────────────

  async getColumns(tenantId: string) {
    return this.prisma.kanbanColumn.findMany({
      where: { tenantId },
      orderBy: { position: 'asc' },
      select: {
        id: true,
        name: true,
        color: true,
        position: true,
        isDefault: true,
        _count: { select: { conversations: true } },
      },
    });
  }

  async createColumn(tenantId: string, data: { name: string; color: string }) {
    const agg = await this.prisma.kanbanColumn.aggregate({
      where: { tenantId },
      _max: { position: true },
    });
    const position = (agg._max.position ?? 0) + 1;
    return this.prisma.kanbanColumn.create({
      data: { tenantId, name: data.name, color: data.color, position },
    });
  }

  async updateColumn(id: string, tenantId: string, data: { name?: string; color?: string }) {
    const col = await this.prisma.kanbanColumn.findFirst({ where: { id, tenantId } });
    if (!col) throw new NotFoundException('Coluna não encontrada');
    return this.prisma.kanbanColumn.update({ where: { id }, data });
  }

  async deleteColumn(id: string, tenantId: string) {
    const col = await this.prisma.kanbanColumn.findFirst({
      where: { id, tenantId },
      include: { _count: { select: { conversations: true } } },
    });
    if (!col) throw new NotFoundException('Coluna não encontrada');
    if (col.isDefault) throw new BadRequestException('Não podes eliminar a coluna padrão');
    if (col._count.conversations > 0) {
      throw new BadRequestException(
        `Esta coluna tem ${col._count.conversations} conversa(s). Move-as para outra coluna primeiro.`,
      );
    }
    return this.prisma.kanbanColumn.delete({ where: { id } });
  }

  async reorderColumns(tenantId: string, orderedIds: string[]) {
    const existing = await this.prisma.kanbanColumn.findMany({
      where: { tenantId },
      select: { id: true },
    });
    const existingIds = new Set(existing.map((c) => c.id));
    const invalid = orderedIds.filter((id) => !existingIds.has(id));
    if (invalid.length > 0) throw new BadRequestException('IDs de colunas inválidos');

    await this.prisma.$transaction(
      orderedIds.map((id, index) =>
        this.prisma.kanbanColumn.update({
          where: { id },
          data: { position: index + 1 },
        }),
      ),
    );
    return this.getColumns(tenantId);
  }
}
