/**
 * @description 入口模块
 */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { AppController } from './app.controller';
import { AppService, PgService } from './app.service';
import { AdminModule } from './module/admin/admin.module';
import { AuthModule } from './module/auth/auth.module';
import { UserModule } from './module/user/user.module';
import { ImageModule } from './module/image/image.module';
import { TableModule } from './module/table/table.module';
import { DetailModule } from './module/detail/detail.module';
import { FileModule } from './module/file/file.module';
import { ExampleModule } from './module/example/example.module';
import { AuthUtils } from './common/utils/auth.utils';
import { InitService } from './module/permission/init.service';
import { PermissionEntity } from './entities/permission.entity';
import { RoleEntity } from './entities/role.entity';
import { RolePermissionEntity } from './entities/role-permission.entity';
import { UserEntity } from './entities/user.entity';
import { PermissionModule } from './module/permission/permission.module';
import { RoleModule } from './module/role/role.module';
import database from './config/database';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 设置为全局模块
      envFilePath: ['.env.local', '.env.prod'],
      load: [database],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      // useFactory: (config: ConfigService) => config.get('database'),
      useFactory: database,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([PermissionEntity, RoleEntity, RolePermissionEntity, UserEntity]),
    ServeStaticModule.forRoot({
      rootPath:
        process.env.NODE_ENV === 'production'
          ? join(__dirname, '..', 'public')
          : join(__dirname, '..', '..', 'public'), // 静态资源目录
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
    AdminModule,
    AuthModule,
    UserModule,
    DetailModule,
    FileModule,
    ImageModule,
    TableModule,
    ExampleModule,
    PermissionModule,
    RoleModule,
  ], // 需要导入的模块
  exports: [PgService, TypeOrmModule, ConfigModule], // 往外暴露的模块
  controllers: [AppController], // 控制器，定义路由
  providers: [AppService, PgService, Reflector, AuthUtils, InitService], // 提供可注入的一些服务
})
export class AppModule {}
