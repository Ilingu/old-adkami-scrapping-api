import { HttpModule } from '@nestjs/axios';
import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheService } from './cache.service';

@Module({
  imports: [
    process.env.STAGE === 'dev' &&
      ConfigModule.forRoot({ envFilePath: [`.env.dev`] }),
    CacheModule.register(),
    HttpModule,
  ],
  controllers: [AppController],
  providers: [AppService, CacheService],
})
export class AppModule {}
