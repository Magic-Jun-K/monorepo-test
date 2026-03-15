import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  /**
   * 测试Redis连接
   * @returns Redis PING 响应
   */
  async ping(): Promise<string> {
    return this.redis.ping();
  }
}
