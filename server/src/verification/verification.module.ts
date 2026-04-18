import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { VerificationController } from './verification.controller';
import { AdminReviewController } from './admin-review.controller';
import { VerificationService } from './verification.service';
import { AdminReviewService } from './admin-review.service';
import { OcrService } from './ocr.service';
import { DocumentValidatorService } from './document-validator.service';
import { FaceService } from './face.service';
import { VerificationEventsService } from './verification-events.service';

@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [VerificationController, AdminReviewController],
  providers: [
    VerificationService,
    AdminReviewService,
    OcrService,
    DocumentValidatorService,
    FaceService,
    VerificationEventsService,
  ],
  exports: [VerificationService],
})
export class VerificationModule {}
