import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CompanyVerificationService } from './company-verification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StartCompanyVerificationDto } from './dto/start-company-verification.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';

/**
 * Company Verification API
 *
 * Flow:
 *  1. POST /company-verify/start         → Start verification session (requires GSTIN + optional CIN)
 *  2. POST /company-verify/:id/upload    → Upload registration & incorporation docs
 *  3. POST /company-verify/:id/submit    → Trigger AI verification (replaces manual admin review)
 *  4. GET  /company-verify/:id/status    → Poll session + company verification status
 */
@Controller('company-verify')
export class CompanyVerificationController {
  constructor(private readonly verificationService: CompanyVerificationService) {}

  /**
   * Step 1 – Start a new company verification session.
   * Requires: companyId, gstin (mandatory), cinNumber (optional but recommended)
   */
  @UseGuards(JwtAuthGuard)
  @Post('start')
  @HttpCode(HttpStatus.CREATED)
  startVerification(@Request() req, @Body() dto: StartCompanyVerificationDto) {
    return this.verificationService.startVerification(
      dto.companyId,
      req.user.userId,
      dto.gstin,
      dto.cinNumber,
    );
  }

  /**
   * Step 2 – Upload legal proof documents.
   * Requires: documentType, fileUrl (registration doc URL)
   * Optional: incorporationCertUrl (strengthens AI confidence)
   */
  @UseGuards(JwtAuthGuard)
  @Post(':sessionId/upload')
  @HttpCode(HttpStatus.OK)
  uploadDocument(
    @Request() req,
    @Param('sessionId') sessionId: string,
    @Body() dto: UploadDocumentDto,
  ) {
    return this.verificationService.submitDocument(
      sessionId,
      req.user.userId,
      dto.documentType,
      dto.fileUrl,
      dto.incorporationCertUrl,
    );
  }

  /**
   * Step 3 – Submit for AI-powered verification.
   * The AI analyzes GSTIN format, CIN format, and document presence,
   * then returns: approved / rejected / manual_review.
   * No admin action required for approved/rejected outcomes.
   */
  @UseGuards(JwtAuthGuard)
  @Post(':sessionId/submit')
  @HttpCode(HttpStatus.OK)
  submitForAiVerification(@Request() req, @Param('sessionId') sessionId: string) {
    return this.verificationService.runAiVerification(sessionId, req.user.userId);
  }

  /**
   * Step 4 – Get current session and company verification status.
   */
  @UseGuards(JwtAuthGuard)
  @Get(':sessionId/status')
  getStatus(@Request() req, @Param('sessionId') sessionId: string) {
    return this.verificationService.getSessionStatus(sessionId, req.user.userId);
  }
}
