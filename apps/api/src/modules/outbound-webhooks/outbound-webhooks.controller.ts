import { Controller, Get, Post, Delete, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { OutboundWebhooksService } from './outbound-webhooks.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PlanLimitsService } from '../plan-limits/plan-limits.service';
import type { JwtPayload } from '@wpp-recebo/shared';

class CreateWebhookDto {
  @IsUrl({ require_tld: false }) declare url: string;
  @IsArray() @IsString({ each: true }) declare events: string[];
  @IsOptional() @IsString() secret?: string;
  @IsOptional() @IsString() @MaxLength(200) description?: string;
}

class UpdateWebhookDto {
  @IsOptional() @IsBoolean() active?: boolean;
  @IsOptional() @IsArray() @IsString({ each: true }) events?: string[];
  @IsOptional() @IsString() @MaxLength(200) description?: string;
}

@ApiTags('Webhooks')
@ApiBearerAuth()
@Controller('webhooks')
export class OutboundWebhooksController {
  constructor(
    private readonly webhooks: OutboundWebhooksService,
    private readonly planLimits: PlanLimitsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Registar webhook' })
  async create(@Body() dto: CreateWebhookDto, @CurrentUser() user: JwtPayload) {
    await this.planLimits.assertEnterpriseApiAccess(user.tenantId);
    return this.webhooks.create(user.tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar webhooks' })
  async findAll(@CurrentUser() user: JwtPayload) {
    await this.planLimits.assertEnterpriseApiAccess(user.tenantId);
    return this.webhooks.findAll(user.tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar webhook' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateWebhookDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.planLimits.assertEnterpriseApiAccess(user.tenantId);
    return this.webhooks.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover webhook' })
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.planLimits.assertEnterpriseApiAccess(user.tenantId);
    return this.webhooks.remove(user.tenantId, id);
  }
}
