"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const prisma_module_1 = require("./prisma/prisma.module");
const profile_module_1 = require("./profile/profile.module");
const verification_module_1 = require("./verification/verification.module");
const company_module_1 = require("./company/company.module");
const opportunity_module_1 = require("./opportunity/opportunity.module");
const event_module_1 = require("./event/event.module");
const post_module_1 = require("./post/post.module");
const feed_module_1 = require("./feed/feed.module");
const media_module_1 = require("./media/media.module");
const connection_module_1 = require("./connection/connection.module");
const company_verification_module_1 = require("./company-verification/company-verification.module");
const payments_module_1 = require("./payments/payments.module");
const investment_module_1 = require("./investment/investment.module");
const ownership_claim_module_1 = require("./ownership-claim/ownership-claim.module");
const admin_module_1 = require("./admin/admin.module");
const ai_module_1 = require("./ai/ai.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            profile_module_1.ProfileModule,
            verification_module_1.VerificationModule,
            company_module_1.CompanyModule,
            opportunity_module_1.OpportunityModule,
            event_module_1.EventModule,
            post_module_1.PostModule,
            feed_module_1.FeedModule,
            media_module_1.MediaModule,
            connection_module_1.ConnectionModule,
            company_verification_module_1.CompanyVerificationModule,
            payments_module_1.PaymentsModule,
            investment_module_1.InvestmentModule,
            ownership_claim_module_1.OwnershipClaimModule,
            admin_module_1.AdminModule,
            ai_module_1.AiModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map