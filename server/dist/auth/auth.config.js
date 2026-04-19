"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authConfig = void 0;
exports.assertAuthSecretsSafeForProd = assertAuthSecretsSafeForProd;
const common_1 = require("@nestjs/common");
function requiredEnv(name) {
    const value = process.env[name];
    if (!value || value.trim().length === 0)
        return undefined;
    return value;
}
exports.authConfig = {
    jwt: {
        accessSecret: requiredEnv('JWT_ACCESS_SECRET') ??
            requiredEnv('JWT_SECRET') ??
            'dev_only_change_me_access',
        refreshSecret: requiredEnv('JWT_REFRESH_SECRET') ??
            requiredEnv('JWT_SECRET') ??
            'dev_only_change_me_refresh',
        accessTtl: requiredEnv('JWT_ACCESS_TTL') ?? '15m',
        refreshTtl: requiredEnv('JWT_REFRESH_TTL') ?? '30d',
    },
    bcrypt: {
        rounds: Number(process.env.BCRYPT_ROUNDS ?? 12),
    },
};
function assertAuthSecretsSafeForProd() {
    if (process.env.NODE_ENV !== 'production')
        return;
    const badSecrets = new Set(['dev_only_change_me_access', 'dev_only_change_me_refresh']);
    if (badSecrets.has(exports.authConfig.jwt.accessSecret) || badSecrets.has(exports.authConfig.jwt.refreshSecret)) {
        throw new common_1.InternalServerErrorException('JWT secrets must be set in production (JWT_ACCESS_SECRET/JWT_REFRESH_SECRET).');
    }
}
//# sourceMappingURL=auth.config.js.map