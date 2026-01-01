import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

import { AppLoggerService } from '../../common/services/logger.service';

/**
 * Redis LRU缓存服务
 * 利用Redis的内置LRU淘汰策略实现高效缓存
 */
@Injectable()
export class RedisLRUService {
  private readonly keyPrefix: string; // 缓存键前缀
  private readonly defaultTTL: number; // 默认过期时间（秒）
  private readonly ttlConfig: Record<string, number>; // 类别TTL配置

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly configService: ConfigService,
    private readonly logger: AppLoggerService,
  ) {
    const redisConfig = this.configService.get('redis');
    this.keyPrefix = redisConfig?.lru?.keyPrefix || 'app:';
    this.defaultTTL = redisConfig?.lru?.defaultTTL || 3600; // 默认1小时
    this.ttlConfig = redisConfig?.lru?.ttl || {};
    this.logger.setContext('RedisLRUService');
  }

  /**
   * 设置缓存，使用LRU策略
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl 过期时间（秒），默认使用配置中的默认TTL
   * @param category 数据类别，用于应用不同的TTL策略
   */
  async set(key: string, value: unknown, ttl?: number, category?: string): Promise<void> {
    // 确定TTL：优先使用传入的TTL，其次使用类别TTL，最后使用默认TTL
    const effectiveTTL = ttl || (category && this.ttlConfig[category]) || this.defaultTTL;
    const prefixedKey = this.getPrefixedKey(key); // 缓存键前缀 + 缓存键
    // 如果值是对象，转换为JSON字符串
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

    // 使用EX设置过期时间（秒）
    await this.redis.set(prefixedKey, stringValue, 'EX', effectiveTTL);
    this.logger.logCache('SET', prefixedKey, { value: stringValue, ttl: effectiveTTL });
  }

  /**
   * 获取缓存值
   * @param key 缓存键
   * @param parseJson 是否将结果解析为JSON对象
   * @returns 缓存值或null（如果不存在）
   */
  async get<T = unknown>(key: string, parseJson: boolean = true): Promise<T | null> {
    const prefixedKey = this.getPrefixedKey(key); // 缓存键前缀 + 缓存键
    // 从Redis获取缓存值
    const value = await this.redis.get(prefixedKey);

    // 如果缓存不存在，返回null
    if (!value) {
      this.logger.logCache('MISS', prefixedKey);
      return null;
    }

    // 尝试解析JSON
    if (parseJson) {
      try {
        return JSON.parse(value) as T;
      } catch {
        // 如果解析失败，返回原始值
        return value as unknown as T;
      }
    }

    return value as unknown as T;
  }

  /**
   * 获取缓存，如果不存在则设置
   * @param key 缓存键
   * @param factory 生成缓存值的工厂函数
   * @param ttl 过期时间（秒）
   * @returns 缓存值
   */
  async getOrSet<T = unknown>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
    category?: string,
  ): Promise<T> {
    // 尝试获取缓存
    const cached = await this.get<T>(key);

    // 如果缓存存在，直接返回
    if (cached !== null) {
      this.logger.logCache('HIT', this.getPrefixedKey(key), { value: cached });
      return cached;
    }

    // 缓存不存在，调用工厂函数获取值
    const value = await factory();

    // 设置缓存
    // 确定TTL：优先使用传入的TTL，其次使用类别TTL，最后使用默认TTL
    const effectiveTTL = ttl || (category && this.ttlConfig[category]) || this.defaultTTL;
    await this.set(key, value, effectiveTTL, category);

    return value;
  }

  /**
   * 删除缓存
   * @param key 缓存键
   */
  async delete(key: string): Promise<void> {
    const prefixedKey = this.getPrefixedKey(key);
    await this.redis.del(prefixedKey);
    this.logger.logCache('CLEAR', prefixedKey);
  }

  /**
   * 批量删除匹配模式的缓存
   * @param pattern 键模式，如 'user:*'
   */
  async deleteByPattern(pattern: string): Promise<void> {
    const prefixedPattern = this.getPrefixedKey(pattern);
    // 使用SCAN命令查找匹配的键
    let cursor = '0';
    do {
      // 使用SCAN命令获取匹配的键
      const [nextCursor, keys] = await this.redis.scan(
        cursor,
        'MATCH',
        prefixedPattern,
        'COUNT',
        100,
      );
      cursor = nextCursor;

      // 如果有匹配的键，删除它们
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } while (cursor !== '0'); // 当cursor为'0'时表示扫描完成
  }

  /**
   * 设置缓存过期时间
   * @param key 缓存键
   * @param ttl 过期时间（秒）
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    const prefixedKey = this.getPrefixedKey(key);
    const result = await this.redis.expire(prefixedKey, ttl);
    return result === 1;
  }

  /**
   * 检查键是否存在
   * @param key 缓存键
   */
  async exists(key: string): Promise<boolean> {
    const prefixedKey = this.getPrefixedKey(key);
    const result = await this.redis.exists(prefixedKey);
    return result === 1;
  }

  /**
   * 获取键的剩余生存时间（秒）
   * @param key 缓存键
   * @returns 剩余秒数，-1表示永不过期，-2表示键不存在
   */
  async ttl(key: string): Promise<number> {
    const prefixedKey = this.getPrefixedKey(key);
    return this.redis.ttl(prefixedKey);
  }

  /**
   * 获取带前缀的缓存键
   * @param key 原始键
   * @returns 带前缀的键
   */
  private getPrefixedKey(key: string): string {
    // 如果键已经有前缀，则不再添加
    if (key.startsWith(this.keyPrefix)) {
      return key;
    }
    return `${this.keyPrefix}${key}`;
  }

  /**
   * 获取指定类别的TTL
   * @param category 数据类别
   * @returns TTL值（秒）
   */
  public getCategoryTTL(category: string): number {
    return this.ttlConfig[category] || this.defaultTTL;
  }
}
