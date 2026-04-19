import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';

@Injectable()
export class DomainEmailVerificationService {
  private readonly logger = new Logger(DomainEmailVerificationService.name);

  private readonly OTP_EXPIRY_MINUTES = Number(
    process.env.CLAIM_DOMAIN_OTP_EXPIRY_MINUTES || 15,
  );

  constructor(private readonly prisma: PrismaService) {}

  /** Returns true if the email domain matches the company domain */
  validateEmailDomain(email: string, companyDomain: string): boolean {
    const emailDomain = email.split('@')[1]?.toLowerCase();
    return emailDomain === companyDomain.toLowerCase().replace(/^www\./, '');
  }

  /** Generates a 6-digit OTP, hashes it, stores in DB, and sends the email */
  async sendOtp(claimId: string, email: string): Promise<void> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRY_MINUTES);

    // Upsert token (overwrite if resending)
    await this.prisma.domainVerificationToken.upsert({
      where: { claimId },
      update: { email, otpHash, expiresAt },
      create: { claimId, email, otpHash, expiresAt },
    });

    // Update claim status
    await this.prisma.companyOwnershipClaim.update({
      where: { id: claimId },
      data: { status: 'domain_otp_sent', domainEmail: email },
    });

    await this.sendOtpEmail(email, otp);
    this.logger.log(`OTP sent to ${email} for claim ${claimId}`);
  }

  /** Verifies submitted OTP against stored hash */
  async verifyOtp(claimId: string, otp: string): Promise<boolean> {
    const token = await this.prisma.domainVerificationToken.findUnique({
      where: { claimId },
    });

    if (!token) return false;

    // Check expiry
    if (token.expiresAt < new Date()) {
      this.logger.warn(`OTP expired for claim ${claimId}`);
      return false;
    }

    const match = await bcrypt.compare(otp, token.otpHash);
    if (!match) return false;

    // Invalidate token after successful use
    await this.prisma.domainVerificationToken.delete({ where: { claimId } });
    return true;
  }

  private async sendOtpEmail(to: string, otp: string): Promise<void> {
    const host = process.env.SMTP_HOST;
    if (!host) {
      this.logger.warn('SMTP_HOST not configured – OTP email not sent (dev mode)');
      this.logger.log(`[DEV] OTP for ${to}: ${otp}`);
      return;
    }

    const transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Team MARKOV" <no-reply@teammarkov.com>',
      to,
      subject: 'Company Ownership Verification – OTP',
      html: `
        <div style="font-family: sans-serif; max-width: 480px;">
          <h2>Verify Your Company Ownership</h2>
          <p>Your one-time verification code is:</p>
          <h1 style="letter-spacing: 8px; color: #4f46e5;">${otp}</h1>
          <p>This code expires in <strong>${this.OTP_EXPIRY_MINUTES} minutes</strong>.</p>
          <p style="color: #6b7280; font-size: 12px;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
      `,
    });
  }
}
