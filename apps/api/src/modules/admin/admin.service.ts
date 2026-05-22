import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Plan, TenantStatus } from '@prisma/client';

const DEFAULT_PLAN_PRICES: Record<Plan, number> = {
  START: 0,
  PRO: 29,
  ENTERPRISE: 99,
  AGENDA_PRO: 49,
};

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Config ────────────────────────────────────────────────────────────────

  async getConfig(): Promise<Record<string, string>> {
    const entries = await this.prisma.adminConfig.findMany();
    return Object.fromEntries(entries.map((e) => [e.key, e.value]));
  }

  async getPublicConfig(): Promise<Record<string, string>> {
    const PIXEL_KEYS = ['fb_pixel_id', 'ga_id', 'ga_ads_id', 'tiktok_pixel_id'];
    const entries = await this.prisma.adminConfig.findMany({
      where: { key: { in: PIXEL_KEYS } },
    });
    return Object.fromEntries(entries.map((e) => [e.key, e.value]));
  }

  async upsertConfig(key: string, value: string): Promise<void> {
    await this.prisma.adminConfig.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  // ── Stats ─────────────────────────────────────────────────────────────────

  async getStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [total, byStatus, byPlan, newThisMonth, newLast30Days, totalMessages, messagesToday, totalAppointments, appointmentsThisWeek, activeWhatsapp] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.tenant.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.tenant.groupBy({ by: ['plan'], _count: { _all: true }, where: { status: TenantStatus.ACTIVE } }),
      this.prisma.tenant.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.tenant.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.message.count(),
      this.prisma.message.count({ where: { createdAt: { gte: today } } }),
      this.prisma.appointment.count(),
      this.prisma.appointment.count({ where: { scheduledAt: { gte: weekAgo } } }),
      this.prisma.tenant.count({ where: { whatsappPhoneNumberId: { not: null } } }),
    ]);

    const config = await this.getConfig();
    const planPrices = this.resolvePlanPrices(config);

    const statusMap = Object.fromEntries(byStatus.map((s) => [s.status, s._count._all]));
    const mrr = byPlan.reduce((sum, p) => sum + p._count._all * (planPrices[p.plan] ?? 0), 0);

    const planDistribution = byPlan.map((p) => ({
      plan: p.plan,
      count: p._count._all,
      revenue: p._count._all * (planPrices[p.plan] ?? 0),
    }));

    return {
      total,
      active: statusMap[TenantStatus.ACTIVE] ?? 0,
      trial: statusMap[TenantStatus.TRIAL] ?? 0,
      suspended: statusMap[TenantStatus.SUSPENDED] ?? 0,
      cancelled: statusMap[TenantStatus.CANCELLED] ?? 0,
      mrr,
      newThisMonth,
      newLast30Days,
      planDistribution,
      totalMessages,
      messagesToday,
      totalAppointments,
      appointmentsThisWeek,
      activeWhatsapp,
    };
  }

  // ── Tenants ───────────────────────────────────────────────────────────────

  async getTenants(search?: string) {
    const config = await this.getConfig();
    const planPrices = this.resolvePlanPrices(config);

    const tenants = await this.prisma.tenant.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { slug: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        status: true,
        createdAt: true,
        whatsappPhoneNumberId: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        _count: { select: { users: true, appointments: true, messages: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tenants.map((t) => ({
      ...t,
      mrr: t.status === TenantStatus.ACTIVE ? (planPrices[t.plan] ?? 0) : 0,
    }));
  }

  async updateTenant(id: string, data: { plan?: Plan; status?: TenantStatus }) {
    return this.prisma.tenant.update({ where: { id }, data });
  }

  // ── Billing ───────────────────────────────────────────────────────────────

  async getBillingOverview() {
    const config = await this.getConfig();
    const planPrices = this.resolvePlanPrices(config);

    const activeTenants = await this.prisma.tenant.findMany({
      where: { status: TenantStatus.ACTIVE },
      select: { plan: true, createdAt: true },
    });

    const mrr = activeTenants.reduce((sum, t) => sum + (planPrices[t.plan] ?? 0), 0);

    // Cashflow projection: next 12 months assuming current MRR, monthly churn = 0 for baseline
    const months: { month: string; revenue: number }[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      months.push({
        month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        revenue: mrr,
      });
    }

    // Revenue by plan breakdown
    const byPlan = await this.prisma.tenant.groupBy({
      by: ['plan'],
      _count: { _all: true },
      where: { status: TenantStatus.ACTIVE },
    });

    const planBreakdown = byPlan.map((p) => ({
      plan: p.plan,
      count: p._count._all,
      monthly: p._count._all * (planPrices[p.plan] ?? 0),
      annual: p._count._all * (planPrices[p.plan] ?? 0) * 12,
    }));

    return { mrr, arr: mrr * 12, projection: months, planBreakdown };
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private resolvePlanPrices(config: Record<string, string>): Record<Plan, number> {
    return {
      START: Number(config['price_start'] ?? DEFAULT_PLAN_PRICES.START),
      PRO: Number(config['price_pro'] ?? DEFAULT_PLAN_PRICES.PRO),
      ENTERPRISE: Number(config['price_enterprise'] ?? DEFAULT_PLAN_PRICES.ENTERPRISE),
      AGENDA_PRO: Number(config['price_agenda_pro'] ?? DEFAULT_PLAN_PRICES.AGENDA_PRO),
    };
  }
}
