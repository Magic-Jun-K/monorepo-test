/**
 * @description 数据库集成（多数据源）
 */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

import { ClickHouseModule } from './clickhouse/clickhouse.module';
import { RedisCacheModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 设置为全局模块
      envFilePath: ['.env.local'],
    }), // 确保配置模块已加载

    // 时序数据库 (ClickHouse)
    ClickHouseModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        host: config.get<string>('CLICKHOUSE_HOST', 'http://localhost'),
        port: config.get<number>('CLICKHOUSE_PORT', 8123),
        username: config.get<string>('CLICKHOUSE_USER', 'admin'),
        password: config.get<string>('CLICKHOUSE_PASSWORD', 'test123'),
        database: config.get<string>('CLICKHOUSE_DB', 'perf_monitor'),
      }),
    }),

    // MongoDB (错误日志)
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
        dbName: config.get<string>('MONGO_DB_ERRORS'),
        connectionFactory: (connection: Connection) => {
          // 性能优化配置
          connection.set('debug', config.get('NODE_ENV') === 'development');
          connection.set('bufferCommands', false);
          connection.set('autoIndex', false);
          return connection;
        },
      }),
    }),

    // PostgreSQL (元数据)
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (config: ConfigService) => ({
    //     type: 'postgres',
    //     host: config.get<string>('PG_HOST')!,
    //     port: config.get<number>('PG_PORT')!,
    //     username: config.get<string>('PG_USER')!,
    //     password: config.get<string>('PG_PASSWORD')!,
    //     database: config.get<string>('PG_DB_META')!,
    //     entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    //     synchronize: config.get<string>('NODE_ENV') !== 'production',
    //     extra: {
    //       max: 100, // 连接池最大连接数
    //       connectionTimeoutMillis: 5000, // 连接超时时间
    //     },
    //   }),
    // }),
    RedisCacheModule,
  ],
  exports: [ClickHouseModule, RedisCacheModule],
})
export class DatabaseModule {}
