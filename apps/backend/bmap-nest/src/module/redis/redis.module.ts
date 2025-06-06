import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule as NestRedisModule } from '@nestjs-modules/ioredis';

import { RedisService } from './redis.service';

@Module({
  imports: [
    NestRedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        // console.log('测试redis config', {
        //   url: configService.get('REDIS_URL', 'localhost'),
        //   port: configService.get<number>('REDIS_PORT', 6379),
        //   password: configService.get('REDIS_PASSWORD'),
        //   db: configService.get<number>('REDIS_DB', 0),
        // });
        return {
          type: 'single', // 单机模式
          url: config.get('REDIS_URL', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          password: config.get('REDIS_PASSWORD'),
          db: config.get<number>('REDIS_DB', 0),
        };
      },
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
