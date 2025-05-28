import {
  ClientGrpc,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { join } from 'path';
import { Injectable, OnModuleInit } from '@nestjs/common';

import { AuthServiceClient } from '../../generated/auth';

@Injectable()
export class AuthGrpcClient implements OnModuleInit {
  private authService: AuthServiceClient;

  onModuleInit() {
    const client: ClientGrpc = ClientProxyFactory.create({
      transport: Transport.GRPC,
      options: {
        package: 'auth',
        // 使用绝对路径
        protoPath: join(process.cwd(), 'src/proto/auth.proto'),
        url: 'localhost:5000',
        loader: {
          keepCase: true, // 保持字段名称的大小写
          longs: String, // 使用字符串表示长整型
          enums: String, // 使用字符串表示枚举类型
          defaults: true, // 使用默认值
          oneofs: true, // 使用 oneof
        },
        // credentials: null, // 禁用 SSL 证书验证
        // maxSendMessageLength: 1024 * 1024 * 2, // 设置最大发送消息长度
        // maxReceiveMessageLength: 1024 * 1024 * 2, // 设置最大接收消息长度
      },
    }) as ClientGrpc;

    this.authService = client.getService<AuthServiceClient>('AuthService');
  }

  async login(username: string, password: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.authService.login({ username, password }).subscribe({
        next: (value) => resolve(value),
        error: (err) => reject(err),
      });
    });
  }

  async logout(refreshToken: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.authService.logout({ refreshToken: refreshToken }).subscribe({
        next: (value) => resolve(value),
        error: (err) => reject(err),
      });
    });
  }

  async refreshToken(refreshToken: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.authService.refreshToken({ refreshToken: refreshToken }).subscribe({
        next: (value) => resolve(value),
        error: (err) => reject(err),
      });
    });
  }

  async getCurrentUser(accessToken: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.authService.getCurrentUser({ accessToken: accessToken }).subscribe({
        next: (value) => resolve(value),
        error: (err) => reject(err),
      });
    });
  }

  async validateToken(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.authService.validateToken({ token }).subscribe({
        next: (value) => resolve(value),
        error: (err) => reject(err),
      });
    });
  }
}
