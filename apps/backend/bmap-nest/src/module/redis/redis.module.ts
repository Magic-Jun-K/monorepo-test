import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule as NestRedisModule } from '@nestjs-modules/ioredis';

import { RedisService } from './redis.service';
import { RedisLRUService } from './redis-lru.service';
import redisConfig from '../../config/redis';

@Module({
  imports: [
    ConfigModule.forFeature(redisConfig),
    NestRedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisConf = config.get('redis');
        return {
          type: 'single', // 单机模式
          url: redisConf?.connection?.url || 'localhost',
          port: redisConf?.connection?.port || 6379,
          password: redisConf?.connection?.password,
          db: redisConf?.connection?.db || 0,
          // 启用LRU缓存的Redis配置
          commandTimeout: 5000, // 命令超时时间（毫秒）
          maxRetriesPerRequest: 3, // 每个请求的最大重试次数
          enableReadyCheck: true, // 启用就绪检查
          enableOfflineQueue: true, // 启用离线队列
          // 连接事件处理
          retryStrategy: (times) => Math.min(times * 50, 2000), // 重试策略
        };
      },
    }),
  ],
  providers: [RedisService, RedisLRUService],
  exports: [RedisService, RedisLRUService],
})
export class RedisModule {}
