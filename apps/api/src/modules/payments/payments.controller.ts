import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsInt, IsString, IsOptional, IsNotEmpty, Min, Max, MaxLength } from 'class-validator';
import { PaymentsService } from './payments.service';
import { PlanLimitsService } from '../plan-limits/plan-limits.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import type { JwtPayload } from '@wpp-recebo/shared';

class CreatePaymentDto {
  @IsInt() @Min(50) @Max(999999) declare amount: number;
  @IsString() @IsNotEmpty() @MaxLength(200) declare description: string;
  @IsOptional() @IsString() conversationId?: string;
  @IsOptional() @IsString() contactId?: string;
}

@ApiTags('Pagamentos')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly payments: PaymentsService,
    private readonly planLimits: PlanLimitsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar link de pagamento' })
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreatePaymentDto) {
    await this.planLimits.assertPaymentsEnabled(user.tenantId);
    return this.payments.create(user.tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pagamentos do tenant' })
  async findAll(@CurrentUser() user: JwtPayload) {
    await this.planLimits.assertPaymentsEnabled(user.tenantId);
    return this.payments.findAll(user.tenantId);
  }

  @Public()
  @Get('checkout/:token')
  @ApiOperation({ summary: 'Dados públicos do checkout (sem auth)' })
  getCheckout(@Param('token') token: string) {
    return this.payments.getPublicCheckout(token);
  }
}
