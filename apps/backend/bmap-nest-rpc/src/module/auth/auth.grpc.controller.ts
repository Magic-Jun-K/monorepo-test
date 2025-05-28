import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { AuthService } from './auth.service';

@Controller()
export class AuthGrpcController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod('AuthService', 'login')
  async login(data: { username: string; password: string }) {
    try {
      const user = await this.authService.validateUser(data.username);
      if (!user) {
        return {
          success: false,
          message: '用户不存在',
          data: null,
        };
      }

      const isPasswordValid = await this.authService.verifyPassword(
        user.password,
        data.password,
      );
      if (!isPasswordValid) {
        return {
          success: false,
          message: '密码错误',
          data: null,
        };
      }

      const tokens = await this.authService.login(user, data.password);
      return {
        success: true,
        message: '登录成功',
        data: tokens,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '登录失败',
        data: null,
      };
    }
  }

  @GrpcMethod('AuthService', 'logout')
  async logout(data: { refresh_token: string }) {
    try {
      await this.authService.revokeRefreshToken(data.refresh_token);
      return {
        success: true,
        message: '退出成功',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '退出失败',
      };
    }
  }

  @GrpcMethod('AuthService', 'refreshToken')
  async refreshToken(data: { refresh_token: string }) {
    try {
      if (await this.authService.isRefreshTokenRevoked(data.refresh_token)) {
        return {
          success: false,
          message: '令牌已失效',
          data: null,
        };
      }

      const newToken = await this.authService.refreshToken(data.refresh_token);
      return {
        success: true,
        message: '刷新成功',
        data: {
          access_token: newToken,
          refresh_token: data.refresh_token,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '刷新失败',
        data: null,
      };
    }
  }

  @GrpcMethod('AuthService', 'getCurrentUser')
  async getCurrentUser(data: { access_token: string }) {
    try {
      const payload = await this.authService.validateToken(data.access_token);
      return {
        success: true,
        message: '获取成功',
        data: {
          id: payload.sub,
          username: payload.username,
          role: payload.role,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '获取失败',
        data: null,
      };
    }
  }

  @GrpcMethod('AuthService', 'validateToken')
  async validateToken(data: { token: string }) {
    try {
      const payload = await this.authService.validateToken(data.token);
      return {
        valid: true,
        user: {
          id: payload.sub,
          username: payload.username,
          role: payload.role,
        },
      };
    } catch {
      return {
        valid: false,
        user: null,
      };
    }
  }
} 