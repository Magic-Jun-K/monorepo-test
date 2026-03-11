import { database } from '../../infrastructure/database';
import { cache } from '../../infrastructure/cache';
import { createLogger } from '../../infrastructure/logger';
import { hashPassword, verifyPassword } from '../../shared/utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../middleware/auth';
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
} from '../../core/error/handler';
import type { User, AuthTokens, RegisterInput, LoginInput } from './types';

const logger = createLogger('auth-service');

export class AuthService {
  /**
   * 注册用户
   * @param input 注册输入参数
   * @returns 包含访问令牌、刷新令牌和用户信息的对象
   */
  async register(input: RegisterInput): Promise<AuthTokens & { user: Omit<User, 'passwordHash'> }> {
    const { username, email, password } = input;

    const existingUser = await database.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email],
    );

    if (existingUser.rows.length > 0) {
      throw new ConflictError('Username or email already exists');
    }

    const { hash, salt } = hashPassword(password);

    const result = await database.query(
      `INSERT INTO users (username, email, password_hash, password_salt, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, username, email, bio, avatar, created_at, updated_at`,
      [username, email, hash, salt],
    );

    const user = this.mapRowToUser(result.rows[0]);

    const tokens = this.generateTokens(user);

    logger.info('User registered', { userId: user.id, username: user.username });

    return {
      ...tokens,
      user,
    };
  }

  /**
   * 用户登录
   * @param input 登录输入参数
   * @returns 包含访问令牌、刷新令牌和用户信息的对象
   */
  async login(input: LoginInput): Promise<AuthTokens & { user: Omit<User, 'passwordHash'> }> {
    const { email, password } = input;

    const result = await database.query(
      'SELECT id, username, email, password_hash, password_salt, bio, avatar, created_at, updated_at FROM users WHERE email = $1',
      [email],
    );

    if (result.rows.length === 0) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const row = result.rows[0];
    const isValidPassword = verifyPassword(password, row.password_hash, row.password_salt);

    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const user = this.mapRowToUser(row);
    const tokens = this.generateTokens(user);

    await cache.set(`user:${user.id}:tokens`, tokens, 86400);

    logger.info('User logged in', { userId: user.id });

    return {
      ...tokens,
      user: this.excludePassword(user),
    };
  }

  /**
   * 刷新访问令牌
   * @param refreshToken 刷新令牌
   * @returns 包含新的访问令牌和刷新令牌的对象
   */
  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = verifyRefreshToken(refreshToken);

      const cached = await cache.get<AuthTokens>(`user:${payload.userId}:tokens`);

      if (!cached || cached.refreshToken !== refreshToken) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      const tokens = this.generateTokens({
        id: payload.userId,
        email: payload.email,
        username: '',
      });

      await cache.set(`user:${payload.userId}:tokens`, tokens, 86400);

      return tokens;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  /**
   * 退出登录
   * @param userId 用户ID
   */
  async logout(userId: string): Promise<void> {
    await cache.delete(`user:${userId}:tokens`);
    logger.info('User logged out', { userId });
  }

  /**
   * 获取用户个人信息
   * @param userId 用户ID
   * @returns 用户个人信息对象
   */
  async getProfile(userId: string): Promise<Omit<User, 'passwordHash'>> {
    const cached = await cache.get<Omit<User, 'passwordHash'>>(`user:${userId}:profile`);

    if (cached) {
      return cached;
    }

    const result = await database.query(
      'SELECT id, username, email, bio, avatar, created_at, updated_at FROM users WHERE id = $1',
      [userId],
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('User not found');
    }

    const user = this.mapRowToUser(result.rows[0]);

    await cache.set(`user:${userId}:profile`, user, 3600);

    return user;
  }

  /**
   * 更新用户个人信息
   * @param userId 用户ID
   * @param input 包含要更新的用户名和个人介绍的对象
   * @returns 更新后的用户个人信息对象
   */
  async updateProfile(
    userId: string,
    input: Partial<Pick<User, 'username' | 'bio'>>,
  ): Promise<Omit<User, 'passwordHash'>> {
    if (input.username) {
      const existing = await database.query(
        'SELECT id FROM users WHERE username = $1 AND id != $2',
        [input.username, userId],
      );
      if (existing.rows.length > 0) {
        throw new ConflictError('Username already taken');
      }
    }

    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (input.username) {
      updates.push(`username = $${paramIndex++}`);
      values.push(input.username);
    }
    if (input.bio !== undefined) {
      updates.push(`bio = $${paramIndex++}`);
      values.push(input.bio);
    }

    if (updates.length === 0) {
      return this.getProfile(userId);
    }

    updates.push(`updated_at = NOW()`);
    values.push(userId);

    const result = await database.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, username, email, bio, avatar, created_at, updated_at`,
      values,
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('User not found');
    }

    await cache.delete(`user:${userId}:profile`);

    const user = this.mapRowToUser(result.rows[0]);

    logger.info('User profile updated', { userId });

    return user;
  }

  /**
   * 更新用户密码
   * @param userId 用户ID
   * @param currentPassword 当前密码
   * @param newPassword 新密码
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const result = await database.query(
      'SELECT password_hash, password_salt FROM users WHERE id = $1',
      [userId],
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('User not found');
    }

    const { password_hash: hash, password_salt: salt } = result.rows[0];
    const isValid = verifyPassword(currentPassword, hash, salt);

    if (!isValid) {
      throw new BadRequestError('Current password is incorrect');
    }

    const { hash: newHash, salt: newSalt } = hashPassword(newPassword);

    await database.query(
      'UPDATE users SET password_hash = $1, password_salt = $2, updated_at = NOW() WHERE id = $3',
      [newHash, newSalt, userId],
    );

    await cache.delete(`user:${userId}:tokens`);

    logger.info('User password changed', { userId });
  }

  /**
   * 生成访问令牌和刷新令牌
   * @param user 包含用户ID、电子邮件和用户名的对象
   * @returns 包含访问令牌和刷新令牌的对象
   */
  private generateTokens(user: { id: string; email: string; username: string }): AuthTokens {
    return {
      accessToken: generateAccessToken({ userId: user.id, email: user.email }),
      refreshToken: generateRefreshToken({ userId: user.id, email: user.email }),
    };
  }

  /**
   * 将数据库查询结果映射为用户对象
   * @param row 数据库查询结果行对象
   * @returns 映射后的用户对象
   */
  private mapRowToUser(row: Record<string, unknown>): User {
    return {
      id: row.id as string,
      username: row.username as string,
      email: row.email as string,
      passwordHash: row.password_hash as string,
      bio: row.bio as string | undefined,
      avatar: row.avatar as string | undefined,
      createdAt: row.created_at as Date,
      updatedAt: row.updated_at as Date,
    };
  }

  /**
   * 从用户对象中排除密码字段
   * @param user 包含密码哈希的用户对象
   * @returns 不包含密码哈希的用户对象
   */
  private excludePassword(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export const authService = new AuthService();
