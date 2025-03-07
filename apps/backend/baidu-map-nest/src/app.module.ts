/**
 * @description 入口模块
 */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';

import { AuthGuard } from './common/guards/Auth';
import { AppController } from './app.controller';
import { AppService, PgService } from './app.service';
import { DetailModule } from './module/detail/detail.module';
import { FileModule } from './module/file/file.module';
import { AuthModule } from './module/auth/auth.module';
import { ImageModule } from './module/image/image.module';
import database from './config/database';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.local', '.env.prod'],
      load: [database],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      // useFactory: (config: ConfigService) => config.get('database'),
      useFactory: database,
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), // 静态资源目录
      serveStaticOptions: {
        // 强缓存配置（1年，immutable）
        cacheControl: true,
        maxAge: 31536000000, // 毫秒单位，这里设置了1年缓存
        immutable: true, // 标记资源不可变
        // 显式覆盖 Cache-Control 头（可选）
        // setHeaders: (res, path) => {
        //   res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        // },

        // 其他高级配置（如 ETag、压缩）
        etag: true,
        lastModified: true,
        setHeaders: (res, path) => {
          // 针对特定文件类型定制头（可选）
          if (path.endsWith('.br')) {
            res.setHeader('Content-Encoding', 'br');
          }
        },
      },
    }),
    AuthModule,
    DetailModule,
    FileModule,
    ImageModule
  ], // 需要导入的模块
  exports: [PgService, TypeOrmModule, ConfigModule], // 往外暴露的模块
  controllers: [AppController], // 控制器，定义路由
  providers: [
    AppService,
    PgService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    Reflector,
  ], // 提供可注入的一些服务
})
export class AppModule {
  // 这种全局中间件，建议按照全局注册的方式来处理
  // configure(consumer: MiddlewareConsumer) {
  //   consumer.apply(LoggerMiddleware).forRoutes('*');
  // }
}
