import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import Stripe from 'stripe';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly stripe: InstanceType<typeof Stripe> | null = null;
  private readonly appDomain: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const stripeKey = this.config.get<string>('STRIPE_SECRET_KEY');
    if (stripeKey) {
      this.stripe = new Stripe(stripeKey, { apiVersion: '2026-04-22.dahlia' });
    } else {
      this.logger.warn('STRIPE_SECRET_KEY não configurada — pagamentos desativados');
    }
    this.appDomain = this.config.get('APP_DOMAIN', 'wpprecebo.com');
  }

  async create(
    tenantId: string,
    dto: { amount: number; description: string; conversationId?: string; contactId?: string },
  ) {
    if (dto.amount < 50) throw new BadRequestException('Valor mínimo: €0.50');
    if (dto.amount > 999_999) throw new BadRequestException('Valor máximo: €9,999.99');

    const token = randomBytes(16).toString('base64url');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    if (!this.stripe) throw new BadRequestException('Pagamentos não configurados no servidor');

    const intent = await this.stripe.paymentIntents.create({
      amount: dto.amount,
      currency: 'eur',
      description: dto.description,
      automatic_payment_methods: { enabled: true },
      metadata: { tenantId, token },
    });

    const payment = await this.prisma.payment.create({
      data: {
        tenantId,
        conversationId: dto.conversationId,
        contactId: dto.contactId,
        amount: dto.amount,
        description: dto.description,
        stripePaymentIntentId: intent.id,
        token,
        expiresAt,
      },
      select: {
        id: true, amount: true, currency: true, description: true,
        status: true, token: true, expiresAt: true, createdAt: true,
      },
    });

    return {
      data: {
        ...payment,
        url: `https://${this.appDomain}/pagar/${token}`,
      },
    };
  }

  async findAll(tenantId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, amount: true, currency: true, description: true,
        status: true, token: true, paidAt: true, createdAt: true,
        conversationId: true, contactId: true,
      },
    });
    return { data: payments };
  }

  async getPublicCheckout(token: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { token },
      include: { tenant: { select: { name: true, logoUrl: true } } },
    });

    if (!payment) throw new NotFoundException('Link de pagamento não encontrado');
    if (payment.status === 'paid') return { status: 'paid', description: payment.description, amount: payment.amount };
    if (payment.expiresAt && payment.expiresAt < new Date()) {
      return { status: 'expired' };
    }

    if (!this.stripe) throw new BadRequestException('Pagamentos não configurados no servidor');

    const intent = await this.stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);

    return {
      status: 'pending',
      clientSecret: intent.client_secret,
      amount: payment.amount,
      currency: payment.currency,
      description: payment.description,
      tenantName: payment.tenant.name,
      tenantLogo: payment.tenant.logoUrl,
    };
  }

  async handlePaymentSucceeded(paymentIntentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
    });
    if (!payment) return;

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'paid', paidAt: new Date() },
    });

    this.logger.log(`Pagamento confirmado: ${payment.id} (${payment.amount / 100}€)`);
  }

  async handlePaymentFailed(paymentIntentId: string) {
    await this.prisma.payment.updateMany({
      where: { stripePaymentIntentId: paymentIntentId },
      data: { status: 'failed' },
    });
  }

  // Admin
  async getAdminStats() {
    const [total, paid, volume] = await Promise.all([
      this.prisma.payment.count(),
      this.prisma.payment.count({ where: { status: 'paid' } }),
      this.prisma.payment.aggregate({
        where: { status: 'paid' },
        _sum: { amount: true },
      }),
    ]);

    const recent = await this.prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true, amount: true, currency: true, description: true,
        status: true, paidAt: true, createdAt: true,
        tenant: { select: { name: true, slug: true } },
      },
    });

    return {
      total,
      paid,
      pending: total - paid,
      volumeCents: volume._sum.amount ?? 0,
      recent,
    };
  }
}
