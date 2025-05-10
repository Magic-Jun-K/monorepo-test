import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class TokenBlacklistService {
  private readonly BLACKLIST_PREFIX = 'token:blacklist:';

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 将令牌加入黑名单
   * @param token 令牌
   */
  async addToBlacklist(token: string): Promise<void> {
    try {
      // 解析令牌获取过期时间
      const payload = this.jwtService.decode(token);
      if (!payload || typeof payload !== 'object' || !payload.exp) {
        return;
      }

      // 计算剩余有效期（秒）
      const now = Math.floor(Date.now() / 1000);
      const ttl = Math.max(payload.exp - now, 0);

      // 将令牌加入黑名单，并设置过期时间
      await this.redis.set(
        `${this.BLACKLIST_PREFIX}${token}`,
        '1',
        'EX',
        ttl + 60, // 额外增加60秒缓冲时间
      );
    } catch (error) {
      console.error('将令牌加入黑名单失败:', error);
    }
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
