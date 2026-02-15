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
import { SetPasswordDto } from './dto/set-password.dto';
import { AuthRequest } from './types/auth-request.interface';
import { setPasswordSchema } from './dto/set-password.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AuthUtils } from '../../common/utils/auth.utils';

interface EncryptedData {
  encrypted: string;
  clientPublicKey: string;
  nonce: string;
  algorithm: string;
}

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly loginAttemptsService: LoginAttemptsService,
    private readonly authUtils: AuthUtils,
  ) {}

  /**
   * 获取服务器公钥（用于前端加密）
   */
  @Public()
  @Get('public-key')
  async getPublicKey() {
    const { publicKey } = await this.authUtils.getServerKeyPair();
    return { publicKey };
  }

  @Public()
  @Post('login')
  async login(@Body() body: EncryptedData, @Res({ passthrough: true }) response: Response) {
    try {
      this.logger.log('收到登录请求，开始解密...');

      const decryptedData = await this.authUtils.decryptWithKeyExchange(body);
      const { username, passwordHash } = decryptedData;

      if (
        !username ||
        typeof username !== 'string' ||
        !passwordHash ||
        typeof passwordHash !== 'string'
      ) {
        throw new UnauthorizedException({
          message: '用户名或密码无效',
          success: false,
        });
      }

      const isBlocked = await this.loginAttemptsService.isBlocked(username);
      if (isBlocked) {
        const remainingTime = await this.getLockoutRemainingTime(username);
        throw new HttpException(
          {
            message: `账户已被锁定，请${remainingTime}分钟后重试`,
            success: false,
            code: 'ACCOUNT_LOCKED',
          },
          HttpStatus.TOO_MANY_REQUESTS, // 429状态码
        );
      }

      const user = await this.authService.validateUser(username);
      if (!user) {
        await this.loginAttemptsService.recordFailedAttempt(username);
        throw new UnauthorizedException({
          message: '用户不存在',
          success: false,
        });
      }

      const isPasswordValid = await this.authService.verifyPasswordHash(
        user.password,
        passwordHash,
      );

      if (!isPasswordValid) {
        // 记录失败尝试（防止DDoS攻击）
        await this.loginAttemptsService.recordFailedAttempt(username);

        // 获取剩余尝试次数
        const remainingAttempts = await this.loginAttemptsService.getRemainingAttempts(username);
        throw new UnauthorizedException({
          message: '密码错误',
          success: false,
          remainingAttempts,
        });
      }

      const { access_token, refresh_token } = await this.authService.login(user);

      this.logger.log('登录成功，refresh_token:', refresh_token);

      // 设置 httpOnly cookie
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

      this.logger.error('登录失败:', error);

      throw new UnauthorizedException({
        message: '登录失败',
        error: (error as Error).message,
        success: false,
      });
    }
  }

  /**
   * 用户注册
   */
  @Public()
  @Post('register')
  async register(@Body() body: EncryptedData, @Res({ passthrough: true }) response: Response) {
    try {
      this.logger.log('收到注册请求，开始解密...');

      const decryptedData = await this.authUtils.decryptWithKeyExchange(body);
      const { username, passwordHash } = decryptedData;

      if (
        !username ||
        typeof username !== 'string' ||
        !passwordHash ||
        typeof passwordHash !== 'string'
      ) {
        throw new HttpException(
          { message: '注册数据不完整', success: false },
          HttpStatus.BAD_REQUEST,
        );
      }

      // 调用注册服务
      const result = await this.authService.registerWithHash(username, passwordHash);

      if (!result.success) {
        throw new HttpException(
          { message: result.message, success: false },
          HttpStatus.BAD_REQUEST,
        );
      }

      // 自动登录
      const user = await this.authService.validateUser(username);
      if (user) {
        const { access_token, refresh_token } = await this.authService.login(user);

        response.cookie('refresh_token', refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: '/',
        });

        return { data: access_token, message: '注册成功并已自动登录', success: true };
      }

      return { message: '注册成功，请登录', success: true };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('注册失败:', error);
      throw new HttpException(
        { message: '注册失败', error: (error as Error).message, success: false },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
    const { access_token, refresh_token } = await this.authService.loginWithEmail(
      body.email,
      body.code,
    );

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

  /**
   * 发送短信验证码
   * @param phone
   * @returns
   */
  @Public()
  @Post('send-sms-code')
  async sendSmsCode(@Body('phone') phone: string) {
    await this.authService['verificationCodeService'].sendCode(phone, 'sms');
    return { success: true, message: '验证码发送成功' };
  }

  /**
   * 手机号验证码登录
   * @param body
   * @param response
   */
  @Public()
  @Post('phone-login')
  async phoneLogin(
    @Body() body: { phone: string; code: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    const { access_token, refresh_token } = await this.authService.loginWithPhone(
      body.phone,
      body.code,
    );

    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return { data: access_token, message: '登录成功', success: true };
  }

  /**
   * 微信扫码登录 (回调接口)
   * @param code
   * @param response
   */
  @Public()
  @Post('wechat-login')
  async weChatLogin(@Body('code') code: string, @Res({ passthrough: true }) response: Response) {
    const { access_token, refresh_token } = await this.authService.loginWithWeChat(code);

    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return { data: access_token, message: '登录成功', success: true };
  }
}
