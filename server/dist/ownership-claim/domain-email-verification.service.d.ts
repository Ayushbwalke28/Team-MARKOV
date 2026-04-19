import { PrismaService } from '../prisma/prisma.service';
export declare class DomainEmailVerificationService {
    private readonly prisma;
    private readonly logger;
    private readonly OTP_EXPIRY_MINUTES;
    constructor(prisma: PrismaService);
    validateEmailDomain(email: string, companyDomain: string): boolean;
    sendOtp(claimId: string, email: string): Promise<void>;
    verifyOtp(claimId: string, otp: string): Promise<boolean>;
    private sendOtpEmail;
}
