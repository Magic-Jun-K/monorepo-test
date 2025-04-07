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
import { RedisModule } from '../redis/redis.module';
import { TokenBlacklistService } from './token-backlist.service';

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
        signOptions: { expiresIn: '30m', algorithm: 'HS256' },
      }),
      inject: [ConfigService], // 注入配置服务
    }),
    AdminModule,
    TypeOrmModule.forFeature([AdminEntity]),
    RedisModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    AuthUtils,
    TokenBlacklistService
  ],
  exports: [AuthService],
})
export class AuthModule {}
