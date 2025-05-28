/**
 * @description 路由处理的控制器（控制器层）
 */
import { Body, Controller, Post } from '@nestjs/common';

// import { AppService } from './app.service';
import { AuthGrpcClient } from './module/auth/auth.client';

// 路由拦截
@Controller()
export class AppController {
  constructor(
    // private readonly appService: AppService,
    private readonly authGrpcClient: AuthGrpcClient
  ) {}

  // @Get()
  // getHello(): string {
  //   return this.appService.getHello();
  // }

  // 添加gRPC测试接口
  @Post('test-grpc-login')
  async testGrpcLogin(@Body() body: { username: string; password: string }) {
    try {
      const result = await this.authGrpcClient.login(body.username, body.password);
      return {
        success: true,
        message: 'gRPC认证服务正常',
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: 'gRPC认证服务异常',
        error: error.message
      };
    }
  }
}
