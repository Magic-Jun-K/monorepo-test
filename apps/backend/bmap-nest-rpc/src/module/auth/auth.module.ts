import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { AdminModule } from '../admin/admin.module';
import { AdminEntity } from '../../entities/admin.entity';
import { AuthController } from './auth.controller';
import { AuthGrpcController } from './auth.grpc.controller';
import { AuthService } from './auth.service';
import { AuthGrpcClient } from './auth.client';
import { AuthGrpcService } from './auth.grpc.service';
import { AuthUtils } from '../../common/utils/auth.utils';
import { RedisModule } from '../redis/redis.module';
import { TokenBlacklistService } from './token-backlist.service';
import { authGrpcConfig } from './auth.grpc.config';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '30m', algorithm: 'HS256' },
      }),
      inject: [ConfigService], // 注入配置服务
    }),
    // 添加 gRPC 客户端配置
    ClientsModule.register([
      {
        name: 'GRPC_AUTH_SERVICE',
        transport: Transport.GRPC,
        ...authGrpcConfig,
      },
    ]),
    AdminModule,
    TypeOrmModule.forFeature([AdminEntity]),
    RedisModule,
  ],
  controllers: [AuthController, AuthGrpcController],
  providers: [
    AuthService,
    AuthGrpcClient,
    AuthGrpcService,
    AuthUtils,
    TokenBlacklistService,
  ],
  exports: [
    AuthService,
    AuthGrpcService,
    JwtModule,
    TypeOrmModule.forFeature([AdminEntity]),
  ],
})
export class AuthModule {}
