import { authService } from './service';
import { userSchema } from './types';
import type { AppContext } from '../../shared/types';

export class AuthController {
  /**
   * 注册用户
   * @param ctx 应用上下文对象
   */
  async register(ctx: AppContext) {
    const data = ctx.validate(userSchema.register, ctx.request.body);

    const result = await authService.register(data);

    ctx.status = 201;
    ctx.body = {
      success: true,
      data: result,
    };
  }

  /**
   * 用户登录
   * @param ctx 应用上下文对象
   */
  async login(ctx: AppContext) {
    const data = ctx.validate(userSchema.login, ctx.request.body);

    const result = await authService.login(data);

    ctx.body = {
      success: true,
      data: result,
    };
  }

  /**
   * 刷新访问令牌
   * @param ctx 应用上下文对象
   */
  async refreshToken(ctx: AppContext) {
    const { refreshToken } = ctx.request.body as { refreshToken: string };

    if (!refreshToken) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Refresh token is required' },
      };
      return;
    }

    const tokens = await authService.refreshTokens(refreshToken);

    ctx.body = {
      success: true,
      data: tokens,
    };
  }

  /**
   * 退出登录
   * @param ctx 应用上下文对象
   */
  async logout(ctx: AppContext) {
    const userId = ctx.state.userId!;

    await authService.logout(userId);

    ctx.body = {
      success: true,
      data: { message: 'Logged out successfully' },
    };
  }

  /**
   * 获取用户个人信息
   * @param ctx 应用上下文对象
   */
  async getProfile(ctx: AppContext) {
    const userId = ctx.state.userId!;

    const profile = await authService.getProfile(userId);

    ctx.body = {
      success: true,
      data: profile,
    };
  }

  /**
   * 更新用户个人信息
   * @param ctx 应用上下文对象
   */
  async updateProfile(ctx: AppContext) {
    const userId = ctx.state.userId!;
    const data = ctx.validate(userSchema.updateProfile, ctx.request.body);

    const profile = await authService.updateProfile(userId, data);

    ctx.body = {
      success: true,
      data: profile,
    };
  }

  /**
   * 更改用户密码
   * @param ctx 应用上下文对象
   */
  async changePassword(ctx: AppContext) {
    const userId = ctx.state.userId!;
    const data = ctx.validate(userSchema.changePassword, ctx.request.body);

    await authService.changePassword(userId, data.currentPassword, data.newPassword);

    ctx.body = {
      success: true,
      data: { message: 'Password changed successfully' },
    };
  }
}

export const authController = new AuthController();
