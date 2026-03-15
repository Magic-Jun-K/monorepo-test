import { Module } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'single',
        options: {
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT'),
          username: config.get('REDIS_USERNAME'),
          password: config.get('REDIS_PASSWORD'),
        },
        keyPrefix: 'perf:', // 缓存键前缀
      }),
    }),
  ],
  exports: [RedisModule],
})
export class RedisCacheModule {}
