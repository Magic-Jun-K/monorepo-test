import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AdminModule } from '../admin/admin.module';
import { AdminEntity } from '../../entities/admin.entity';
// import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGrpcController } from './auth.grpc.controller';
import { AuthGrpcWebController } from './auth.grpc-web.controller';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { AuthUtils } from '../../common/utils/auth.utils';
import { RedisModule } from '../redis/redis.module';
import { TokenBlacklistService } from './token-backlist.service';
import { MailModule } from '../mail/mail.module';
import { LoginAttemptsService } from './login-attempts.service';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '15m', algorithm: 'HS256' },
      }),
      inject: [ConfigService], // 注入配置服务
    }),
    AdminModule,
    TypeOrmModule.forFeature([AdminEntity]),
    RedisModule,
    MailModule,
  ],
  controllers: [
    // AuthController,
    AuthGrpcController,
    AuthGrpcWebController,
  ],
  providers: [
    AuthService,
    AuthGrpcController,
    LocalStrategy,
    JwtStrategy,
    AuthUtils,
    TokenBlacklistService,
    LoginAttemptsService,
  ],
  exports: [AuthService, LoginAttemptsService],
})
export class AuthModule {}
