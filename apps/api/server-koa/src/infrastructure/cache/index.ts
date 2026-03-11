import { createClient, RedisClientType } from 'redis';

import { config } from '../../core/config';
import { createLogger } from '../logger';

const logger = createLogger('redis');

class Cache {
  private client: RedisClientType | null = null;

  /**
   * 连接Redis数据库
   */
  async connect(): Promise<RedisClientType> {
    if (this.client?.isOpen) {
      return this.client;
    }

    this.client = createClient({
      socket: {
        host: config.REDIS_HOST,
        port: config.REDIS_PORT,
      },
      password: config.REDIS_PASSWORD || undefined,
      database: config.REDIS_DB,
    });

    this.client.on('error', (err) => {
      logger.error('Redis client error', { error: err.message });
    });

    this.client.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    await this.client.connect();
    return this.client;
  }

  /**
   * 获取Redis客户端实例
   */
  getClient(): RedisClientType {
    if (!this.client || !this.client.isOpen) {
      throw new Error('Redis not initialized. Call connect() first.');
    }
    return this.client;
  }

  /**
   * 断开Redis数据库连接
   */
  async disconnect(): Promise<void> {
    if (this.client?.isOpen) {
      await this.client.quit();
      this.client = null;
      logger.info('Redis disconnected');
    }
  }

  /**
   * 获取缓存值
   * @param key 缓存键
   * @returns 缓存值
   */
  async get<T>(key: string): Promise<T | null> {
    const client = this.getClient();
    const value = await client.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  }

  /**
   * 设置缓存值
   * @param key 缓存键
   * @param value 缓存值
   * @param ttlSeconds 过期时间（秒）
   */
  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const client = this.getClient();
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await client.setEx(key, ttlSeconds, serialized);
    } else {
      await client.set(key, serialized);
    }
  }

  /**
   * 删除缓存值
   * @param key 缓存键
   */
  async delete(key: string): Promise<void> {
    const client = this.getClient();
    await client.del(key);
  }

  /**
   * 删除匹配模式的缓存值
   * @param pattern 缓存键模式
   */
  async deletePattern(pattern: string): Promise<void> {
    const client = this.getClient();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
  }

  /**
   * 检查缓存键是否存在
   * @param key 缓存键
   * @returns 是否存在
   */
  async exists(key: string): Promise<boolean> {
    const client = this.getClient();
    return (await client.exists(key)) === 1;
  }

  /**
   * 设置缓存键的过期时间
   * @param key 缓存键
   * @param ttlSeconds 过期时间（秒）
   */
  async expire(key: string, ttlSeconds: number): Promise<void> {
    const client = this.getClient();
    await client.expire(key, ttlSeconds);
  }
}

export const cache = new Cache();
export default cache;
