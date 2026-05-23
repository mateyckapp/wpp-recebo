import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { PlanLimitsService } from '../plan-limits/plan-limits.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '@wpp-recebo/shared';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly analytics: AnalyticsService,
    private readonly planLimits: PlanLimitsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Estatísticas do tenant' })
  async getSummary(@CurrentUser() user: JwtPayload) {
    await this.planLimits.assertReportsEnabled(user.tenantId);
    return this.analytics.getSummary(user.tenantId);
  }
}
