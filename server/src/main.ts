import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend integration
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  app.enableCors({ origin: [clientUrl], credentials: true });

  // Parse HttpOnly auth cookies (access/refresh tokens)
  app.use(cookieParser());
  
  // Set global prefix
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3001;
  const host = '0.0.0.0';
  
  await app.listen(port, host);
  logger.log(`Application is running on: http://${host}:${port}/api`);
}
bootstrap();
