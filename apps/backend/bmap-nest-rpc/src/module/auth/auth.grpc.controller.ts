import { Controller, UnauthorizedException } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AdminEntity } from '../../entities/admin.entity';
import { AuthService } from './auth.service';
import { LoginAttemptsService } from './login-attempts.service';
import { AppLoggerService } from '@/common/services/logger.service';
import {
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  LogoutResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  GetCurrentUserRequest,
  GetCurrentUserResponse,
  ValidateTokenRequest,
  ValidateTokenResponse,
  SendVerificationCodeRequest,
  SendVerificationCodeResponse,
  EmailLoginRequest,
  EmailLoginResponse,
} from '../../generated/auth';

@Controller()
export class AuthGrpcController {
  constructor(
    private readonly authService: AuthService,
    private readonly loginAttemptsService: LoginAttemptsService,
    private readonly jwtService: JwtService,
    @InjectRepository(AdminEntity)
    private readonly adminRepository: Repository<AdminEntity>,
    private readonly logger: AppLoggerService,
  ) {
    this.logger.setContext('AuthGrpcController');
  }

  @GrpcMethod('AuthService', 'login')
  async login(request: LoginRequest): Promise<LoginResponse> {
    this.logger.log(`🔍 测试gRPC service Login方法被调用，请求参数：${JSON.stringify(request)}`);
    try {
      // 检查是否被锁定
      const isBlocked = await this.loginAttemptsService.isBlocked(request.username);
      if (isBlocked) {
        const remainingTime = await this.getLockoutRemainingTime(request.username);
        // 获取剩余尝试次数
        const remainingAttempts = await this.loginAttemptsService.getRemainingAttempts(
          request.username,
        );
        return {
          success: false,
          message: `账户已被锁定，请${remainingTime}分钟后重试`,
          data: undefined,
          remainingAttempts,
        };
      }

      // 先通过用户名查找用户
      const user = await this.adminRepository.findOne({
        where: { username: request.username },
        select: ['id', 'username'],
      });

      if (!user) {
        // 记录失败尝试
        await this.loginAttemptsService.recordFailedAttempt(request.username);

        // 获取剩余尝试次数
        const remainingAttempts = await this.loginAttemptsService.getRemainingAttempts(
          request.username,
        );

        return {
          success: false,
          message: '用户不存在',
          data: undefined,
          remainingAttempts,
        };
      }

      const tokens = await this.authService.login(user);

      return {
        success: true,
        message: '登录成功',
        data: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        },
        remainingAttempts: 0,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登录失败';
      this.logger.error('登录失败:', errorMessage);
      // 获取剩余尝试次数
      const remainingAttempts = await this.loginAttemptsService.getRemainingAttempts(
        request.username,
      );
      return {
        success: false,
        message: errorMessage,
        data: null,
        remainingAttempts,
      };
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

  @GrpcMethod('AuthService', 'logout')
  async logout(request: LogoutRequest): Promise<LogoutResponse> {
    try {
      await this.authService.revokeRefreshToken(request.refreshToken);
      return {
        success: true,
        message: '登出成功',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登出失败';
      this.logger.error('登出失败:', errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  @GrpcMethod('AuthService', 'refreshToken')
  async refreshToken(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    try {
      // 黑名单验证
      if (await this.authService.isRefreshTokenRevoked(request.refreshToken)) {
        throw new UnauthorizedException('令牌已失效');
      }

      const tokens = await this.authService.refreshToken(request.refreshToken);
      return {
        success: true,
        message: 'Token刷新成功',
        data: tokens.access_token,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Token刷新失败';
      this.logger.error('Token刷新失败:', errorMessage);
      return {
        success: false,
        message: errorMessage,
        data: undefined,
      };
    }
  }

  @GrpcMethod('AuthService', 'getCurrentUser')
  async getCurrentUser(request: GetCurrentUserRequest): Promise<GetCurrentUserResponse> {
    try {
      // 验证access token
      const payload = this.jwtService.verify(request.accessToken, {
        secret: process.env.JWT_SECRET,
      });

      // 获取用户信息
      const user = await this.adminRepository.findOne({
        where: { id: payload.sub },
        select: ['id', 'username', 'email'],
      });

      if (!user) {
        return {
          success: false,
          message: '用户不存在',
          data: undefined,
        };
      }

      return {
        success: true,
        message: '获取用户信息成功',
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: payload.role || 'user',
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取用户信息失败';
      this.logger.error('获取用户信息失败:', errorMessage);
      return {
        success: false,
        message: errorMessage,
        data: undefined,
      };
    }
  }

  @GrpcMethod('AuthService', 'validateToken')
  async validateToken(request: ValidateTokenRequest): Promise<ValidateTokenResponse> {
    try {
      const payload = this.jwtService.verify(request.token, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.adminRepository.findOne({
        where: { id: payload.sub },
        select: ['id', 'username', 'email'],
      });

      if (!user) {
        return {
          valid: false,
          user: undefined,
        };
      }

      return {
        valid: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: payload.role || 'user',
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Token验证失败';
      this.logger.error('Token验证失败:', errorMessage);
      return {
        valid: false,
        user: undefined,
      };
    }
  }

  @GrpcMethod('AuthService', 'sendVerificationCode')
  async sendVerificationCode(
    request: SendVerificationCodeRequest,
  ): Promise<SendVerificationCodeResponse> {
    try {
      await this.authService.sendVerificationCode(request.email);
      return {
        success: true,
        message: '验证码发送成功',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '验证码发送失败';
      this.logger.error('验证码发送失败:', errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  @GrpcMethod('AuthService', 'emailLogin')
  async emailLogin(request: EmailLoginRequest): Promise<EmailLoginResponse> {
    try {
      const tokens = await this.authService.verifyEmailCodeAndLogin(request.email, request.code);

      return {
        success: true,
        message: '登录成功',
        data: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登录失败';
      this.logger.error('邮箱登录失败:', errorMessage);
      return {
        success: false,
        message: errorMessage,
        data: undefined,
      };
    }
  }
}
