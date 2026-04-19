import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OwnershipClaimService } from './ownership-claim.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateClaimDto } from './dto/create-claim.dto';
import { SendDomainOtpDto } from './dto/send-domain-otp.dto';
import { VerifyDomainOtpDto } from './dto/verify-domain-otp.dto';
import { UploadClaimDocumentDto } from './dto/upload-claim-document.dto';
import { GstValidateDto } from './dto/gst-validate.dto';

/**
 * Ownership Claim API
 *
 * Flow (choose one verification method):
 *  1. POST /ownership-claims                         → Create claim
 *  A) POST /ownership-claims/:id/domain-email/send-otp → Send OTP
 *     POST /ownership-claims/:id/domain-email/verify   → Verify OTP → auto-approved
 *  B) POST /ownership-claims/:id/documents             → Upload docs → AI decides
 *  C) POST /ownership-claims/:id/gst-validate          → GST check → admin review
 *  D) POST /ownership-claims/:id/request-admin-review  → Manual escalation
 */
@UseGuards(JwtAuthGuard)
@Controller('ownership-claims')
export class OwnershipClaimController {
  constructor(private readonly claimService: OwnershipClaimService) {}

  /** Create a new ownership claim for a company */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Request() req, @Body() dto: CreateClaimDto) {
    return this.claimService.createClaim(req.user.userId, dto);
  }

  /** List all claims submitted by the current user */
  @Get('my')
  getMyClaims(@Request() req) {
    return this.claimService.getMyClaims(req.user.userId);
  }

  /** Get a specific claim's detail */
  @Get(':claimId')
  getDetail(@Request() req, @Param('claimId') claimId: string) {
    return this.claimService.getClaimDetail(claimId, req.user.userId);
  }

  /** Withdraw a pending claim */
  @Delete(':claimId')
  withdraw(@Request() req, @Param('claimId') claimId: string) {
    return this.claimService.withdrawClaim(claimId, req.user.userId);
  }

  // ─── Method A: Domain Email ─────────────────────────────────────────────────

  /** Send OTP to a domain email (e.g. ceo@acmecorp.com) */
  @Post(':claimId/domain-email/send-otp')
  sendDomainOtp(
    @Request() req,
    @Param('claimId') claimId: string,
    @Body() dto: SendDomainOtpDto,
  ) {
    return this.claimService.sendDomainOtp(claimId, req.user.userId, dto.email);
  }

  /** Verify the OTP — auto-approves on match */
  @Post(':claimId/domain-email/verify')
  verifyDomainOtp(
    @Request() req,
    @Param('claimId') claimId: string,
    @Body() dto: VerifyDomainOtpDto,
  ) {
    return this.claimService.verifyDomainOtp(claimId, req.user.userId, dto.otp);
  }

  // ─── Method B: Business Documents ──────────────────────────────────────────

  /** Upload authorization letter + optional government ID. AI decides outcome. */
  @Post(':claimId/documents')
  uploadDocuments(
    @Request() req,
    @Param('claimId') claimId: string,
    @Body() dto: UploadClaimDocumentDto,
  ) {
    return this.claimService.uploadDocuments(
      claimId,
      req.user.userId,
      dto.authorizationLetterUrl,
      dto.governmentIdUrl,
    );
  }

  // ─── Method C: GST Validation ───────────────────────────────────────────────

  /** Cross-check GSTIN against India's GST registry. Always escalates to admin. */
  @Post(':claimId/gst-validate')
  validateGstin(
    @Request() req,
    @Param('claimId') claimId: string,
    @Body() dto: GstValidateDto,
  ) {
    return this.claimService.validateGstin(
      claimId,
      req.user.userId,
      dto.gstin,
      dto.cinNumber,
    );
  }

  // ─── Method D: Admin Review Fallback ───────────────────────────────────────

  /** Manually escalate claim to admin review queue */
  @Post(':claimId/request-admin-review')
  requestAdminReview(@Request() req, @Param('claimId') claimId: string) {
    return this.claimService.requestAdminReview(claimId, req.user.userId);
  }
}
