import { Controller, Get, Post, Request, Body } from '@nestjs/common';

import { Public } from '@/common/decorators/public.decorator';
import { AuthGrpcClient } from './auth.client';

// 路由拦截
@Controller('auth')
export class AuthController {
  constructor(private readonly authGrpcClient: AuthGrpcClient) {}

  /**
   * 用户登录
   * @param username 用户名
   * @param password 前端传递的哈希值
   * @returns 登录结果
   */
  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    return await this.authGrpcClient.login(body.username, body.password);
  }

  @Post('logout')
  async logout(@Body() body: { refresh_token: string }) {
    console.log('测试grpc logout', body);
    return await this.authGrpcClient.logout(body.refresh_token);
  }

  /**
   * 刷新token
   * @param refreshToken
   * @returns
   */
  @Public()
  @Post('refresh')
  async refreshToken(@Body() body: { refresh_token: string }) {
    return await this.authGrpcClient.refreshToken(body.refresh_token);
  }

  /**
   * 获取用户信息
   * @param req
   * @returns
   */
  @Get('currentUser')
  currentUser(@Request() req) {
    return { data: req.user };
  }

  // @Get('current-user')
  // async getCurrentUser(@Body() body: { access_token: string }) {
  //   return await this.authGrpcClient.getCurrentUser(body.access_token);
  // }

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
