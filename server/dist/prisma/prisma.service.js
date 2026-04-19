"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    constructor() {
        const url = process.env.DATABASE_URL;
        if (!url) {
            throw new Error('DATABASE_URL is not defined in environment variables');
        }
        const pool = new pg_1.Pool({
            connectionString: url,
            ssl: url.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
        });
        super({
            adapter: new adapter_pg_1.PrismaPg(pool),
            log: ['warn', 'error'],
        });
        this.logger = new common_1.Logger(PrismaService_1.name);
        this.pool = pool;
    }
    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('PrismaService: Connected to database');
        }
        catch (error) {
            this.logger.error('PrismaService: Failed to connect to database', error);
            throw error;
        }
    }
    async onModuleDestroy() {
        try {
            await this.$disconnect();
            await this.pool.end();
            this.logger.log('PrismaService: Disconnected from database');
        }
        catch (error) {
            this.logger.error('PrismaService: Error during disconnection', error);
        }
    }
    async enableShutdownHooks(app) {
        process.once('SIGINT', async () => {
            await app.close();
        });
        process.once('SIGTERM', async () => {
            await app.close();
        });
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map