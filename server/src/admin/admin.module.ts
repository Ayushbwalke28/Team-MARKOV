import { Module } from '@nestjs/common';
import { AdminClaimsController } from './admin-claims.controller';
import { OwnershipClaimModule } from '../ownership-claim/ownership-claim.module';

@Module({
  imports: [OwnershipClaimModule],
  controllers: [AdminClaimsController],
})
export class AdminModule {}
