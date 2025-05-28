import { Injectable } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AdminEntity } from '../../entities/admin.entity';
import { AuthService } from './auth.service';
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
  ValidateTokenResponse
} from '../../generated/auth';

@Injectable()
export class AuthGrpcService {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    @InjectRepository(AdminEntity)
    private readonly adminRepository: Repository<AdminEntity>,
  ) {}

  @GrpcMethod('AuthService', 'login')
  async login(request: LoginRequest): Promise<LoginResponse> {
    console.log('🔍 gRPC Login方法被调用，请求参数：', request);
    try {
      // 验证用户
      const user = await this.authService.validateUser(request.username);
      if (!user) {
        return {
          success: false,
          message: '用户不存在',
          data: undefined,
        };
      }

      // 登录并获取token
      const tokens = await this.authService.login(user, request.password);

      return {
        success: true,
        message: '登录成功',
        data: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '登录失败',
        data: undefined,
      };
    }
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
      return {
        success: false,
        message: error.message || '登出失败',
      };
    }
  }

  @GrpcMethod('AuthService', 'refreshToken')
  async refreshToken(
    request: RefreshTokenRequest,
  ): Promise<RefreshTokenResponse> {
    try {
      // 检查token是否在黑名单中
      if (await this.authService.isRefreshTokenRevoked(request.refreshToken)) {
        return {
          success: false,
          message: '令牌已失效',
          data: undefined,
        };
      }

      // 验证refresh token
      const payload = this.jwtService.verify(request.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      // 检查用户是否存在
      const user = await this.adminRepository.findOne({
        where: { id: payload.sub },
        select: ['id', 'username'],
      });

      if (!user) {
        return {
          success: false,
          message: '用户不存在',
          data: undefined,
        };
      }

      // 生成新的token
      const tokens = {
        access_token: this.jwtService.sign({
          sub: user.id,
          username: user.username,
        }),
        refresh_token: this.jwtService.sign(
          { sub: user.id },
          {
            expiresIn: '6h',
            secret: process.env.JWT_REFRESH_SECRET,
          },
        ),
      };

      return {
        success: true,
        message: 'Token刷新成功',
        data: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Token刷新失败',
        data: undefined,
      };
    }
  }

  @GrpcMethod('AuthService', 'getCurrentUser')
  async getCurrentUser(
    request: GetCurrentUserRequest,
  ): Promise<GetCurrentUserResponse> {
    try {
      // 验证access token
      const payload = this.jwtService.verify(request.accessToken);

      // 获取用户信息
      const user = await this.adminRepository.findOne({
        where: { id: payload.sub },
        select: ['id', 'username'],
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
          role: payload.role || 'user',
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '获取用户信息失败',
        data: undefined,
      };
    }
  }

  @GrpcMethod('AuthService', 'validateToken')
  async validateToken(
    request: ValidateTokenRequest,
  ): Promise<ValidateTokenResponse> {
    try {
      const payload = this.jwtService.verify(request.token);

      const user = await this.adminRepository.findOne({
        where: { id: payload.sub },
        select: ['id', 'username'],
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
          role: payload.role || 'user',
        },
      };
    } catch {
      return {
        valid: false,
        user: undefined,
      };
    }
  }
}
