import { Module } from '@nestjs/common';
import { StripeService } from './stripe/stripe.service';

import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [StripeService],
  exports: [StripeService],
})
export class PaymentsModule {}
