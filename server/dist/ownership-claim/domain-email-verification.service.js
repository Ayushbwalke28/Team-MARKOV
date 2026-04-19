"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DomainEmailVerificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainEmailVerificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
let DomainEmailVerificationService = DomainEmailVerificationService_1 = class DomainEmailVerificationService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(DomainEmailVerificationService_1.name);
        this.OTP_EXPIRY_MINUTES = Number(process.env.CLAIM_DOMAIN_OTP_EXPIRY_MINUTES || 15);
    }
    validateEmailDomain(email, companyDomain) {
        const emailDomain = email.split('@')[1]?.toLowerCase();
        return emailDomain === companyDomain.toLowerCase().replace(/^www\./, '');
    }
    async sendOtp(claimId, email) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpHash = await bcrypt.hash(otp, 10);
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRY_MINUTES);
        await this.prisma.domainVerificationToken.upsert({
            where: { claimId },
            update: { email, otpHash, expiresAt },
            create: { claimId, email, otpHash, expiresAt },
        });
        await this.prisma.companyOwnershipClaim.update({
            where: { id: claimId },
            data: { status: 'domain_otp_sent', domainEmail: email },
        });
        await this.sendOtpEmail(email, otp);
        this.logger.log(`OTP sent to ${email} for claim ${claimId}`);
    }
    async verifyOtp(claimId, otp) {
        const token = await this.prisma.domainVerificationToken.findUnique({
            where: { claimId },
        });
        if (!token)
            return false;
        if (token.expiresAt < new Date()) {
            this.logger.warn(`OTP expired for claim ${claimId}`);
            return false;
        }
        const match = await bcrypt.compare(otp, token.otpHash);
        if (!match)
            return false;
        await this.prisma.domainVerificationToken.delete({ where: { claimId } });
        return true;
    }
    async sendOtpEmail(to, otp) {
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
};
exports.DomainEmailVerificationService = DomainEmailVerificationService;
exports.DomainEmailVerificationService = DomainEmailVerificationService = DomainEmailVerificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DomainEmailVerificationService);
//# sourceMappingURL=domain-email-verification.service.js.map