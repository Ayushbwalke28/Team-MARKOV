import { Module } from '@nestjs/common';
import { CompanyVerificationController } from './company-verification.controller';
import { CompanyVerificationService } from './company-verification.service';
import { AiVerificationService } from './ai-verification.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CompanyVerificationController],
  providers: [CompanyVerificationService, AiVerificationService],
  exports: [AiVerificationService],
})
export class CompanyVerificationModule {}
