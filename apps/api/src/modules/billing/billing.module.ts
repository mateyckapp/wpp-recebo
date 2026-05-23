import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { TrialExpiryService } from './trial-expiry.service';

@Module({
  controllers: [BillingController],
  providers: [BillingService, TrialExpiryService],
})
export class BillingModule {}
