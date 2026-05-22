import { Injectable, ForbiddenException } from '@nestjs/common';
import { Plan } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface PlanLimits {
  maxAgents: number;
  aiEnabled: boolean;
  campaignsEnabled: boolean;
}

const LIMITS: Record<Plan, PlanLimits> = {
  [Plan.START]: { maxAgents: 3, aiEnabled: false, campaignsEnabled: false },
  [Plan.PRO]: { maxAgents: 10, aiEnabled: true, campaignsEnabled: true },
  [Plan.AGENDA_PRO]: { maxAgents: 5, aiEnabled: true, campaignsEnabled: false },
  [Plan.ENTERPRISE]: { maxAgents: Infinity, aiEnabled: true, campaignsEnabled: true },
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

    const limits = this.getLimits(tenant.plan);
    if (!limits.campaignsEnabled) {
      throw new ForbiddenException(
        `O teu plano ${tenant.plan} não inclui campanhas. Faz upgrade para o plano PRO ou ENTERPRISE.`,
      );
    }
  }

  async assertAiEnabled(tenantId: string): Promise<void> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { plan: true },
    });
    if (!tenant) return;

    const limits = this.getLimits(tenant.plan);
    if (!limits.aiEnabled) {
      throw new ForbiddenException(
        `O teu plano ${tenant.plan} não inclui o assistente de IA. Faz upgrade para aceder a esta funcionalidade.`,
      );
    }
  }
}
