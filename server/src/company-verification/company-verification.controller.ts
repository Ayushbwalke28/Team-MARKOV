import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CompanyVerificationService } from './company-verification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StartCompanyVerificationDto } from './dto/start-company-verification.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';

@Controller('api/company-verify')
export class CompanyVerificationController {
  constructor(private readonly verificationService: CompanyVerificationService) {}

  @UseGuards(JwtAuthGuard)
  @Post('start')
  startVerification(@Request() req, @Body() dto: StartCompanyVerificationDto) {
    return this.verificationService.startVerification(dto.companyId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':sessionId/upload')
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
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':sessionId/submit')
  submitValidation(@Request() req, @Param('sessionId') sessionId: string) {
    return this.verificationService.runMockApiValidation(sessionId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':sessionId/status')
  getStatus(@Request() req, @Param('sessionId') sessionId: string) {
    return this.verificationService.getSessionStatus(sessionId, req.user.userId);
  }
}
