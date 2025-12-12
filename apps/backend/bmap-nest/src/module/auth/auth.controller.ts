import {
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  UnauthorizedException,
  Body,
  Res,
  Req,
  HttpException,
  HttpStatus,
  UsePipes,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { LoginAttemptsService } from './login-attempts.service';
import { Public } from '../../common/decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { AuthRequest } from './types/auth-request.interface';
import { setPasswordSchema } from './dto/set-password.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

// 路由拦截
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly loginAttemptsService: LoginAttemptsService,
  ) {}

  /**
   * 用户登录
   * @param username 用户名
   * @param password 前端传递的哈希值
   * @returns 登录结果
   */
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(
    @Req() req: AuthRequest, // 使用 @Req() 装饰器获取请求对象
    @Body() loginDto: LoginDto, // 使用 @Body 装饰器获取请求体数据
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      this.logger.log('测试auth.controller.ts loginDto', loginDto);

      // 检查是否被锁定
      const isBlocked = await this.loginAttemptsService.isBlocked(loginDto.username);
      if (isBlocked) {
        const remainingTime = await this.getLockoutRemainingTime(loginDto.username);
        throw new HttpException(
          {
            message: `账户已被锁定，请${remainingTime}分钟后重试`,
            success: false,
            code: 'ACCOUNT_LOCKED',
          },
          HttpStatus.TOO_MANY_REQUESTS, // 429状态码
        );
      }

      const { access_token, refresh_token } = await this.authService.login(
        req.user, // 来自LocalStrategy的用户对象
      );

      this.logger.log('登录时生成的 refresh_token:', refresh_token);

      /* 设置 httpOnly cookie */
      // 设置 refresh_token
      response.cookie('refresh_token', refresh_token, {
        httpOnly: true, // 表示该 cookie 只能在服务器端访问，不能在客户端 JS 中访问
        secure: process.env.NODE_ENV === 'production', // 生产环境使用 HTTPS
        sameSite: 'strict', // 表示该 cookie 只允许在当前域名下访问，不允许在子域下访问。防御CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
        path: '/', // 只允许在刷新接口使用 Restrict to refresh endpoint
        // domain: process.env.COOKIE_DOMAIN || 'localhost', // 限制作用域
      });

      return { data: access_token, message: '登录成功', success: true };
    } catch (error) {
      // 如果是账户锁定错误，直接抛出
      if (error instanceof HttpException) {
        throw error;
      }

      // 记录失败尝试
      await this.loginAttemptsService.recordFailedAttempt(loginDto.username);

      // 获取剩余尝试次数
      const remainingAttempts = await this.loginAttemptsService.getRemainingAttempts(
        loginDto.username,
      );

      throw new UnauthorizedException({
        message: '登录失败',
        error: error.message,
        remainingAttempts,
        success: false,
      });
    }
  }

  /**
   * 获取锁定剩余时间（分钟）
   * @param identifier 用户标识符
   */
  private async getLockoutRemainingTime(identifier: string): Promise<number> {
    const key = `login_attempts:${identifier}`;
    const ttl = await this.loginAttemptsService.getTTL(key);
    return Math.ceil(ttl / 60);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(@Request() req, @Res({ passthrough: true }) response: Response) {
    // 从 cookie 中获取 refresh_token
    const refreshToken = req.cookies.refresh_token;
    if (refreshToken) {
      await this.authService.revokeRefreshToken(refreshToken);
    }
    // 清除 cookie
    // response.clearCookie('access_token', { path: '/' });
    response.clearCookie('refresh_token', { path: '/' });

    return { success: true };
  }

  /**
   * 刷新token
   * @param refreshToken
   * @returns
   */
  @Public()
  @Post('refresh')
  async refreshToken(
    @Req() req, // 使用 @Req() 装饰器获取请求对象
    // @Res({ passthrough: true }) response: Response,
  ) {
    // 从cookie中获取refresh token
    const refreshToken = req.cookies.refresh_token;
    // 调试日志
    this.logger.log('Refresh token from cookie:', refreshToken);
    this.logger.log('All cookies:', req.cookies);

    // 如果没有refresh token，返回明确的错误
    if (!refreshToken) {
      throw new UnauthorizedException({
        message: '未找到刷新令牌',
        code: 'REFRESH_TOKEN_MISSING',
      });
    }

    // 黑名单验证
    if (await this.authService.isRefreshTokenRevoked(refreshToken)) {
      throw new UnauthorizedException('令牌已失效');
    }

    try {
      const { access_token } = await this.authService.refreshToken(refreshToken);

      this.logger.log('✅ 后端 Token 刷新成功！:', access_token);

      return { success: true, data: access_token };
    } catch (error) {
      this.logger.error('Token 刷新失败:', error);
      this.logger.error('错误的refresh_token:', refreshToken);
      throw new UnauthorizedException('刷新令牌无效');
    }
  }

  /**
   * 获取用户信息
   * @param req
   * @returns
   */
  // 测试登录后才可访问的接口，在需要的地方使用守卫，可保证必须携带token才能访问
  @UseGuards(AuthGuard('jwt'))
  // @Get('me')
  @Get('current-user')
  currentUser(@Request() req) {
    return req.user;
  }

  /**
   * 为邮箱注册用户设置密码
   * @param req
   * @param setPasswordDto
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ZodValidationPipe(setPasswordSchema))
  @Post('set-password')
  async setPassword(@Req() req: AuthRequest, @Body() setPasswordDto: SetPasswordDto) {
    return this.authService.setPasswordForEmailUser(req.user.id, setPasswordDto.password);
  }

  /**
   * 检查用户是否可以设置密码
   * @param req
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('can-set-password')
  async canSetPassword(@Req() req: AuthRequest) {
    return this.authService.canUserSetPassword(req.user.id);
  }

  /**
   * 发送验证码
   * @param email
   * @returns
   */
  @Public()
  @Post('send-code')
  async sendVerificationCode(@Body('email') email: string) {
    this.logger.log('发送验证码:', email);
    return await this.authService.sendVerificationCode(email);
  }

  /**
   * 验证验证码
   * @param email
   * @param code
   * @returns
   */
  @Public()
  @Post('email-login')
  async emailLogin(
    @Body() body: { email: string; code: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    const { access_token, refresh_token } = await this.authService.verifyEmailCodeAndLogin(
      body.email,
      body.code,
    );

    // 设置 access_token
    // response.cookie('access_token', access_token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'strict', // 防御CSRF
    //   maxAge: 15 * 60 * 1000, // 15分钟
    //   path: '/',
    //   domain: process.env.COOKIE_DOMAIN || 'localhost', // 限制作用域
    // });
    // 设置 refresh_token
    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // 防御CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
      path: '/', // 只允许在刷新接口使用
      // domain: process.env.COOKIE_DOMAIN || 'localhost', // 限制作用域
    });

    return { data: access_token, message: '登录成功', success: true };
  }
}
