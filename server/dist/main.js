"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const cookieParser = require("cookie-parser");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    app.enableCors({ origin: [clientUrl], credentials: true });
    app.use(cookieParser());
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const port = process.env.PORT || 3001;
    const host = '0.0.0.0';
    await app.listen(port, host);
    logger.log(`Application is running on: http://${host}:${port}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map