import { CreateUserInput, PublicUser, User, UserId, UserRoleType } from './users.types';
import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findOneByEmail(email: string): Promise<User | undefined>;
    findOneByGoogleId(googleId: string): Promise<User | undefined>;
    findOneByEmailWithRoles(email: string): Promise<{
        roles: {
            createdAt: Date;
            userId: string;
            role: import(".prisma/client").$Enums.UserRoleType;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        verified: boolean;
        email: string;
        passwordHash: string | null;
        googleId: string | null;
        refreshTokenHash: string | null;
        avatarUrl: string | null;
    }>;
    findById(id: UserId): Promise<User | undefined>;
    findByIdWithRoles(id: UserId): Promise<{
        roles: {
            createdAt: Date;
            userId: string;
            role: import(".prisma/client").$Enums.UserRoleType;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        verified: boolean;
        email: string;
        passwordHash: string | null;
        googleId: string | null;
        refreshTokenHash: string | null;
        avatarUrl: string | null;
    }>;
    create(input: CreateUserInput): Promise<User>;
    setRefreshTokenHash(userId: UserId, refreshTokenHash: string | null): Promise<void>;
    setGoogleId(userId: UserId, googleId: string): Promise<void>;
    setPasswordHash(userId: UserId, passwordHash: string): Promise<void>;
    setVerified(userId: UserId, verified: boolean): Promise<void>;
    setAvatar(userId: UserId, avatarUrl: string): Promise<void>;
    setOwnsCompany(userId: UserId, ownsCompany: boolean): Promise<void>;
    toPublicUser(user: Pick<User, 'id' | 'email' | 'name' | 'verified'> & {
        roles?: Array<{
            role: UserRoleType;
        }>;
    }): PublicUser;
}
