import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class TokenBlacklistService {
  private readonly BLACKLIST_PREFIX = 'token:blacklist:'; // 黑名单前缀
  private readonly BATCH_SIZE = 100; // 批量加入黑名单的阈值
  private readonly blacklistQueue: string[] = []; // 令牌队列

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 将令牌加入黑名单
   * @param token 令牌
   */
  async addToBlacklist(token: string): Promise<void> {
    // 将令牌加入队列
    this.blacklistQueue.push(token);
    // 如果队列长度达到阈值，批量将令牌加入黑名单
    if (this.blacklistQueue.length >= this.BATCH_SIZE) {
      await this.flushBlacklist();
    }
  }

  /**
   * 批量将令牌加入黑名单
   */
  private async flushBlacklist(): Promise<void> {
    // 如果队列中没有令牌，直接返回
    if (this.blacklistQueue.length === 0) return;

    // 使用管道批量将令牌加入黑名单
    const pipeline = this.redis.pipeline();
    // 遍历队列中的令牌
    for (const token of this.blacklistQueue) {
      // 解析令牌获取过期时间
      const payload = this.jwtService.decode(token);
      // 如果令牌有效且未过期
      if (payload && typeof payload === 'object' && payload.exp) {
        // 计算令牌的剩余过期时间
        const ttl = Math.max(payload.exp - Math.floor(Date.now() / 1000), 0);
        // 将令牌加入黑名单，并设置过期时间
        pipeline.set(`${this.BLACKLIST_PREFIX}${token}`, '1', 'EX', ttl + 60);
      }
    }
    // 执行管道中的命令
    await pipeline.exec();
    // 清空队列
    this.blacklistQueue.length = 0;
  }

  /**
   * 检查令牌是否在黑名单中
   * @param token 令牌
   * @returns 是否在黑名单中
   */
  async isBlacklisted(token: string): Promise<boolean> {
    const exists = await this.redis.exists(`${this.BLACKLIST_PREFIX}${token}`);
    return exists === 1;
  }
}
