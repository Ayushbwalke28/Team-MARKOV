import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { authConfig } from '../auth.config';

function accessTokenFromCookie(req: any): string | null {
  const token = req?.cookies?.access_token;
  return typeof token === 'string' && token.length > 0 ? token : null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
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
    // The payload is the decoded JWT token.
    return { userId: payload.sub, email: payload.email };
  }
}
