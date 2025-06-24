/**
 * @description 数据库集成（多数据源）
 */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InfluxModule } from './influx/influx.module';
import { MongooseConfig } from './mongoose.config';
import { RedisCacheModule } from './redis.module';

@Module({
  imports: [
    ConfigModule.forRoot(), // 确保配置模块已加载

    // 时序数据库 (InfluxDB)
    InfluxModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        url: config.get<string>('INFLUX_URL')!,
        token: config.get<string>('INFLUX_TOKEN')!,
        org: config.get<string>('INFLUX_ORG')!,
        bucket: config.get<string>('INFLUX_BUCKET_PERF')!,
      }),
    }),

    // MongoDB (错误日志)
    MongooseConfig,

    // PostgreSQL (元数据)
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('PG_HOST')!,
        port: config.get<number>('PG_PORT')!,
        username: config.get<string>('PG_USER')!,
        password: config.get<string>('PG_PASSWORD')!,
        database: config.get<string>('PG_DB_META')!,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: config.get<string>('NODE_ENV') !== 'production',
        extra: {
          max: 100, // 连接池最大连接数
          connectionTimeoutMillis: 5000, // 连接超时时间
        },
      }),
    }),
    RedisCacheModule,
  ],
  exports: [InfluxModule, RedisCacheModule],
})
export class DatabaseModule {}
