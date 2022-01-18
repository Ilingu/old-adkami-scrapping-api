import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Logger
  const logger = new Logger();

  // App Config
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const port = process.env.PORT || 3001;

  await app.listen(port);
  logger.log(`Application is now live on port ${port} ✨`);
}
bootstrap();
