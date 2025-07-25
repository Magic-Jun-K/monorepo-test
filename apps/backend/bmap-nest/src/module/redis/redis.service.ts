import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  /**
   * 设置缓存
   * @param key 键
   * @param value 值
   * @param ttl 过期时间，单位秒，默认300秒
   */
  async set(key: string, value: string, ttl: number = 300) {
    await this.redis.set(key, value, 'EX', ttl);
  }

  /**
   * 获取缓存
   * @param key 键
   * @returns 值
   */
  async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  /**
   * 删除缓存
   * @param key 键
   */
  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  /**
   * 获取缓存的剩余时间
   * @param key 键
   * @returns 剩余时间（秒）
   */
  async ttl(key: string): Promise<number> {
    return await this.redis.ttl(key);
  }
}
