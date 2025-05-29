import { ClientGrpc } from '@nestjs/microservices';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { AuthServiceClient } from '../../generated/auth';

@Injectable()
export class AuthGrpcClient implements OnModuleInit {
  private authService: AuthServiceClient;

  constructor(
    @Inject('GRPC_AUTH_SERVICE') private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthServiceClient>('AuthService');
  }

  async login(username: string, password: string): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log('🔍 gRPC Login方法被调用，请求参数：', {
        username,
        password,
      });
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
