import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { TrialExpiryService } from './trial-expiry.service';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [PaymentsModule],
  controllers: [BillingController],
  providers: [BillingService, TrialExpiryService],
})
export class BillingModule {}
