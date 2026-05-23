import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiKeysService } from './api-keys.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PlanLimitsService } from '../plan-limits/plan-limits.service';
import type { JwtPayload } from '@wpp-recebo/shared';

class CreateApiKeyDto {
  @IsString() @IsNotEmpty() @MaxLength(100) declare name: string;
  @IsOptional() @IsEnum(['live', 'test']) environment?: 'live' | 'test';
}

@ApiTags('API Keys')
@ApiBearerAuth()
@Controller('api-keys')
export class ApiKeysController {
  constructor(
    private readonly apiKeys: ApiKeysService,
    private readonly planLimits: PlanLimitsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar API keys do tenant' })
  async findAll(@CurrentUser() user: JwtPayload) {
    await this.planLimits.assertEnterpriseApiAccess(user.tenantId);
    return this.apiKeys.findAll(user.tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Gerar nova API key' })
  async create(@Body() dto: CreateApiKeyDto, @CurrentUser() user: JwtPayload) {
    await this.planLimits.assertEnterpriseApiAccess(user.tenantId);
    return this.apiKeys.generate(user.tenantId, dto.name, dto.environment ?? 'live');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revogar API key' })
  async revoke(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.apiKeys.revoke(user.tenantId, id);
  }
}
