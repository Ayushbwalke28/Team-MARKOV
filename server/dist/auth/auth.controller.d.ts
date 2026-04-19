import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import type { Request, Response } from 'express';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    private setAuthCookies;
    private clearAuthCookies;
    register(body: RegisterDto, res: Response): Promise<{
        user: import("../users/users.types").PublicUser;
    }>;
    login(req: Request, res: Response): Promise<{
        user: import("../users/users.types").PublicUser;
    }>;
    me(req: any): Promise<import("../users/users.types").PublicUser>;
    refresh(req: Request, res: Response): Promise<{
        user: import("../users/users.types").PublicUser;
    }>;
    logout(req: Request, res: Response): Promise<{
        ok: boolean;
    }>;
    changePassword(req: any, body: ChangePasswordDto): Promise<{
        ok: true;
    }>;
    googleAuth(req: Request): Promise<void>;
    googleAuthRedirect(req: Request, res: Response): Promise<void>;
}
