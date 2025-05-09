import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule as NestRedisModule } from '@nestjs-modules/ioredis';

@Module({
  imports: [
    NestRedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // useFactory: (configService: ConfigService) => ({
      //   type: 'single',
      //   url: configService.get('REDIS_URL'),
      //   host: configService.get('REDIS_HOST', 'localhost'),
      //   port: configService.get<number>('REDIS_PORT', 6379),
      //   password: configService.get('REDIS_PASSWORD', ''),
      //   db: configService.get<number>('REDIS_DB', 0),
      // }),
      useFactory: (configService: ConfigService) => {
        console.log('测试redis config', {
          type: 'single',
          url: configService.get('REDIS_URL'),
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD', ''),
          db: configService.get<number>('REDIS_DB', 0),
        });
        return {
          type: 'single',
          url: configService.get('REDIS_URL'),
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD', ''),
          db: configService.get<number>('REDIS_DB', 0),
        };
      },
    }),
  ],
  exports: [NestRedisModule],
})
export class RedisModule {}
