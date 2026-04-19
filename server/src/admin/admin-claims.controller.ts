import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OwnershipClaimService } from '../ownership-claim/ownership-claim.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminDecideClaimDto } from '../ownership-claim/dto/admin-decide-claim.dto';

/**
 * Admin Ownership Claims Dashboard
 *
 * All routes require: JwtAuthGuard + admin role
 *
 *  GET  /admin/ownership-claims          → paginated list with optional status filter
 *  GET  /admin/ownership-claims/stats    → summary counts + SLA breach alerts
 *  GET  /admin/ownership-claims/:id      → full claim detail
 *  PATCH /admin/ownership-claims/:id/decide → approve or reject
 */
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/ownership-claims')
export class AdminClaimsController {
  constructor(private readonly claimService: OwnershipClaimService) {}

  /** Dashboard statistics: pending counts, SLA breaches */
  @Get('stats')
  getStats() {
    return this.claimService.adminGetStats();
  }

  /** Paginated list of all claims, optionally filtered by status */
  @Get()
  listClaims(
    @Query('status') status?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.claimService.adminListClaims(status, Number(page), Number(limit));
  }

  /** Full claim detail including company + claimant profile */
  @Get(':claimId')
  getClaimDetail(@Param('claimId') claimId: string) {
    return this.claimService.adminGetClaimDetail(claimId);
  }

  /** Approve or reject a claim with optional role override and notes */
  @Patch(':claimId/decide')
  @HttpCode(HttpStatus.OK)
  decide(
    @Request() req,
    @Param('claimId') claimId: string,
    @Body() dto: AdminDecideClaimDto,
  ) {
    return this.claimService.adminDecide(claimId, req.user.userId, dto);
  }
}
