export declare const authConfig: {
    jwt: {
        accessSecret: string;
        refreshSecret: string;
        accessTtl: string;
        refreshTtl: string;
    };
    bcrypt: {
        rounds: number;
    };
};
export declare function assertAuthSecretsSafeForProd(): void;
