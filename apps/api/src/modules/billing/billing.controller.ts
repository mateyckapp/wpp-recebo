import { Controller, Get, Post, Body, Headers, Req } from '@nestjs/common';
import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { BillingService } from './billing.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import type { JwtPayload } from '@wpp-recebo/shared';
import { IsString, IsNotEmpty } from 'class-validator';

class CreateCheckoutDto {
  @IsString() @IsNotEmpty() declare priceId: string;
}

@Controller('billing')
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Get()
  getBilling(@CurrentUser() user: JwtPayload) {
    return this.billing.getBilling(user.tenantId);
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

  @Public()
  @Post('webhook')
  handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.billing.handleWebhook(req.rawBody as Buffer, signature);
  }
}
