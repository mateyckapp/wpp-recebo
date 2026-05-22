import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import axios from 'axios';

function maskToken(token: string | null): string | null {
  if (!token || token.length < 12) return token;
  return `${token.slice(0, 6)}...${token.slice(-4)}`;
}

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        whatsappPhoneNumberId: true,
        whatsappBusinessAccountId: true,
        whatsappAccessToken: true,
      },
    });

    if (!tenant) throw new NotFoundException('Tenant não encontrado');

    return {
      ...tenant,
      whatsappAccessToken: maskToken(tenant.whatsappAccessToken),
      whatsappTokenConfigured: !!tenant.whatsappAccessToken,
    };
  }

  async updateWhatsappSettings(
    tenantId: string,
    role: string,
    data: {
      whatsappPhoneNumberId?: string;
      whatsappBusinessAccountId?: string;
      whatsappAccessToken?: string;
    },
  ) {
    if (role !== 'OWNER' && role !== 'ADMIN') {
      throw new ForbiddenException('Sem permissão para alterar configurações');
    }

    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data,
      select: {
        whatsappPhoneNumberId: true,
        whatsappBusinessAccountId: true,
        whatsappAccessToken: true,
      },
    });

    return {
      ...updated,
      whatsappAccessToken: maskToken(updated.whatsappAccessToken),
      whatsappTokenConfigured: !!updated.whatsappAccessToken,
    };
  }

  async getOnboardingStatus(tenantId: string) {
    const [tenant, userCount, messageCount, templateCount] = await Promise.all([
      this.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { whatsappPhoneNumberId: true, whatsappAccessToken: true },
      }),
      this.prisma.user.count({ where: { tenantId } }),
      this.prisma.message.count({ where: { tenantId, sentByAI: false, sentByUserId: { not: null } } }),
      this.prisma.messageTemplate.count({ where: { tenantId } }),
    ]);

    return {
      accountCreated: true,
      whatsappConfigured: !!(tenant?.whatsappPhoneNumberId && tenant?.whatsappAccessToken),
      messageSent: messageCount > 0,
      templateCreated: templateCount > 0,
      teamMemberInvited: userCount > 1,
    };
  }

  async getBranding(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { logoUrl: true, primaryColor: true, name: true },
    });
    return {
      logoUrl: tenant?.logoUrl ?? null,
      primaryColor: tenant?.primaryColor ?? '#7c3aed',
      name: tenant?.name ?? '',
    };
  }

  async updateBranding(tenantId: string, data: { logoUrl?: string | null; primaryColor?: string }) {
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...(data.logoUrl !== undefined ? { logoUrl: data.logoUrl } : {}),
        ...(data.primaryColor ? { primaryColor: data.primaryColor } : {}),
      },
    });
    return this.getBranding(tenantId);
  }

  async testWhatsappConnection(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { whatsappAccessToken: true, whatsappPhoneNumberId: true },
    });

    if (!tenant?.whatsappAccessToken || !tenant?.whatsappPhoneNumberId) {
      return { ok: false, error: 'Credenciais não configuradas' };
    }

    try {
      const { data } = await axios.get<{ id: string; display_phone_number: string }>(
        `https://graph.facebook.com/v21.0/${tenant.whatsappPhoneNumberId}`,
        {
          headers: { Authorization: `Bearer ${tenant.whatsappAccessToken}` },
          params: { fields: 'id,display_phone_number,verified_name' },
        },
      );
      return { ok: true, phoneNumber: data.display_phone_number };
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { error?: { message?: string } })?.error?.message ?? 'Erro desconhecido'
        : 'Erro ao contactar a API do Meta';
      return { ok: false, error: msg };
    }
  }
}
