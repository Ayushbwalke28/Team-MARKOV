import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { VerificationService } from './verification.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { ConsentDto } from './dto/consent.dto';

@Controller('verify')
@UseGuards(JwtAuthGuard)
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  /**
   * POST /api/verify/start — Begin a new verification session.
   */
  @Post('start')
  async startSession(@Req() req: any) {
    return this.verificationService.startSession(req.user.userId);
  }

  /**
   * POST /api/verify/consent/:sessionId — Record user consent.
   */
  @Post('consent/:sessionId')
  async recordConsent(
    @Req() req: any,
    @Param('sessionId') sessionId: string,
    @Body() body: ConsentDto,
  ) {
    if (!body.consent) {
      throw new BadRequestException('Consent must be given to proceed');
    }
    return this.verificationService.recordConsent(sessionId, req.user.userId);
  }

  /**
   * POST /api/verify/:sessionId/document — Upload ID document (front + optional back).
   */
  @Post(':sessionId/document')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'front', maxCount: 1 },
      { name: 'back', maxCount: 1 },
    ]),
  )
  async uploadDocument(
    @Req() req: any,
    @Param('sessionId') sessionId: string,
    @Body() body: UploadDocumentDto,
    @UploadedFiles() files: { front?: Express.Multer.File[]; back?: Express.Multer.File[] },
  ) {
    if (!files?.front?.[0]) {
      throw new BadRequestException('Front image of the document is required');
    }

    const frontFile = files.front[0];
    const backFile = files.back?.[0];

    // Validate file types
    const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedMimes.includes(frontFile.mimetype)) {
      throw new BadRequestException('Unsupported file format. Use JPEG, PNG, or PDF.');
    }
    if (backFile && !allowedMimes.includes(backFile.mimetype)) {
      throw new BadRequestException('Unsupported back image format. Use JPEG, PNG, or PDF.');
    }

    return this.verificationService.uploadDocument(
      sessionId,
      req.user.userId,
      body.documentType,
      frontFile.buffer,
      backFile?.buffer,
    );
  }

  /**
   * POST /api/verify/:sessionId/face — Upload selfie for face matching.
   */
  @Post(':sessionId/face')
  @UseInterceptors(FileInterceptor('selfie'))
  async captureFace(
    @Req() req: any,
    @Param('sessionId') sessionId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Selfie image is required');
    }

    const allowedMimes = ['image/jpeg', 'image/png'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Selfie must be JPEG or PNG');
    }

    return this.verificationService.captureFace(sessionId, req.user.userId, file.buffer);
  }

  /**
   * GET /api/verify/status/:sessionId — Get session status.
   */
  @Get('status/:sessionId')
  async getSessionStatus(@Req() req: any, @Param('sessionId') sessionId: string) {
    return this.verificationService.getSessionStatus(sessionId, req.user.userId);
  }

  /**
   * GET /api/verify/me — Get current user's latest verification status.
   */
  @Get('me')
  async getMyVerification(@Req() req: any) {
    return this.verificationService.getUserVerificationStatus(req.user.userId);
  }

  /**
   * POST /api/verify/retry — Start a new verification attempt.
   */
  @Post('retry')
  async retryVerification(@Req() req: any) {
    return this.verificationService.startSession(req.user.userId);
  }

  /**
   * DELETE /api/verify/data — Request deletion of verification data (GDPR).
   */
  @Delete('data')
  async deleteVerificationData(@Req() req: any) {
    return this.verificationService.deleteUserData(req.user.userId);
  }

  /**
   * GET /api/verify/consent — Get consent requirements and disclosure text.
   */
  @Get('consent')
  getConsentInfo() {
    return {
      required: true,
      disclosure: [
        'We will capture your government-issued ID and a live selfie to verify your identity.',
        'Your biometric data (facial image) will be processed server-side and not stored permanently.',
        'Only verification status, confidence score, and timestamp are retained.',
        'Raw images are automatically deleted after processing (within 24 hours maximum).',
        'You may request deletion of all verification data at any time.',
        'By consenting, you agree to the processing of your biometric and identity data for verification purposes only.',
      ],
      dataProcessed: [
        'Government ID image (front and back)',
        'Live selfie/photo',
        'Extracted text data (name, DOB, ID number)',
      ],
      retentionPolicy: 'Raw images deleted within 24 hours. Metadata retained until account deletion.',
      rightsInfo: 'You have the right to request deletion of your verification data via DELETE /api/verify/data.',
    };
  }
}
