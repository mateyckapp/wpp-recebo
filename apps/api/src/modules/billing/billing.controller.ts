import { Controller, Get, Post, Delete, Body, Headers, Req } from '@nestjs/common';
import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { BillingService } from './billing.service';
import { PlanLimitsService } from '../plan-limits/plan-limits.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import type { JwtPayload } from '@wpp-recebo/shared';
import { IsString, IsNotEmpty } from 'class-validator';

class CreateCheckoutDto {
  @IsString() @IsNotEmpty() declare priceId: string;
}

@Controller('billing')
export class BillingController {
  constructor(
    private readonly billing: BillingService,
    private readonly planLimits: PlanLimitsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getBilling(@CurrentUser() user: JwtPayload) {
    return this.billing.getBilling(user.tenantId);
  }

  @Get('limits')
  async getLimits(@CurrentUser() user: JwtPayload) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: user.tenantId },
      select: { plan: true, _count: { select: { users: { where: { isActive: true } } } } },
    });
    if (!tenant) return {};
    const limits = this.planLimits.getLimits(tenant.plan);
    return {
      plan: tenant.plan,
      limits,
      usage: { agents: tenant._count.users },
    };
  }

  @Post('checkout')
  createCheckout(@Body() dto: CreateCheckoutDto, @CurrentUser() user: JwtPayload, @Req() req: Request) {
    const appUrl = req.headers['x-app-url'] as string | undefined ?? 'http://localhost:3000';
    return this.billing.createCheckoutSession(user.tenantId, dto.priceId, appUrl);
  }

  @Post('portal')
  createPortal(@CurrentUser() user: JwtPayload, @Req() req: Request) {
    const appUrl = req.headers['x-app-url'] as string | undefined ?? 'http://localhost:3000';
    return this.billing.createPortalSession(user.tenantId, appUrl);
  }

  @Get('stripe-connect/status')
  getConnectStatus(@CurrentUser() user: JwtPayload) {
    return this.billing.getStripeConnectStatus(user.tenantId);
  }

  @Post('stripe-connect/onboard')
  createConnectOnboard(@CurrentUser() user: JwtPayload, @Req() req: Request) {
    const appUrl = req.headers['x-app-url'] as string | undefined ?? 'http://localhost:3000';
    return this.billing.createStripeConnectLink(user.tenantId, appUrl);
  }

  @Delete('stripe-connect')
  disconnectConnect(@CurrentUser() user: JwtPayload) {
    return this.billing.disconnectStripeConnect(user.tenantId);
  }

  @Public()
  @Post('webhook')
  handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.billing.handleWebhook(req.rawBody as Buffer, signature);
  }
}
