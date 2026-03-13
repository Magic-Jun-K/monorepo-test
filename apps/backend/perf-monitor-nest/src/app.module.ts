import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { MongooseModule } from '@nestjs/mongoose';

import { PerformanceModule } from './modules/performance/performance.module';
import { CollectorModule } from './modules/collector/collector.module';
import { VisualizationModule } from './modules/visualization/visualization.module';
import { ErrorLogModule } from './modules/error-log/error-log.module';
import { KafkaModule } from './common/kafka/kafka.module';
import { KafkaConsumerModule } from './modules/kafka-consumer/kafka-consumer.module';

import { AppController } from './app.controller';

import { AppService } from './app.service';
import { MonitoringService } from './common/monitoring/monitoring.service';
import { MaintenanceService } from './common/maintenance/maintenance.service';
import { DbHealthService } from './database/db-health.service';
import { RedisService } from './database/redis/redis.service';

import { PerformanceQueueProcessor } from './queues/performance.queue';
import { ErrorQueueProcessor } from './queues/error.queue';

import { Performance, PerformanceSchema } from './modules/performance/performance.schema';
import { ErrorLog, ErrorLogSchema } from './modules/error-log/schemas/error-log.schema';

@Module({
  imports: [
    KafkaModule,
    KafkaConsumerModule,
    // 数据库模块
    DatabaseModule,
    // 配置限流
    // 1 分钟内，允许100次请求
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 时间间隔 60秒
        limit: 100, // 最多100次请求
      },
    ]),
    // 启用定时任务
    ScheduleModule.forRoot(),
    // 1. 全局配置 Redis 连接 (Bull)
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT'),
          username: config.get('REDIS_USERNAME'),
          password: config.get('REDIS_PASSWORD'),
        },
      }),
    }),
    // 2. 注册队列（需与 @Processor 装饰器匹配）
    BullModule.registerQueue({ name: 'performance' }, { name: 'error' }),
    // 3. 注册 MongoDB 模型
    MongooseModule.forFeature([
      { name: Performance.name, schema: PerformanceSchema },
      { name: ErrorLog.name, schema: ErrorLogSchema },
    ]),
    PerformanceModule,
    CollectorModule,
    VisualizationModule,
    ErrorLogModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PerformanceQueueProcessor,
    ErrorQueueProcessor,
    MonitoringService,
    MaintenanceService,
    DbHealthService,
    RedisService,
  ],
  exports: [MonitoringService],
})
export class AppModule {}
