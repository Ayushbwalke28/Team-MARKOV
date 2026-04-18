import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { authConfig } from '../auth.config';
import { UsersService } from '../../users/users.service';

function accessTokenFromCookie(req: any): string | null {
  const token = req?.cookies?.access_token;
  return typeof token === 'string' && token.length > 0 ? token : null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        accessTokenFromCookie,
        // Keep header support for non-browser clients (optional)
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: authConfig.jwt.accessSecret,
    });
  }

  async validate(payload: any) {
    // Fetch roles from DB so guards can use them without an additional lookup.
    const userWithRoles = await this.usersService.findByIdWithRoles(payload.sub);
    const roles = (userWithRoles?.roles ?? []).map((r) => r.role);
    return { userId: payload.sub, email: payload.email, roles };
  }
}
