import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { LoginAttemptsService } from './login-attempts.service';
import { AppLoggerService } from '../../common/services/logger.service';
import { AdminEntity } from '../../entities/admin.entity';

interface UserWithoutPassword extends Omit<AdminEntity, 'password'> {}

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly loginAttemptsService: LoginAttemptsService,
    private readonly logger: AppLoggerService,
  ) {
    super({
      passReqToCallback: true, // 允许在validate方法中访问请求对象
    });
    this.logger.setContext('LocalStrategy');
  }

  /**
   * 验证用户名和密码
   * @param username 用户名
   * @param password 密码
   * @returns 用户对象
   */
  async validate(
    request: Request, // 使用 @Req() 装饰器获取请求对象
    username: string,
    password: string,
  ): Promise<UserWithoutPassword> {
    // 获取客户端IP地址
    const clientIp = this.getClientIp(request);

    // 日志输出
    const displayIp =
      clientIp === '::1'
        ? 'localhost (IPv6)'
        : clientIp === '127.0.0.1'
          ? 'localhost (IPv4)'
          : clientIp;
    this.logger.log(`Client IP: ${displayIp}, User: ${username}`);

    // 检查是否被锁定（基于用户名）
    if (await this.loginAttemptsService.isBlocked(username)) {
      throw new HttpException(
        {
          message: '账户已被临时锁定，请15分钟后重试',
          code: 'ACCOUNT_LOCKED',
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS, // 429状态码
      );
    }

    // 检查是否被锁定（基于IP地址）
    if (clientIp && (await this.loginAttemptsService.isBlocked(`ip:${clientIp}`))) {
      throw new HttpException(
        {
          message: '登录尝试次数过多，请15分钟后重试',
          code: 'ACCOUNT_LOCKED',
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS, // 429状态码
      );
    }

    const user = await this.authService.validateUser(username);

    if (!user) {
      // 记录失败尝试
      await this.loginAttemptsService.recordFailedAttempt(username);
      if (clientIp) {
        await this.loginAttemptsService.recordFailedAttempt(`ip:${clientIp}`);
      }

      // 获取剩余尝试次数并添加到错误信息中
      const remainingAttempts = await this.loginAttemptsService.getRemainingAttempts(username);
      throw new UnauthorizedException({
        message: '认证失败',
        error: '无效凭证',
        remainingAttempts,
      });
    }

    // 验证密码
    const isPasswordValid = await this.authService.verifyPassword(user.password, password);
    if (!isPasswordValid) {
      // 记录失败尝试
      await this.loginAttemptsService.recordFailedAttempt(username);
      if (clientIp) {
        await this.loginAttemptsService.recordFailedAttempt(`ip:${clientIp}`);
      }

      // 获取剩余尝试次数并添加到错误信息中
      const remainingAttempts = await this.loginAttemptsService.getRemainingAttempts(username);
      throw new UnauthorizedException({
        message: '密码错误',
        error: '无效凭证',
        remainingAttempts, // 确保这个字段被正确返回
      });
    }

    // 登录成功，重置尝试次数
    await this.loginAttemptsService.resetAttempts(username);
    if (clientIp) {
      await this.loginAttemptsService.resetAttempts(`ip:${clientIp}`);
    }

    // 只返回需要的用户信息，不包含密码
    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // 客户端IP获取方法
  private getClientIp(request: Request): string | undefined {
    return (
      request.ip ||
      request.socket.remoteAddress ||
      // 如果使用了代理，可能需要检查这些头部
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (request.headers['x-real-ip'] as string) ||
      undefined
    );
  }
}
