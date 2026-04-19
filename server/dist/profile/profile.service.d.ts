import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/profile.dto';
export declare class ProfileService {
    private prisma;
    constructor(prisma: PrismaService);
    getMe(userId: string): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            roles: import(".prisma/client").$Enums.UserRoleType[];
            verified: boolean;
        };
        profile: {
            education: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                profileUserId: string;
                institution: string;
                degree: string | null;
                fieldOfStudy: string | null;
                startDate: Date | null;
                endDate: Date | null;
                grade: string | null;
            }[];
            experience: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                company: string | null;
                location: string | null;
                description: string | null;
                title: string;
                profileUserId: string;
                startDate: Date | null;
                endDate: Date | null;
                employmentType: string | null;
                isCurrent: boolean;
            }[];
            certificates: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                title: string;
                profileUserId: string;
                issuer: string | null;
                issueDate: Date | null;
                expirationDate: Date | null;
                credentialId: string | null;
                credentialUrl: string | null;
            }[];
        } & {
            createdAt: Date;
            updatedAt: Date;
            avatarUrl: string | null;
            userId: string;
            fullName: string | null;
            about: string | null;
            bannerUrl: string | null;
            dob: Date | null;
            gender: import(".prisma/client").$Enums.Gender | null;
            pronouns: string | null;
        };
    }>;
    updateMe(userId: string, dto: UpdateProfileDto): Promise<{
        education: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            profileUserId: string;
            institution: string;
            degree: string | null;
            fieldOfStudy: string | null;
            startDate: Date | null;
            endDate: Date | null;
            grade: string | null;
        }[];
        experience: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            company: string | null;
            location: string | null;
            description: string | null;
            title: string;
            profileUserId: string;
            startDate: Date | null;
            endDate: Date | null;
            employmentType: string | null;
            isCurrent: boolean;
        }[];
        certificates: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            title: string;
            profileUserId: string;
            issuer: string | null;
            issueDate: Date | null;
            expirationDate: Date | null;
            credentialId: string | null;
            credentialUrl: string | null;
        }[];
    } & {
        createdAt: Date;
        updatedAt: Date;
        avatarUrl: string | null;
        userId: string;
        fullName: string | null;
        about: string | null;
        bannerUrl: string | null;
        dob: Date | null;
        gender: import(".prisma/client").$Enums.Gender | null;
        pronouns: string | null;
    }>;
    updateAvatar(userId: string, avatarUrl: string): Promise<{
        avatarUrl: string;
    }>;
    toggleRole(userId: string, role: 'candidate' | 'company_owner'): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            roles: import(".prisma/client").$Enums.UserRoleType[];
            verified: boolean;
        };
        profile: {
            education: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                profileUserId: string;
                institution: string;
                degree: string | null;
                fieldOfStudy: string | null;
                startDate: Date | null;
                endDate: Date | null;
                grade: string | null;
            }[];
            experience: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                company: string | null;
                location: string | null;
                description: string | null;
                title: string;
                profileUserId: string;
                startDate: Date | null;
                endDate: Date | null;
                employmentType: string | null;
                isCurrent: boolean;
            }[];
            certificates: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                title: string;
                profileUserId: string;
                issuer: string | null;
                issueDate: Date | null;
                expirationDate: Date | null;
                credentialId: string | null;
                credentialUrl: string | null;
            }[];
        } & {
            createdAt: Date;
            updatedAt: Date;
            avatarUrl: string | null;
            userId: string;
            fullName: string | null;
            about: string | null;
            bannerUrl: string | null;
            dob: Date | null;
            gender: import(".prisma/client").$Enums.Gender | null;
            pronouns: string | null;
        };
    }>;
}
