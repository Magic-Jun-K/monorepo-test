import { database } from '../../infrastructure/database';
import { cache } from '../../infrastructure/cache';
import { createLogger } from '../../infrastructure/logger';
import { NotFoundError } from '../../core/error/handler';
import type { UserListQuery, UserListItem, PaginatedResult } from './types';

const logger = createLogger('user-service');

export class UserService {
  /**
   * 获取用户列表
   * @param query 用户列表查询参数
   * @returns 分页用户列表结果
   */
  async list(query: UserListQuery): Promise<PaginatedResult<UserListItem>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const search = query.search;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'DESC';

    const offset = (page - 1) * pageSize;

    let whereClause = '';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (search) {
      whereClause = `WHERE username ILIKE $${paramIndex} OR email ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await database.query(`SELECT COUNT(*) FROM users ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count, 10);

    const sortColumn = {
      username: 'username',
      email: 'email',
      createdAt: 'created_at',
    }[sortBy];

    const result = await database.query(
      `SELECT id, username, email, bio, avatar, created_at, updated_at 
       FROM users ${whereClause}
       ORDER BY ${sortColumn} ${sortOrder}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, pageSize, offset],
    );

    const items = result.rows.map((row) => ({
      id: row.id,
      username: row.username,
      email: row.email,
      bio: row.bio,
      avatar: row.avatar,
      createdAt: row.created_at,
    }));

    return {
      items,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * 根据用户ID获取用户信息
   * @param id 用户ID
   * @returns 用户信息
   */
  async getById(id: string): Promise<UserListItem> {
    const cached = await cache.get<UserListItem>(`user:${id}:public`);

    if (cached) {
      return cached;
    }

    const result = await database.query(
      'SELECT id, username, email, bio, avatar, created_at FROM users WHERE id = $1',
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('User not found');
    }

    const user = result.rows[0];

    await cache.set(`user:${id}:public`, user, 3600);

    return user;
  }

  /**
   * 根据用户名获取用户信息
   * @param username 用户名
   * @returns 用户信息
   */
  async getByUsername(username: string): Promise<UserListItem> {
    const result = await database.query(
      'SELECT id, username, email, bio, avatar, created_at FROM users WHERE username = $1',
      [username],
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('User not found');
    }

    return result.rows[0];
  }

  /**
   * 关注用户
   * @param followerId 关注者ID
   * @param followeeId 被关注者ID
   */
  async follow(followerId: string, followeeId: string): Promise<void> {
    if (followerId === followeeId) {
      throw new Error('Cannot follow yourself');
    }

    await database.query(
      `INSERT INTO follows (follower_id, followee_id, created_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT DO NOTHING`,
      [followerId, followeeId],
    );

    await cache.delete(`user:${followeeId}:followers`);
    await cache.delete(`user:${followerId}:following`);

    logger.info('User followed', { followerId, followeeId });
  }

  /**
   * 取消关注用户
   * @param followerId 关注者ID
   * @param followeeId 被关注者ID
   */
  async unfollow(followerId: string, followeeId: string): Promise<void> {
    await database.query('DELETE FROM follows WHERE follower_id = $1 AND followee_id = $2', [
      followerId,
      followeeId,
    ]);

    await cache.delete(`user:${followeeId}:followers`);
    await cache.delete(`user:${followerId}:following`);

    logger.info('User unfollowed', { followerId, followeeId });
  }
}

export const userService = new UserService();
