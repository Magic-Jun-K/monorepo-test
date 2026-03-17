import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UserModule } from '../user/user.module';
import { RoleModule } from '../role/role.module';
import { UserEntity } from '../user/entities/user.entity';
import { UserOAuthEntity } from '../user/entities/user-oauth.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { LocalStrategy } from './strategy/local.strategy';
import { AuthUtils } from '../../common/utils/auth.utils';
import { RedisModule } from '../redis/redis.module';
import { TokenBlacklistService } from './token-backlist.service';
import { MailModule } from '../mail/mail.module';
import { LoginAttemptsService } from './login-attempts.service';
import { VerificationCodeService } from './verification-code.service';
import { SmsService } from './sms.service';
import { WeChatService } from './wechat.service';

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
    UserModule,
    RoleModule,
    TypeOrmModule.forFeature([UserEntity, UserOAuthEntity]),
    RedisModule,
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    AuthUtils,
    TokenBlacklistService,
    LoginAttemptsService,
    VerificationCodeService,
    SmsService,
    WeChatService,
  ],
  exports: [AuthService, LoginAttemptsService, VerificationCodeService],
})
export class AuthModule {}
