// import { ClientGrpc } from '@nestjs/microservices';
// import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

// import { AuthServiceClient } from '../../generated/auth';

// @Injectable()
// export class AuthGrpcClient implements OnModuleInit {
//   private authService: AuthServiceClient;

//   constructor(
//     @Inject('GRPC_AUTH_SERVICE') private readonly client: ClientGrpc,
//   ) {}

//   onModuleInit() {
//     this.authService = this.client.getService<AuthServiceClient>('AuthService');
//     console.log('✅ AuthGrpcClient AuthService 已获取');
//   }

//   // private async callGrpcMethod<T>(method: string, params: any): Promise<T> {
//   //   return new Promise((resolve, reject) => {
//   //     this.authService[method](params).subscribe({
//   //       next: (value) => resolve(value),
//   //       error: (err) => reject(err),
//   //     });
//   //   });
//   // }
//   private async callGrpcMethod<T>(method: string, params: any): Promise<T> {
//     console.log(`🔍 调用 gRPC 方法: ${method}`, params);
//     if (!this.authService) {
//       console.error('❌ AuthService 未初始化');
//       throw new Error('AuthService not initialized');
//     }
//     return new Promise((resolve, reject) => {
//       this.authService[method](params).subscribe({
//         next: (value) => {
//           console.log(`✅ gRPC 方法 ${method} 调用成功:`, value);
//           resolve(value);
//         },
//         error: (err) => {
//           console.error(`❌ gRPC 方法 ${method} 调用失败:`, err);
//           reject(err);
//         },
//       });
//     });
//   }

//   async login(username: string, password: string): Promise<any> {
//     return this.callGrpcMethod('login', { username, password });
//   }

//   async logout(refreshToken: string): Promise<any> {
//     return this.callGrpcMethod('logout', { refreshToken });
//   }

//   async refreshToken(refreshToken: string): Promise<any> {
//     return this.callGrpcMethod('refreshToken', { refreshToken });
//   }

//   async getCurrentUser(accessToken: string): Promise<any> {
//     return this.callGrpcMethod('getCurrentUser', { accessToken });
//   }

//   async validateToken(token: string): Promise<any> {
//     return this.callGrpcMethod('validateToken', { token });
//   }
// }
