import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import Stripe from 'stripe';
import { Plan } from '@prisma/client';
import { PaymentsService } from '../payments/payments.service';

const PRICE_TO_PLAN: Record<string, Plan> = {};

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly stripe: InstanceType<typeof Stripe>;
  private readonly prices: Record<string, string>;
  private readonly webhookSecret: string;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly paymentsService: PaymentsService,
  ) {
    this.stripe = new Stripe(this.config.getOrThrow('STRIPE_SECRET_KEY'), {
      apiVersion: '2026-04-22.dahlia',
    });

    this.prices = {
      START: this.config.getOrThrow('STRIPE_PRICE_START'),
      PRO: this.config.getOrThrow('STRIPE_PRICE_PRO'),
      ENTERPRISE: this.config.getOrThrow('STRIPE_PRICE_ENTERPRISE'),
      AGENDA_PRO: this.config.getOrThrow('STRIPE_PRICE_AGENDA_PRO'),
    };

    this.webhookSecret = this.config.getOrThrow('STRIPE_WEBHOOK_SECRET');

    Object.entries(this.prices).forEach(([plan, priceId]) => {
      PRICE_TO_PLAN[priceId] = plan as Plan;
    });
  }

  async getBilling(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        plan: true,
        status: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    });

    if (!tenant) throw new NotFoundException('Tenant não encontrado');

    let subscription: Awaited<ReturnType<typeof this.stripe.subscriptions.retrieve>> | null = null;
    if (tenant.stripeSubscriptionId) {
      try {
        subscription = await this.stripe.subscriptions.retrieve(tenant.stripeSubscriptionId);
      } catch {
        // subscrição pode ter sido eliminada
      }
    }

    return {
      plan: tenant.plan,
      status: tenant.status,
      hasSubscription: !!subscription,
      currentPeriodEnd: subscription
        ? new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString()
        : null,
      cancelAtPeriodEnd: subscription ? subscription.cancel_at_period_end : false,
      prices: {
        START: this.prices['START'],
        PRO: this.prices['PRO'],
        ENTERPRISE: this.prices['ENTERPRISE'],
        AGENDA_PRO: this.prices['AGENDA_PRO'],
      },
    };
  }

  async createCheckoutSession(tenantId: string, priceId: string, appUrl: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { stripeCustomerId: true, slug: true, name: true },
    });

    if (!tenant) throw new NotFoundException('Tenant não encontrado');

    const validPrices = Object.values(this.prices);
    if (!validPrices.includes(priceId)) {
      throw new BadRequestException('Plano inválido');
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      ...(tenant.stripeCustomerId ? { customer: tenant.stripeCustomerId } : {}),
      metadata: { tenantId },
      success_url: `${appUrl}/invoices?success=1`,
      cancel_url: `${appUrl}/invoices?cancelled=1`,
      locale: 'pt',
    });

    return { url: session.url };
  }

  async createPortalSession(tenantId: string, appUrl: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { stripeCustomerId: true },
    });

    if (!tenant?.stripeCustomerId) {
      throw new BadRequestException('Sem subscrição activa. Adquire um plano primeiro.');
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: tenant.stripeCustomerId,
      return_url: `${appUrl}/invoices`,
    });

    return { url: session.url };
  }

  async createStripeConnectLink(tenantId: string, returnBaseUrl: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { stripeConnectAccountId: true },
    });
    if (!tenant) throw new NotFoundException('Tenant não encontrado');

    let accountId = tenant.stripeConnectAccountId;

    if (!accountId) {
      const account = await this.stripe.accounts.create({
        type: 'express',
        metadata: { tenantId },
      });
      accountId = account.id;
      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: { stripeConnectAccountId: accountId },
      });
    }

    const link = await this.stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${returnBaseUrl}/invoices?stripe_connect=refresh`,
      return_url: `${returnBaseUrl}/invoices?stripe_connect=success`,
      type: 'account_onboarding',
    });

    return { url: link.url };
  }

  async getStripeConnectStatus(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { stripeConnectAccountId: true, stripeConnectOnboarded: true },
    });
    if (!tenant) throw new NotFoundException('Tenant não encontrado');

    if (!tenant.stripeConnectAccountId) return { connected: false, onboarded: false };

    try {
      const account = await this.stripe.accounts.retrieve(tenant.stripeConnectAccountId);
      const onboarded = !!(account.charges_enabled && account.details_submitted);

      if (onboarded !== tenant.stripeConnectOnboarded) {
        await this.prisma.tenant.update({
          where: { id: tenantId },
          data: { stripeConnectOnboarded: onboarded },
        });
      }

      return {
        connected: true,
        onboarded,
        accountId: tenant.stripeConnectAccountId,
        chargesEnabled: account.charges_enabled,
        detailsSubmitted: account.details_submitted,
      };
    } catch {
      return { connected: false, onboarded: false };
    }
  }

  async disconnectStripeConnect(tenantId: string) {
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { stripeConnectAccountId: null, stripeConnectOnboarded: false },
    });
    return { success: true };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    let event: Awaited<ReturnType<typeof this.stripe.webhooks.constructEvent>>;

    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret);
    } catch (err) {
      this.logger.error(`Webhook inválido: ${String(err)}`);
      throw new BadRequestException('Webhook inválido');
    }

    this.logger.log(`Stripe event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as { metadata?: { tenantId?: string }; subscription?: unknown; customer?: unknown };
        const tenantId = session.metadata?.tenantId;
        if (!tenantId || !session.subscription || !session.customer) break;

        const sub = await this.stripe.subscriptions.retrieve(String(session.subscription));
        const priceId = sub.items.data[0]?.price.id;
        const plan = priceId ? (PRICE_TO_PLAN[priceId] ?? Plan.START) : Plan.START;

        await this.prisma.tenant.update({
          where: { id: tenantId },
          data: {
            stripeCustomerId: String(session.customer),
            stripeSubscriptionId: String(session.subscription),
            plan,
            status: 'ACTIVE',
          },
        });
        this.logger.log(`Tenant ${tenantId} actualizado para plano ${plan}`);
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as { id: string; items: { data: Array<{ price: { id: string } }> }; status: string };
        const tenant = await this.prisma.tenant.findFirst({
          where: { stripeSubscriptionId: sub.id },
        });
        if (!tenant) break;

        const priceId = sub.items.data[0]?.price.id;
        const plan = priceId ? (PRICE_TO_PLAN[priceId] ?? tenant.plan) : tenant.plan;

        await this.prisma.tenant.update({
          where: { id: tenant.id },
          data: { plan, status: sub.status === 'active' ? 'ACTIVE' : 'SUSPENDED' },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as { id: string };
        const tenant = await this.prisma.tenant.findFirst({
          where: { stripeSubscriptionId: sub.id },
        });
        if (!tenant) break;

        await this.prisma.tenant.update({
          where: { id: tenant.id },
          data: { plan: Plan.START, status: 'CANCELLED', stripeSubscriptionId: null },
        });
        break;
      }

      case 'payment_intent.succeeded': {
        const pi = event.data.object as { id: string };
        await this.paymentsService.handlePaymentSucceeded(pi.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as { id: string };
        await this.paymentsService.handlePaymentFailed(pi.id);
        break;
      }
    }

    return { received: true };
  }
}
