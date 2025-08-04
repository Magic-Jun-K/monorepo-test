import { Controller, Post, Body, Logger, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGrpcController } from './auth.grpc.controller';

@Controller('grpc/auth')
export class AuthGrpcWebController {
  private readonly logger = new Logger(AuthGrpcWebController.name);

  constructor(private readonly authGrpcController: AuthGrpcController) {}

  @Post('login')
  async login(
    @Body() body: { username: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const request = { username: body.username, password: body.password };
    const response = await this.authGrpcController.login(request);

    // 如果登录成功，设置refresh_token cookie
    if (response.success && response.data?.refreshToken) {
      res.cookie('refresh_token', response.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
        path: '/',
      });
    }

    this.logger.log('登录响应:', response);

    return response;
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    let response = {};
    if (refreshToken) {
      response = await this.authGrpcController.logout({ refreshToken });
    }

    // 清除refresh_token cookie
    res.clearCookie('refresh_token');

    return response;
  }

  @Post('refresh')
  async refreshToken(@Req() req: Request) {
    // 优先从请求体获取，如果没有则从cookie获取
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      return {
        success: false,
        message: '未找到刷新令牌',
      };
    }
    return await this.authGrpcController.refreshToken({ refreshToken });
  }

  @Post('current-user')
  async getCurrentUser(@Body() body: { accessToken: string }) {
    const request = { accessToken: body.accessToken };
    return await this.authGrpcController.getCurrentUser(request);
  }

  @Post('validate-token')
  async validateToken(@Body() body: { token: string }) {
    const request = { token: body.token };
    return await this.authGrpcController.validateToken(request);
  }

  @Post('send-code')
  async sendVerificationCode(@Body() body: { email: string }) {
    const request = { email: body.email };
    return await this.authGrpcController.sendVerificationCode(request);
  }

  @Post('email-login')
  async emailLogin(
    @Body() body: { email: string; code: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const request = { email: body.email, code: body.code };
    const response = await this.authGrpcController.emailLogin(request);

    // 如果登录成功，设置refresh_token cookie
    if (response.success && response.data?.refreshToken) {
      res.cookie('refresh_token', response.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
        path: '/',
      });
    }

    return response;
  }
}
