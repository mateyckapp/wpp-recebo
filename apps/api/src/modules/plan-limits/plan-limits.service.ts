import { Injectable, ForbiddenException } from '@nestjs/common';
import { Plan } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface PlanLimits {
  maxAgents: number;
  aiEnabled: boolean;
  campaignsEnabled: boolean;
  agendaEnabled: boolean;
  scheduledMessagesEnabled: boolean;
  reportsEnabled: boolean;
  paymentsEnabled: boolean;
}

const LIMITS: Record<Plan, PlanLimits> = {
  [Plan.START]: {
    maxAgents: 3,
    aiEnabled: false,
    campaignsEnabled: false,
    agendaEnabled: false,
    scheduledMessagesEnabled: false,
    reportsEnabled: false,
    paymentsEnabled: false,
  },
  [Plan.PRO]: {
    maxAgents: Infinity,
    aiEnabled: true,
    campaignsEnabled: true,
    agendaEnabled: false,
    scheduledMessagesEnabled: true,
    reportsEnabled: true,
    paymentsEnabled: true,
  },
  [Plan.AGENDA_PRO]: {
    maxAgents: Infinity,
    aiEnabled: true,
    campaignsEnabled: true,
    agendaEnabled: true,
    scheduledMessagesEnabled: true,
    reportsEnabled: true,
    paymentsEnabled: true,
  },
  [Plan.ENTERPRISE]: {
    maxAgents: Infinity,
    aiEnabled: true,
    campaignsEnabled: true,
    agendaEnabled: true,
    scheduledMessagesEnabled: true,
    reportsEnabled: true,
    paymentsEnabled: true,
  },
};

@Injectable()
export class PlanLimitsService {
  constructor(private readonly prisma: PrismaService) {}

  getLimits(plan: Plan): PlanLimits {
    return LIMITS[plan] ?? LIMITS[Plan.START];
  }

  async assertCanAddAgent(tenantId: string): Promise<void> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { plan: true, _count: { select: { users: { where: { isActive: true } } } } },
    });
    if (!tenant) return;

    const limits = this.getLimits(tenant.plan);
    if (tenant._count.users >= limits.maxAgents) {
      throw new ForbiddenException(
        `O teu plano ${tenant.plan} permite no máximo ${limits.maxAgents} utilizadores activos. Faz upgrade para adicionar mais.`,
      );
    }
  }

  async assertCampaignsEnabled(tenantId: string): Promise<void> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { plan: true },
    });
    if (!tenant) return;

    if (!this.getLimits(tenant.plan).campaignsEnabled) {
      throw new ForbiddenException(
        `O teu plano ${tenant.plan} não inclui campanhas. Faz upgrade para o plano PRO ou superior.`,
      );
    }
  }

  async assertAiEnabled(tenantId: string): Promise<void> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { plan: true },
    });
    if (!tenant) return;

    if (!this.getLimits(tenant.plan).aiEnabled) {
      throw new ForbiddenException(
        `O teu plano ${tenant.plan} não inclui o assistente de IA. Faz upgrade para aceder a esta funcionalidade.`,
      );
    }
  }

  async assertAgendaEnabled(tenantId: string): Promise<void> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { plan: true },
    });
    if (!tenant) return;

    if (!this.getLimits(tenant.plan).agendaEnabled) {
      throw new ForbiddenException(
        `O teu plano ${tenant.plan} não inclui a agenda. Faz upgrade para o plano AGENDA_PRO para aceder a esta funcionalidade.`,
      );
    }
  }

  async assertScheduledMessagesEnabled(tenantId: string): Promise<void> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { plan: true },
    });
    if (!tenant) return;

    if (!this.getLimits(tenant.plan).scheduledMessagesEnabled) {
      throw new ForbiddenException(
        `O teu plano ${tenant.plan} não inclui mensagens agendadas. Faz upgrade para o plano PRO ou superior.`,
      );
    }
  }

  async assertReportsEnabled(tenantId: string): Promise<void> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { plan: true },
    });
    if (!tenant) return;

    if (!this.getLimits(tenant.plan).reportsEnabled) {
      throw new ForbiddenException(
        `O teu plano ${tenant.plan} não inclui relatórios avançados. Faz upgrade para o plano PRO ou superior.`,
      );
    }
  }

  async assertPaymentsEnabled(tenantId: string): Promise<void> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { plan: true },
    });
    if (!tenant) return;

    if (!this.getLimits(tenant.plan).paymentsEnabled) {
      throw new ForbiddenException(
        'O teu plano não inclui cobranças via WhatsApp. Faz upgrade para o plano PRO ou superior.',
      );
    }
  }

  async assertEnterpriseApiAccess(tenantId: string): Promise<void> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { plan: true },
    });
    if (!tenant) return;

    if (tenant.plan !== Plan.ENTERPRISE) {
      throw new ForbiddenException(
        'O acesso à API pública e webhooks requer o plano Enterprise.',
      );
    }
  }
}
