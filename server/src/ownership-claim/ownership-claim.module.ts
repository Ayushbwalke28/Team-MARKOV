import { Module } from '@nestjs/common';
import { OwnershipClaimController } from './ownership-claim.controller';
import { OwnershipClaimService } from './ownership-claim.service';
import { DomainEmailVerificationService } from './domain-email-verification.service';
import { GstCrosscheckService } from './gst-crosscheck.service';
import { CompanyRoleGuard } from './company-role.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { CompanyVerificationModule } from '../company-verification/company-verification.module';

@Module({
  imports: [PrismaModule, CompanyVerificationModule],
  controllers: [OwnershipClaimController],
  providers: [
    OwnershipClaimService,
    DomainEmailVerificationService,
    GstCrosscheckService,
    CompanyRoleGuard,
  ],
  exports: [OwnershipClaimService, CompanyRoleGuard],
})
export class OwnershipClaimModule {}
