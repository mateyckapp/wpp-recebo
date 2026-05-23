import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TrialExpiryService {
  private readonly logger = new Logger(TrialExpiryService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expireTrials(): Promise<void> {
    const result = await this.prisma.tenant.updateMany({
      where: {
        status: 'TRIAL',
        trialEndsAt: { lt: new Date() },
      },
      data: { status: 'SUSPENDED' },
    });

    if (result.count > 0) {
      this.logger.log(`Trial expirado: ${result.count} tenant(s) suspensos`);
    }
  }
}
