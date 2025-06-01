import { Controller, Get, Post, Body } from '@nestjs/common';

import { Public } from '@/common/decorators/public.decorator';
// import { AuthGrpcClient } from './auth.client';
// import { AuthService } from './auth.service';
import { AuthGrpcService } from './auth.grpc.service';

// 路由拦截
@Controller('auth')
export class AuthController {
  constructor(
    // private readonly authGrpcClient: AuthGrpcClient,
    // private readonly authService: AuthService,
    private readonly authGrpcService: AuthGrpcService,
  ) {}

  /**
   * 用户登录
   * @param username 用户名
   * @param password 前端传递的哈希值
   * @returns 登录结果
   */
  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    // return await this.authService.login(body.username, body.password);
    return await this.authGrpcService.login(body);
  }

  @Post('logout')
  async logout(@Body() body: { refresh_token: string }) {
    return await this.authGrpcService.logout({
      refreshToken: body.refresh_token,
    });
  }

  /**
   * 刷新token
   * @param refreshToken
   * @returns
   */
  @Public()
  @Post('refresh')
  async refreshToken(@Body() body: { refresh_token: string }) {
    return await this.authGrpcService.refreshToken({
      refreshToken: body.refresh_token,
    });
  }

  /**
   * 获取用户信息
   * @param req
   * @returns
   */
  @Get('current-user')
  async getCurrentUser(@Body() body: { access_token: string }) {
    return await this.authGrpcService.getCurrentUser({
      accessToken: body.access_token,
    });
  }

  // 测试登录后才可访问的接口，在需要的地方使用守卫，可保证必须携带token才能访问
  // @UseGuards(AuthGuard('jwt'))
  // @Get('me')
  // getProfile(@Request() req) {
  //   return req.user;
  // }

  // 添加gRPC测试接口
  // @Post('test-grpc-login')
  // async testGrpcLogin(@Body() body: { username: string; password: string }) {
  //   const result = await this.authGrpcClient.login(
  //     body.username,
  //     body.password,
  //   );
  //   return result;
  // }
}
