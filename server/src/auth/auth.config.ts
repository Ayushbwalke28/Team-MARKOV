import { InternalServerErrorException } from '@nestjs/common';

function requiredEnv(name: string): string | undefined {
  const value = process.env[name];
  if (!value || value.trim().length === 0) return undefined;
  return value;
}

export const authConfig = {
  jwt: {
    accessSecret:
      requiredEnv('JWT_ACCESS_SECRET') ??
      requiredEnv('JWT_SECRET') ??
      'dev_only_change_me_access',
    refreshSecret:
      requiredEnv('JWT_REFRESH_SECRET') ??
      requiredEnv('JWT_SECRET') ??
      'dev_only_change_me_refresh',
    accessTtl: requiredEnv('JWT_ACCESS_TTL') ?? '15m',
    refreshTtl: requiredEnv('JWT_REFRESH_TTL') ?? '30d',
  },
  bcrypt: {
    rounds: Number(process.env.BCRYPT_ROUNDS ?? 12),
  },
};

export function assertAuthSecretsSafeForProd(): void {
  if (process.env.NODE_ENV !== 'production') return;

  const badSecrets = new Set(['dev_only_change_me_access', 'dev_only_change_me_refresh']);
  if (badSecrets.has(authConfig.jwt.accessSecret) || badSecrets.has(authConfig.jwt.refreshSecret)) {
    throw new InternalServerErrorException(
      'JWT secrets must be set in production (JWT_ACCESS_SECRET/JWT_REFRESH_SECRET).',
    );
  }
}

