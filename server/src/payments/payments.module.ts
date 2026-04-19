import { Module } from '@nestjs/common';
import { StripeService } from './stripe/stripe.service';
import { RazorpayService } from './razorpay/razorpay.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [StripeService, RazorpayService],
  exports: [StripeService, RazorpayService],
})
export class PaymentsModule {}
