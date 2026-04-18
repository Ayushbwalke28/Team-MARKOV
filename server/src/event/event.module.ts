import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { FraudReportController } from './fraud-report.controller';
import { EventService } from './event.service';

import { MediaModule } from '../media/media.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [MediaModule, PaymentsModule],
  controllers: [EventController, FraudReportController],
  providers: [EventService]
})
export class EventModule {}
