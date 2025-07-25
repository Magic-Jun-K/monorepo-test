import { Injectable } from '@nestjs/common';

import { RedisService } from '../redis/redis.service';

@Injectable()
export class LoginAttemptsService {
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCKOUT_TIME = 15 * 60; // 15分钟锁定
  private readonly ATTEMPT_PREFIX = 'login_attempts:';

  constructor(private readonly redisService: RedisService) {}

  /**
   * 检查是否超过最大尝试次数
   * @param identifier 用户标识符（用户名或IP地址）
   */
  async isBlocked(identifier: string): Promise<boolean> {
    const key = `${this.ATTEMPT_PREFIX}${identifier}`;
    const attempts = await this.redisService.get(key);
    return attempts ? parseInt(attempts) >= this.MAX_ATTEMPTS : false;
  }

  /**
   * 记录登录失败尝试
   * @param identifier 用户标识符
   */
  async recordFailedAttempt(identifier: string): Promise<void> {
    const key = `${this.ATTEMPT_PREFIX}${identifier}`;
    const currentAttempts = await this.redisService.get(key);
    const attempts = currentAttempts ? parseInt(currentAttempts) : 0;

    // 增加尝试次数并设置过期时间
    await this.redisService.set(
      key,
      (attempts + 1).toString(),
      this.LOCKOUT_TIME,
    );
  }

  /**
   * 重置登录尝试次数（登录成功时调用）
   * @param identifier 用户标识符
   */
  async resetAttempts(identifier: string): Promise<void> {
    const key = `${this.ATTEMPT_PREFIX}${identifier}`;
    await this.redisService.del(key);
  }

  /**
   * 获取剩余尝试次数
   * @param identifier 用户标识符
   */
  async getRemainingAttempts(identifier: string): Promise<number> {
    const key = `${this.ATTEMPT_PREFIX}${identifier}`;
    const attempts = await this.redisService.get(key);
    const currentAttempts = attempts ? parseInt(attempts) : 0;
    return Math.max(0, this.MAX_ATTEMPTS - currentAttempts);
  }

  /**
   * 获取剩余锁定时间（秒）
   * @param key 键
   */
  async getTTL(key: string): Promise<number> {
    return await this.redisService.ttl(key);
  }
}
