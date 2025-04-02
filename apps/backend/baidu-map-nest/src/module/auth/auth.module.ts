import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AdminModule } from '../admin/admin.module';
import { AdminEntity } from '../../entities/admin.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { AuthUtils } from '../../common/utils/auth.utils';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 设置为全局模块
      envFilePath: ['.env'] // 指定环境文件路径
    }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '1h', algorithm: 'HS256' },
      }),
      inject: [ConfigService], // 注入配置服务
    }),
    AdminModule,
    TypeOrmModule.forFeature([AdminEntity]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    AuthUtils,
    {
      provide: 'REFRESH_TOKEN_BLACKLIST', // 注册令牌黑名单实例
      useValue: new Set<string>(),
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
