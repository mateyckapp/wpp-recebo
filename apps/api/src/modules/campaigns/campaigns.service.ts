import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { PlanLimitsService } from '../plan-limits/plan-limits.service';
import { CampaignStatus, MessageDirection, MessageStatus, MessageType } from '@prisma/client';

const DELAY_MS = 1200; // 1.2s entre mensagens para evitar bloqueio WhatsApp

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsapp: WhatsappService,
    private readonly planLimits: PlanLimitsService,
  ) {}

  async findAll(tenantId: string) {
    return this.prisma.campaign.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: { group: { select: { id: true, name: true, color: true } } },
    });
  }

  async findById(id: string, tenantId: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, tenantId },
      include: { group: { select: { id: true, name: true, color: true } } },
    });
    if (!campaign) throw new NotFoundException('Campanha não encontrada');
    return campaign;
  }

  async create(tenantId: string, data: { name: string; message: string; groupId: string }) {
    await this.planLimits.assertCampaignsEnabled(tenantId);

    const group = await this.prisma.contactGroup.findFirst({
      where: { id: data.groupId, tenantId },
      include: { _count: { select: { contacts: true } } },
    });
    if (!group) throw new NotFoundException('Grupo não encontrado');

    return this.prisma.campaign.create({
      data: {
        tenantId,
        name: data.name,
        message: data.message,
        groupId: data.groupId,
        totalCount: group._count.contacts,
      },
      include: { group: { select: { id: true, name: true, color: true } } },
    });
  }

  async cancel(id: string, tenantId: string) {
    const campaign = await this.prisma.campaign.findFirst({ where: { id, tenantId } });
    if (!campaign) throw new NotFoundException('Campanha não encontrada');
    if (campaign.status === CampaignStatus.COMPLETED) {
      throw new BadRequestException('Campanha já concluída');
    }
    return this.prisma.campaign.update({
      where: { id },
      data: { status: CampaignStatus.CANCELLED },
    });
  }

  async delete(id: string, tenantId: string) {
    const campaign = await this.prisma.campaign.findFirst({ where: { id, tenantId } });
    if (!campaign) throw new NotFoundException('Campanha não encontrada');
    if (campaign.status === CampaignStatus.SENDING) {
      throw new BadRequestException('Não é possível eliminar uma campanha em envio');
    }
    await this.prisma.campaign.delete({ where: { id } });
  }

  async startSending(id: string, tenantId: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, tenantId },
      include: {
        group: { include: { contacts: { include: { contact: true } } } },
        tenant: { select: { whatsappPhoneNumberId: true, whatsappAccessToken: true } },
      },
    });

    if (!campaign) throw new NotFoundException('Campanha não encontrada');
    if (campaign.status !== CampaignStatus.DRAFT) {
      throw new BadRequestException('Só é possível enviar campanhas em estado Rascunho');
    }
    if (!campaign.tenant.whatsappPhoneNumberId || !campaign.tenant.whatsappAccessToken) {
      throw new BadRequestException('WhatsApp não configurado para este tenant');
    }

    // Marca como SENDING e responde imediatamente
    await this.prisma.campaign.update({
      where: { id },
      data: { status: CampaignStatus.SENDING, startedAt: new Date(), totalCount: campaign.group.contacts.length },
    });

    // Envia em background — não awaita
    void this.sendInBackground(campaign.id, tenantId, campaign.group.contacts.map((m) => m.contact), campaign.message, campaign.tenant.whatsappPhoneNumberId!, campaign.tenant.whatsappAccessToken!);

    return { started: true, total: campaign.group.contacts.length };
  }

  private async sendInBackground(
    campaignId: string,
    tenantId: string,
    contacts: Array<{ id: string; phoneNumber: string }>,
    message: string,
    phoneNumberId: string,
    accessToken: string,
  ) {
    let sentCount = 0;
    let failedCount = 0;

    for (const contact of contacts) {
      // Verifica se a campanha foi cancelada
      const current = await this.prisma.campaign.findUnique({
        where: { id: campaignId },
        select: { status: true },
      });
      if (current?.status === CampaignStatus.CANCELLED) {
        this.logger.log(`Campanha ${campaignId} cancelada durante envio`);
        return;
      }

      try {
        // Encontra ou cria conversa para este contacto
        const conv = await this.getOrCreateConversation(tenantId, contact.id);

        // Envia a mensagem
        const whatsappId = await this.whatsapp.sendTextMessage(
          phoneNumberId,
          contact.phoneNumber,
          message,
          accessToken,
        );

        // Regista a mensagem na DB
        await this.prisma.message.create({
          data: {
            tenantId,
            conversationId: conv.id,
            whatsappId,
            direction: MessageDirection.OUTBOUND,
            type: MessageType.TEXT,
            content: message,
            status: MessageStatus.SENT,
          },
        });

        await this.prisma.conversation.update({
          where: { id: conv.id },
          data: { lastMessageAt: new Date() },
        });

        sentCount++;
      } catch (err) {
        this.logger.error(`Falha ao enviar para ${contact.phoneNumber}: ${String(err)}`);
        failedCount++;
      }

      await this.prisma.campaign.update({
        where: { id: campaignId },
        data: { sentCount, failedCount },
      });

      await sleep(DELAY_MS);
    }

    await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: CampaignStatus.COMPLETED,
        completedAt: new Date(),
        sentCount,
        failedCount,
      },
    });

    this.logger.log(`Campanha ${campaignId} concluída: ${sentCount} enviadas, ${failedCount} falhadas`);
  }

  private async getOrCreateConversation(tenantId: string, contactId: string) {
    const existing = await this.prisma.conversation.findFirst({
      where: { tenantId, contactId, status: 'OPEN' },
      select: { id: true },
    });
    if (existing) return existing;

    const defaultColumn = await this.prisma.kanbanColumn.findFirst({
      where: { tenantId, isDefault: true },
      select: { id: true },
    });

    const column = defaultColumn ?? await this.prisma.kanbanColumn.findFirst({
      where: { tenantId },
      orderBy: { position: 'asc' },
      select: { id: true },
    });

    if (!column) throw new Error('Sem coluna Kanban configurada');

    return this.prisma.conversation.create({
      data: { tenantId, contactId, kanbanColumnId: column.id },
      select: { id: true },
    });
  }
}
