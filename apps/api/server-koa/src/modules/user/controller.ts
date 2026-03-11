import { userService } from './service';
import { userListQuerySchema } from './types';
import type { AppContext } from '../../shared/types';

export class UserController {
  /**
   * 获取用户列表
   * @param ctx 应用上下文对象
   */
  async list(ctx: AppContext) {
    const query = ctx.validate(userListQuerySchema, ctx.query);

    const result = await userService.list(query);

    ctx.body = {
      success: true,
      data: result.items,
      meta: result.meta,
    };
  }

  /**
   * 根据用户ID获取用户信息
   * @param ctx 应用上下文对象
   */
  async getById(ctx: AppContext) {
    const { id } = ctx.params;

    const user = await userService.getById(id);

    ctx.body = {
      success: true,
      data: user,
    };
  }

  /**
   * 根据用户名获取用户信息
   * @param ctx 应用上下文对象
   */
  async getByUsername(ctx: AppContext) {
    const { username } = ctx.params;

    const user = await userService.getByUsername(username);

    ctx.body = {
      success: true,
      data: user,
    };
  }

  /**
   * 关注用户
   * @param ctx 应用上下文对象
   */
  async follow(ctx: AppContext) {
    const followerId = ctx.state.userId!;
    const { id: followeeId } = ctx.params;

    await userService.follow(followerId, followeeId);

    ctx.body = {
      success: true,
      data: { message: 'Followed successfully' },
    };
  }

  /**
   * 取消关注用户
   * @param ctx 应用上下文对象
   */
  async unfollow(ctx: AppContext) {
    const followerId = ctx.state.userId!;
    const { id: followeeId } = ctx.params;

    await userService.unfollow(followerId, followeeId);

    ctx.body = {
      success: true,
      data: { message: 'Unfollowed successfully' },
    };
  }
}

export const userController = new UserController();
