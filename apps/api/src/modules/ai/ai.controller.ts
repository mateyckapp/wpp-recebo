import { Controller, Get, Put, Body, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { AiService } from './ai.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '@wpp-recebo/shared';

class UpdateAiConfigDto {
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsString()
  businessContext?: string;

  @IsOptional()
  @IsBoolean()
  fallbackToHuman?: boolean;
}

@ApiTags('IA')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(
    private readonly ai: AiService,
    private readonly prisma: PrismaService,
  ) {}

  private async assertNotStart(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { plan: true } });
    if (!tenant || tenant.plan === 'START') {
      throw new ForbiddenException('O plano Start não inclui o assistente de IA. Faz upgrade para o plano Pro ou superior.');
    }
  }

  @Get('config')
  @ApiOperation({ summary: 'Obter configuração de IA do tenant' })
  async getConfig(@CurrentUser() user: JwtPayload) {
    await this.assertNotStart(user.tenantId);
    return this.ai.getConfig(user.tenantId);
  }

  @Put('config')
  @ApiOperation({ summary: 'Actualizar configuração de IA do tenant' })
  async updateConfig(@CurrentUser() user: JwtPayload, @Body() dto: UpdateAiConfigDto) {
    await this.assertNotStart(user.tenantId);
    return this.ai.upsertConfig(user.tenantId, dto);
  }
}
