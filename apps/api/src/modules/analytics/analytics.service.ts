import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(tenantId: string) {
    const since30d = new Date();
    since30d.setDate(since30d.getDate() - 30);

    const [
      totalConversations,
      openConversations,
      totalMessages,
      sentMessages,
      receivedMessages,
      totalContacts,
      newContacts30d,
      totalAppointments,
      appointmentsByStatus,
      messagesPerDay,
      topAgents,
    ] = await Promise.all([
      this.prisma.conversation.count({ where: { tenantId } }),
      this.prisma.conversation.count({ where: { tenantId, status: 'OPEN' } }),
      this.prisma.message.count({ where: { tenantId } }),
      this.prisma.message.count({ where: { tenantId, direction: 'OUTBOUND' } }),
      this.prisma.message.count({ where: { tenantId, direction: 'INBOUND' } }),
      this.prisma.contact.count({ where: { tenantId } }),
      this.prisma.contact.count({ where: { tenantId, createdAt: { gte: since30d } } }),
      this.prisma.appointment.count({ where: { tenantId } }),
      this.prisma.appointment.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: { status: true },
      }),
      this.prisma.$queryRaw<Array<{ day: string; sent: bigint; received: bigint }>>`
        SELECT
          TO_CHAR(DATE_TRUNC('day', "createdAt"), 'YYYY-MM-DD') AS day,
          COUNT(*) FILTER (WHERE direction = 'OUTBOUND') AS sent,
          COUNT(*) FILTER (WHERE direction = 'INBOUND') AS received
        FROM messages
        WHERE "tenantId" = ${tenantId}
          AND "createdAt" >= NOW() - INTERVAL '30 days'
        GROUP BY DATE_TRUNC('day', "createdAt")
        ORDER BY day ASC
      `,
      this.prisma.message.groupBy({
        by: ['sentByUserId'],
        where: { tenantId, direction: 'OUTBOUND', sentByUserId: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
    ]);

    // Buscar nomes dos agentes
    const agentIds = topAgents.map((a) => a.sentByUserId).filter(Boolean) as string[];
    const agents = await this.prisma.user.findMany({
      where: { id: { in: agentIds } },
      select: { id: true, name: true },
    });
    const agentMap = Object.fromEntries(agents.map((a) => [a.id, a.name]));

    return {
      conversations: {
        total: totalConversations,
        open: openConversations,
        closed: totalConversations - openConversations,
      },
      messages: {
        total: totalMessages,
        sent: sentMessages,
        received: receivedMessages,
      },
      contacts: {
        total: totalContacts,
        new30d: newContacts30d,
      },
      appointments: {
        total: totalAppointments,
        byStatus: Object.fromEntries(
          appointmentsByStatus.map((r) => [r.status, r._count.status]),
        ),
      },
      messagesPerDay: messagesPerDay.map((r) => ({
        day: r.day,
        sent: Number(r.sent),
        received: Number(r.received),
      })),
      topAgents: topAgents.map((a) => ({
        name: agentMap[a.sentByUserId ?? ''] ?? 'Desconhecido',
        count: a._count.id,
      })),
    };
  }
}
