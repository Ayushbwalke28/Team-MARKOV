import { Body, Controller, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SetVerificationDto } from './dto/set-verification.dto';
import { VerificationService } from './verification.service';

@Controller('verification')
export class VerificationController {
  constructor(private verificationService: VerificationService) {}

  // Placeholder endpoint: toggles verification flag.
  // Real verification (OTP/email/KYC) can later be implemented behind this service.
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async setMe(@Req() req: any, @Body() body: SetVerificationDto) {
    const updated = await this.verificationService.setVerified(req.user.userId, body.verified);
    return {
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        roles: updated.roles.map((r) => r.role),
        verified: updated.verified,
      },
    };
  }
}

