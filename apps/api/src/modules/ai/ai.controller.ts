import {
  Controller, Get, Put, Patch, Post, Delete, Body, Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  IsArray, IsBoolean, IsInt, IsJSON, IsNumber, IsObject, IsOptional,
  IsString, Max, MaxLength, Min,
} from 'class-validator';
import { AiService } from './ai.service';
import { PlanLimitsService } from '../plan-limits/plan-limits.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '@wpp-recebo/shared';

class UpdateAiConfigDto {
  @IsOptional() @IsBoolean() isEnabled?: boolean;
  @IsOptional() @IsString() businessContext?: string;
  @IsOptional() @IsBoolean() fallbackToHuman?: boolean;
  @IsOptional() @IsBoolean() respondOutsideHours?: boolean;
  @IsOptional() @IsBoolean() respondWhenBusy?: boolean;
  @IsOptional() @IsBoolean() escalationEnabled?: boolean;
  @IsOptional() @IsArray() @IsString({ each: true }) escalationKeywords?: string[];
  @IsOptional() @IsInt() @Min(50) @Max(800) maxResponseTokens?: number;
}

class UpdateAiContextDto {
  @IsOptional() @IsString() @MaxLength(200) businessName?: string;
  @IsOptional() @IsString() @MaxLength(2000) businessDescription?: string;
  @IsOptional() @IsString() @MaxLength(500) businessAddress?: string;
  @IsOptional() @IsArray() servicesContext?: unknown[];
  @IsOptional() workingHours?: Record<string, string>;
}

class UpdateAiBehaviorDto {
  @IsOptional() @IsString() @MaxLength(100) personaName?: string;
  @IsOptional() @IsString() personaTone?: string;
  @IsOptional() @IsBoolean() personaUseEmojis?: boolean;
  @IsOptional() @IsInt() @Min(50) @Max(800) maxResponseTokens?: number;
  @IsOptional() @IsString() @MaxLength(500) greeting?: string;
  @IsOptional() @IsString() @MaxLength(500) fallbackMessage?: string;
  @IsOptional() @IsString() @MaxLength(500) outOfScopeMessage?: string;
  @IsOptional() @IsBoolean() escalationEnabled?: boolean;
  @IsOptional() @IsArray() @IsString({ each: true }) escalationKeywords?: string[];
  @IsOptional() @IsString() @MaxLength(300) escalationMessage?: string;
  @IsOptional() @IsObject() restrictions?: Record<string, boolean>;
}

class AddFaqDto {
  @IsString() @MaxLength(500) declare question: string;
  @IsString() @MaxLength(1000) declare answer: string;
}

class TestAiDto {
  @IsString() @MaxLength(2000) declare message: string;
}

@ApiTags('IA')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(
    private readonly ai: AiService,
    private readonly planLimits: PlanLimitsService,
  ) {}

  // ─── Config (legacy + expanded) ─────────────────────────────────────────────

  @Get('config')
  @ApiOperation({ summary: 'Obter configuração de IA do tenant' })
  async getConfig(@CurrentUser() user: JwtPayload) {
    await this.planLimits.assertAiEnabled(user.tenantId);
    return this.ai.getConfig(user.tenantId);
  }

  @Put('config')
  @ApiOperation({ summary: 'Actualizar configuração de IA do tenant' })
  async updateConfig(@CurrentUser() user: JwtPayload, @Body() dto: UpdateAiConfigDto) {
    await this.planLimits.assertAiEnabled(user.tenantId);
    return this.ai.upsertConfig(user.tenantId, dto as unknown as Record<string, unknown>);
  }

  // ─── Context ────────────────────────────────────────────────────────────────

  @Get('context')
  @ApiOperation({ summary: 'Obter base de conhecimento' })
  async getContext(@CurrentUser() user: JwtPayload) {
    await this.planLimits.assertAiEnabled(user.tenantId);
    return this.ai.getContext(user.tenantId);
  }

  @Put('context')
  @ApiOperation({ summary: 'Atualizar base de conhecimento (substitui tudo)' })
  async updateContext(@CurrentUser() user: JwtPayload, @Body() dto: UpdateAiContextDto) {
    await this.planLimits.assertAiEnabled(user.tenantId);
    return this.ai.updateContext(user.tenantId, dto);
  }

  @Post('context/faqs')
  @ApiOperation({ summary: 'Adicionar FAQ à base de conhecimento' })
  async addFaq(@CurrentUser() user: JwtPayload, @Body() dto: AddFaqDto) {
    await this.planLimits.assertAiEnabled(user.tenantId);
    return this.ai.addFaq(user.tenantId, dto);
  }

  @Delete('context/faqs/:id')
  @ApiOperation({ summary: 'Remover FAQ da base de conhecimento' })
  async removeFaq(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.planLimits.assertAiEnabled(user.tenantId);
    return this.ai.removeFaq(user.tenantId, id);
  }

  // ─── Behavior ───────────────────────────────────────────────────────────────

  @Get('behavior')
  @ApiOperation({ summary: 'Obter configuração de tom e comportamento' })
  async getBehavior(@CurrentUser() user: JwtPayload) {
    await this.planLimits.assertAiEnabled(user.tenantId);
    return this.ai.getBehavior(user.tenantId);
  }

  @Patch('behavior')
  @ApiOperation({ summary: 'Atualizar tom e comportamento' })
  async updateBehavior(@CurrentUser() user: JwtPayload, @Body() dto: UpdateAiBehaviorDto) {
    await this.planLimits.assertAiEnabled(user.tenantId);
    return this.ai.updateBehavior(user.tenantId, dto as unknown as Record<string, unknown>);
  }

  // ─── Test ───────────────────────────────────────────────────────────────────

  @Post('test')
  @ApiOperation({ summary: 'Testar a IA sem afetar conversas reais' })
  async test(@CurrentUser() user: JwtPayload, @Body() dto: TestAiDto) {
    await this.planLimits.assertAiEnabled(user.tenantId);
    return this.ai.testReply(user.tenantId, dto.message);
  }
}
