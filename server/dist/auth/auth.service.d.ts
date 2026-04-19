import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { PublicUser } from '../users/users.types';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    private hashPassword;
    private hashRefreshToken;
    private refreshTokenMatches;
    private buildAuthResponse;
    validateUser(email: string, pass: string): Promise<PublicUser | null>;
    login(user: PublicUser): Promise<{
        accessToken: string;
        refreshToken: string;
        user: PublicUser;
    }>;
    register(data: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: PublicUser;
    }>;
    validateOAuthUser(profile: any): Promise<PublicUser>;
    me(userId: string): Promise<PublicUser>;
    refreshFromToken(refreshToken: string | undefined): Promise<{
        accessToken: string;
        refreshToken: string;
        user: PublicUser;
    }>;
    logout(userId: string): Promise<{
        ok: true;
    }>;
    logoutFromRefreshToken(refreshToken: string | undefined): Promise<{
        ok: true;
    }>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        ok: true;
    }>;
}
