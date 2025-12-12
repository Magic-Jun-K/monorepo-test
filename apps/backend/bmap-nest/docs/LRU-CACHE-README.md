# LRU 缓存实现指南

本文档详细介绍了在前端（React 18 + TS + Vite 7）和后端（NestJS）项目中实现和使用 LRU（Least Recently Used，最近最少使用）缓存的方法。

## 目录

- [什么是 LRU 缓存](#什么是-lru-缓存)
- [后端实现（NestJS）](#后端实现nestjs)
  - [内存 LRU 缓存](#内存-lru-缓存)
  - [Redis LRU 缓存](#redis-lru-缓存)
  - [配置说明](#配置说明)
  - [使用示例](#使用示例)
- [前端实现（React）](#前端实现react)
  - [LRU 缓存类](#lru-缓存类)
  - [HTTP 缓存客户端](#http-缓存客户端)
  - [React Hook 封装](#react-hook-封装)
  - [使用示例](#使用示例-1)
- [最佳实践](#最佳实践)

## 什么是 LRU 缓存

LRU（Least Recently Used，最近最少使用）是一种缓存淘汰策略，当缓存空间不足时，会优先淘汰最近最少使用的数据。LRU 缓存的特点是：

1. **有限容量**：缓存有固定的大小限制
2. **淘汰策略**：当缓存满时，淘汰最近最少使用的项
3. **快速访问**：通常使用哈希表实现 O(1) 的查找时间
4. **使用频率追踪**：记录每个缓存项的使用情况

LRU 缓存适用于：

- API 请求结果缓存
- 数据库查询结果缓存
- 计算密集型操作结果缓存
- 频繁访问但不常变化的数据

## 后端实现（NestJS）

### 内存 LRU 缓存

在 `src/common/utils/lru-cache.ts` 中，我们实现了一个基于 JavaScript Map 的内存 LRU 缓存：

```typescript
/**
 * LRU 缓存实现
 * 使用 Map 数据结构，它能保持键的插入顺序
 */
export class LRUCache<K, V> {
  private cache: Map<K, V>;
  private readonly capacity: number;

  /**
   * 创建 LRU 缓存实例
   * @param capacity 缓存容量
   */
  constructor(capacity: number) {
    this.cache = new Map<K, V>();
    this.capacity = Math.max(1, capacity);
  }

  /**
   * 获取缓存项
   * @param key 键
   * @returns 值，如果不存在则返回 undefined
   */
  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;

    // 获取值
    const value = this.cache.get(key);

    // 删除并重新添加到末尾，使其成为最近使用的
    this.cache.delete(key);
    this.cache.set(key, value!);

    return value;
  }

  /**
   * 设置缓存项
   * @param key 键
   * @param value 值
   */
  set(key: K, value: V): void {
    // 如果键已存在，先删除
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // 如果缓存已满，删除最不常用的项（第一个）
    else if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    // 添加新项到末尾（最近使用）
    this.cache.set(key, value);
  }

  /**
   * 检查键是否存在
   * @param key 键
   * @returns 是否存在
   */
  has(key: K): boolean {
    return this.cache.has(key);
  }

  /**
   * 删除缓存项
   * @param key 键
   * @returns 是否成功删除
   */
  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 获取当前缓存大小
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * 获取所有键
   */
  keys(): IterableIterator<K> {
    return this.cache.keys();
  }

  /**
   * 获取所有值
   */
  values(): IterableIterator<V> {
    return this.cache.values();
  }

  /**
   * 获取所有键值对
   */
  entries(): IterableIterator<[K, V]> {
    return this.cache.entries();
  }
}
```

### Redis LRU 缓存

在 `src/module/redis/redis-lru.service.ts` 中，我们实现了基于 Redis 的 LRU 缓存服务：

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Redis LRU缓存服务
 * 利用Redis的内置LRU淘汰策略实现缓存
 */
@Injectable()
export class RedisLRUService {
  private readonly keyPrefix: string;
  private readonly defaultTTL: number;
  private readonly ttlConfig: Record<string, number>;

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly configService: ConfigService
  ) {
    const redisConfig = this.configService.get('redis');
    this.keyPrefix = redisConfig?.lru?.keyPrefix || 'app:';
    this.defaultTTL = redisConfig?.lru?.defaultTTL || 3600; // 默认1小时
    this.ttlConfig = redisConfig?.lru?.ttl || {};
  }

  /**
   * 设置缓存
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl 过期时间（秒），默认使用配置中的默认TTL
   * @param category 数据类别，用于应用不同的TTL策略
   */
  async set(key: string, value: any, ttl?: number, category?: string): Promise<void> {
    // 确定TTL：优先使用传入的TTL，其次使用类别TTL，最后使用默认TTL
    const effectiveTTL = ttl || (category && this.ttlConfig[category]) || this.defaultTTL;
    const prefixedKey = this.getPrefixedKey(key);

    await this.redis.set(prefixedKey, JSON.stringify(value), 'EX', effectiveTTL);
  }

  /**
   * 获取缓存
   * @param key 缓存键
   * @returns 缓存值，不存在则返回null
   */
  async get<T>(key: string): Promise<T | null> {
    const prefixedKey = this.getPrefixedKey(key);
    const value = await this.redis.get(prefixedKey);

    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch (e) {
      return value as unknown as T;
    }
  }

  /**
   * 获取缓存，如果不存在则设置
   * @param key 缓存键
   * @param fetchFn 获取数据的函数
   * @param ttl 过期时间（秒），默认使用配置中的默认TTL
   * @param category 数据类别，用于应用不同的TTL策略
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number,
    category?: string
  ): Promise<T> {
    const prefixedKey = this.getPrefixedKey(key);
    const cachedValue = await this.redis.get(prefixedKey);

    if (cachedValue) {
      try {
        return JSON.parse(cachedValue) as T;
      } catch (e) {
        return cachedValue as unknown as T;
      }
    }

    const value = await fetchFn();

    // 确定TTL：优先使用传入的TTL，其次使用类别TTL，最后使用默认TTL
    const effectiveTTL = ttl || (category && this.ttlConfig[category]) || this.defaultTTL;
    await this.redis.set(prefixedKey, JSON.stringify(value), 'EX', effectiveTTL);

    return value;
  }

  /**
   * 删除缓存
   * @param key 缓存键
   */
  async delete(key: string): Promise<void> {
    const prefixedKey = this.getPrefixedKey(key);
    await this.redis.del(prefixedKey);
  }

  /**
   * 删除匹配模式的缓存
   * @param pattern 模式，如 user:*
   */
  async deleteByPattern(pattern: string): Promise<void> {
    const prefixedPattern = this.getPrefixedKey(pattern);
    const keys = await this.redis.keys(prefixedPattern);

    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  /**
   * 设置缓存过期时间
   * @param key 缓存键
   * @param ttl 过期时间（秒）
   */
  async expire(key: string, ttl: number): Promise<void> {
    const prefixedKey = this.getPrefixedKey(key);
    await this.redis.expire(prefixedKey, ttl);
  }

  /**
   * 检查缓存是否存在
   * @param key 缓存键
   */
  async exists(key: string): Promise<boolean> {
    const prefixedKey = this.getPrefixedKey(key);
    const result = await this.redis.exists(prefixedKey);
    return result === 1;
  }

  /**
   * 获取缓存剩余过期时间
   * @param key 缓存键
   * @returns 剩余时间（秒），-1表示永不过期，-2表示不存在
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
```

### 配置说明

在 `src/config/redis.ts` 中，我们定义了 Redis LRU 缓存的配置：

```typescript
import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  // Redis连接配置
  connection: {
    url: process.env.REDIS_URL || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10)
  },

  // LRU缓存配置
  lru: {
    // 默认过期时间（秒）
    defaultTTL: parseInt(process.env.REDIS_DEFAULT_TTL || '3600', 10),

    // 最大内存策略设置为LRU
    // 注意：这需要在Redis配置文件中设置 maxmemory-policy allkeys-lru
    // 以及设置适当的 maxmemory 值
    maxMemoryPolicy: 'allkeys-lru',

    // 缓存键前缀
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'app:',

    // 不同类型数据的缓存时间（秒）
    ttl: {
      user: parseInt(process.env.REDIS_USER_TTL || '3600', 10), // 用户数据缓存1小时
      product: parseInt(process.env.REDIS_PRODUCT_TTL || '7200', 10), // 产品数据缓存2小时
      config: parseInt(process.env.REDIS_CONFIG_TTL || '86400', 10) // 配置数据缓存1天
    }
  }
}));
```

### 使用示例

在 `src/module/example/example.service.ts` 中，我们展示了如何使用 Redis LRU 缓存：

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { RedisLRUService } from '../redis/redis-lru.service';
import { ConfigService } from '@nestjs/config';

/**
 * 示例数据接口
 */
interface ExampleData {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

/**
 * 示例服务
 * 演示如何在NestJS中使用LRU缓存
 */
@Injectable()
export class ExampleService {
  // 缓存前缀
  private readonly CACHE_PREFIX = 'example:data:';
  // 数据类别
  private readonly DATA_CATEGORY = 'example';
  // 日志
  private readonly logger = new Logger(ExampleService.name);

  constructor(
    private readonly redisLRUService: RedisLRUService,
    private readonly configService: ConfigService
  ) {}

  /**
   * 获取数据（带缓存）
   * @param id 数据ID
   */
  async getData(id: string): Promise<ExampleData> {
    const cacheKey = `${this.CACHE_PREFIX}${id}`;

    // 使用getOrSet方法，如果缓存存在则返回缓存，否则执行获取数据的函数并缓存结果
    return this.redisLRUService.getOrSet<ExampleData>(
      cacheKey,
      async () => {
        // 模拟从数据库获取数据
        this.logger.log(`Cache miss for ID: ${id}, fetching from database`);
        const data = this.mockFetchDataFromDB(id);
        return data;
      },
      undefined, // 使用配置中的TTL
      this.DATA_CATEGORY // 使用数据类别
    );
  }

  /**
   * 创建数据
   * @param data 数据对象
   */
  async createData(data: Partial<ExampleData>): Promise<ExampleData> {
    // 创建数据
    const newData = {
      id: Math.random().toString(36).substring(2, 15),
      name: data.name || `Item ${Date.now()}`,
      description: data.description || 'No description provided',
      createdAt: new Date().toISOString()
    };

    // 模拟保存到数据库
    this.logger.log(`Creating new data with ID: ${newData.id}`);
    // ...

    // 缓存新数据
    const cacheKey = `${this.CACHE_PREFIX}${newData.id}`;
    await this.redisLRUService.set(
      cacheKey,
      newData,
      undefined, // 使用配置中的TTL
      this.DATA_CATEGORY // 使用数据类别
    );

    return newData;
  }

  /**
   * 删除数据
   * @param id 数据ID
   */
  async deleteData(id: string): Promise<{ success: boolean; message: string }> {
    // 模拟从数据库删除
    this.logger.log(`Deleting data with ID: ${id}`);
    // ...

    // 删除缓存
    const cacheKey = `${this.CACHE_PREFIX}${id}`;
    await this.redisLRUService.delete(cacheKey);

    this.logger.log(`Cache entry deleted for ID: ${id}`);

    return { success: true, message: `Data with ID ${id} has been deleted` };
  }

  /**
   * 清除所有示例数据缓存
   */
  async clearCache(): Promise<{ success: boolean; message: string }> {
    await this.redisLRUService.deleteByPattern(`${this.CACHE_PREFIX}*`);
    return { success: true, message: 'All example data cache has been cleared' };
  }

  /**
   * 模拟从数据库获取数据
   * @param id 数据ID
   */
  private mockFetchDataFromDB(id: string): ExampleData {
    // 模拟数据库查询延迟
    // 实际应用中，这里会是真正的数据库查询
    return {
      id,
      name: `Example Item ${id}`,
      description: `This is a description for item ${id}`,
      createdAt: new Date().toISOString()
    };
  }
}
```

## 前端实现（React）

### LRU 缓存类

在 `src/utils/lru-cache.ts` 中，我们实现了前端的 LRU 缓存类：

```typescript
/**
 * LRU（最近最少使用）缓存实现
 */
export class LRUCache<K, V> {
  private cache: Map<K, V>;
  private readonly capacity: number;

  /**
   * 创建LRU缓存实例
   * @param capacity 缓存容量
   */
  constructor(capacity: number) {
    this.cache = new Map<K, V>();
    this.capacity = Math.max(1, capacity);
  }

  /**
   * 获取缓存项
   * @param key 键
   * @returns 值，如果不存在则返回undefined
   */
  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;

    // 获取值
    const value = this.cache.get(key);

    // 删除并重新添加到末尾，使其成为最近使用的
    this.cache.delete(key);
    this.cache.set(key, value!);

    return value;
  }

  /**
   * 设置缓存项
   * @param key 键
   * @param value 值
   */
  set(key: K, value: V): void {
    // 如果键已存在，先删除
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // 如果缓存已满，删除最不常用的项（第一个）
    else if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    // 添加新项到末尾（最近使用）
    this.cache.set(key, value);
  }

  /**
   * 检查键是否存在
   * @param key 键
   * @returns 是否存在
   */
  has(key: K): boolean {
    return this.cache.has(key);
  }

  /**
   * 删除缓存项
   * @param key 键
   * @returns 是否成功删除
   */
  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 获取当前缓存大小
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * 获取所有键
   */
  keys(): IterableIterator<K> {
    return this.cache.keys();
  }

  /**
   * 获取所有值
   */
  values(): IterableIterator<V> {
    return this.cache.values();
  }

  /**
   * 获取所有键值对
   */
  entries(): IterableIterator<[K, V]> {
    return this.cache.entries();
  }
}

/**
 * 带过期时间的缓存项
 */
interface CacheItem<T> {
  value: T;
  expiry: number;
}

/**
 * 带过期时间的LRU缓存
 */
export class TTLCache<K, V> extends LRUCache<K, CacheItem<V>> {
  /**
   * 获取缓存项（考虑过期时间）
   * @param key 键
   * @returns 值，如果不存在或已过期则返回undefined
   */
  get(key: K): V | undefined {
    const item = super.get(key);

    if (!item) return undefined;

    // 检查是否过期
    if (item.expiry < Date.now()) {
      this.delete(key);
      return undefined;
    }

    return item.value;
  }

  /**
   * 设置缓存项（带过期时间）
   * @param key 键
   * @param value 值
   * @param ttl 过期时间（毫秒）
   */
  set(key: K, value: V, ttl: number): void {
    const expiry = Date.now() + ttl;
    super.set(key, { value, expiry });
  }

  /**
   * 检查键是否存在且未过期
   * @param key 键
   * @returns 是否存在且未过期
   */
  has(key: K): boolean {
    const item = super.get(key);

    if (!item) return false;

    // 检查是否过期
    if (item.expiry < Date.now()) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 获取所有未过期的值
   */
  values(): IterableIterator<V> {
    const now = Date.now();
    const validValues: V[] = [];

    for (const [key, item] of super.entries()) {
      if (item.expiry >= now) {
        validValues.push(item.value);
      } else {
        this.delete(key);
      }
    }

    return validValues[Symbol.iterator]();
  }

  /**
   * 获取所有未过期的键值对
   */
  entries(): IterableIterator<[K, V]> {
    const now = Date.now();
    const validEntries: [K, V][] = [];

    for (const [key, item] of super.entries()) {
      if (item.expiry >= now) {
        validEntries.push([key, item.value]);
      } else {
        this.delete(key);
      }
    }

    return validEntries[Symbol.iterator]();
  }

  /**
   * 清理所有过期项
   * @returns 清理的项数
   */
  cleanup(): number {
    const now = Date.now();
    let count = 0;

    for (const [key, item] of super.entries()) {
      if (item.expiry < now) {
        this.delete(key);
        count++;
      }
    }

    return count;
  }
}
```

### HTTP 缓存客户端

在 `src/utils/http-cache-client.ts` 中，我们实现了基于 LRU 缓存的 HTTP 客户端：

```typescript
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { TTLCache } from './lru-cache';

/**
 * 缓存配置
 */
interface CacheConfig {
  /** 是否使用缓存 */
  useCache?: boolean;
  /** 缓存过期时间（毫秒） */
  ttl?: number;
  /** 缓存键前缀 */
  keyPrefix?: string;
}

/**
 * 默认缓存配置
 */
const DEFAULT_CACHE_CONFIG: Required<CacheConfig> = {
  useCache: true,
  ttl: 60000, // 默认1分钟
  keyPrefix: 'api:'
};

/**
 * 带LRU缓存的HTTP客户端
 */
export class HttpCacheClient {
  private readonly axios: AxiosInstance;
  private readonly cache: TTLCache<string, any>;
  private readonly defaultConfig: Required<CacheConfig>;

  /**
   * 创建HTTP缓存客户端
   * @param baseURL 基础URL
   * @param cacheSize 缓存大小
   * @param defaultConfig 默认缓存配置
   */
  constructor(baseURL: string = '', cacheSize: number = 100, defaultConfig: CacheConfig = {}) {
    this.axios = axios.create({
      baseURL,
      timeout: 10000
    });

    this.cache = new TTLCache<string, any>(cacheSize);
    this.defaultConfig = { ...DEFAULT_CACHE_CONFIG, ...defaultConfig };

    // 添加响应拦截器，处理错误
    this.axios.interceptors.response.use(
      response => response,
      error => {
        console.error('API请求错误:', error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * 生成缓存键
   * @param url URL
   * @param params 查询参数
   * @param keyPrefix 键前缀
   * @returns 缓存键
   */
  private generateCacheKey(url: string, params?: any, keyPrefix?: string): string {
    const prefix = keyPrefix || this.defaultConfig.keyPrefix;
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return `${prefix}${url}${queryString}`;
  }

  /**
   * GET请求（支持缓存）
   * @param url URL
   * @param config 请求配置
   * @returns 响应数据
   */
  async get<T>(url: string, config?: AxiosRequestConfig & CacheConfig): Promise<T> {
    const {
      useCache = this.defaultConfig.useCache,
      ttl = this.defaultConfig.ttl,
      keyPrefix
    } = config || {};
    const params = config?.params;

    // 如果使用缓存，先尝试从缓存获取
    if (useCache) {
      const cacheKey = this.generateCacheKey(url, params, keyPrefix);
      const cachedData = this.cache.get(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      // 缓存未命中，发起请求并缓存结果
      const response = await this.axios.get<T>(url, config);
      this.cache.set(cacheKey, response.data, ttl);
      return response.data;
    }

    // 不使用缓存，直接发起请求
    const response = await this.axios.get<T>(url, config);
    return response.data;
  }

  /**
   * POST请求
   * @param url URL
   * @param data 请求数据
   * @param config 请求配置
   * @returns 响应数据
   */
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axios.post<T>(url, data, config);
    return response.data;
  }

  /**
   * PUT请求
   * @param url URL
   * @param data 请求数据
   * @param config 请求配置
   * @returns 响应数据
   */
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axios.put<T>(url, data, config);
    return response.data;
  }

  /**
   * DELETE请求
   * @param url URL
   * @param config 请求配置
   * @returns 响应数据
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axios.delete<T>(url, config);
    return response.data;
  }

  /**
   * 清除指定URL的缓存
   * @param url URL
   * @param params 查询参数
   * @param keyPrefix 键前缀
   */
  clearCache(url: string, params?: any, keyPrefix?: string): void {
    const cacheKey = this.generateCacheKey(url, params, keyPrefix);
    this.cache.delete(cacheKey);
  }

  /**
   * 清除所有缓存
   */
  clearAllCache(): void {
    this.cache.clear();
  }

  /**
   * 清理过期缓存
   * @returns 清理的项数
   */
  cleanupCache(): number {
    return this.cache.cleanup();
  }

  /**
   * 获取缓存大小
   */
  getCacheSize(): number {
    return this.cache.size;
  }

  /**
   * 获取底层Axios实例
   */
  getAxiosInstance(): AxiosInstance {
    return this.axios;
  }
}

// 创建默认实例
const httpClient = new HttpCacheClient(
  import.meta.env.VITE_API_BASE_URL || '/api',
  200 // 缓存200个请求
);

export default httpClient;
```

### React Hook 封装

在 `src/hooks/useApiCache.ts` 中，我们封装了 React Hook，方便在组件中使用 LRU 缓存：

```typescript
import { useState, useEffect, useCallback, useRef } from 'react';
import httpClient from '@/utils/http-cache-client';
import { AxiosRequestConfig } from 'axios';

/**
 * API缓存Hook配置
 */
interface UseApiCacheOptions {
  /** 是否使用缓存 */
  useCache?: boolean;
  /** 缓存过期时间（毫秒） */
  ttl?: number;
  /** 是否自动加载 */
  autoLoad?: boolean;
  /** 依赖数组，当依赖变化时重新加载 */
  deps?: any[];
  /** 请求配置 */
  requestConfig?: AxiosRequestConfig;
}

/**
 * 使用API缓存Hook
 * @param url API地址
 * @param options 配置选项
 * @returns 数据、加载状态、错误、刷新函数和清除缓存并刷新函数
 */
export function useApiCache<T>(url: string, options: UseApiCacheOptions = {}) {
  const {
    useCache = true,
    ttl = 60000, // 默认1分钟
    autoLoad = true,
    deps = [],
    requestConfig = {}
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(autoLoad);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef<boolean>(true);

  // 加载数据
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await httpClient.get<T>(url, {
        ...requestConfig,
        useCache,
        ttl
      });

      if (isMounted.current) {
        setData(response);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [url, useCache, ttl, JSON.stringify(requestConfig)]);

  // 刷新数据（使用缓存）
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // 清除缓存并刷新数据
  const clearAndRefresh = useCallback(() => {
    httpClient.clearCache(url, requestConfig.params);
    fetchData();
  }, [url, fetchData, requestConfig.params]);

  // 初始加载和依赖变化时重新加载
  useEffect(() => {
    if (autoLoad) {
      fetchData();
    }
  }, [autoLoad, fetchData, ...deps]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return { data, loading, error, refresh, clearAndRefresh };
}

/**
 * 提交方法类型
 */
type SubmitMethod = 'post' | 'put' | 'delete';

/**
 * 带提交功能的API缓存Hook
 * @param url API地址
 * @param options 配置选项
 * @returns 提交函数和提交状态
 */
export function useApiCacheWithMutation<T, D = any>(url: string, options: UseApiCacheOptions = {}) {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // 提交数据
  const submit = useCallback(
    async (data?: D, method: SubmitMethod = 'post') => {
      setSubmitting(true);
      setError(null);

      try {
        let response;

        switch (method) {
          case 'post':
            response = await httpClient.post<T>(url, data, options.requestConfig);
            break;
          case 'put':
            response = await httpClient.put<T>(url, data, options.requestConfig);
            break;
          case 'delete':
            response = await httpClient.delete<T>(url, options.requestConfig);
            break;
          default:
            throw new Error(`Unsupported method: ${method}`);
        }

        // 清除相关缓存
        httpClient.clearCache(url);

        return response;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [url, options.requestConfig]
  );

  return { submit, submitting, error };
}
```

### 使用示例

在 `src/pages/Test/CacheExample.tsx` 中，我们展示了如何在 React 组件中使用 LRU 缓存：

```tsx
import { useState } from 'react';
import { useApiCache, useApiCacheWithMutation } from '@/hooks/useApiCache';

/**
 * 示例数据接口
 */
interface ExampleData {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

/**
 * 缓存示例组件
 */
export default function CacheExample() {
  const [id, setId] = useState('1');

  // 使用API缓存Hook获取数据
  const { data, loading, error, refresh, clearAndRefresh } = useApiCache<ExampleData>(
    `/example/data/${id}`,
    {
      useCache: true,
      ttl: 60000, // 1分钟缓存
      deps: [id] // 当ID变化时重新加载数据
    }
  );

  // 使用带提交功能的API缓存Hook
  const { submitting, submit } = useApiCacheWithMutation('/example/data');

  // 创建新数据
  const handleCreate = async () => {
    try {
      await submit({
        name: `New Item ${Date.now()}`,
        description: 'Created from React client'
      });
      alert('数据创建成功！');
    } catch (err) {
      console.error('创建数据失败:', err);
      alert(`创建失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  };

  // 删除数据
  const handleDelete = async () => {
    if (!id) return;

    try {
      await submit(null, 'delete');
      alert(`数据 ${id} 已删除！`);
      // 清除缓存
      clearAndRefresh();
    } catch (err) {
      console.error('删除数据失败:', err);
      alert(`删除失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">LRU缓存示例</h1>

      <div className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">数据获取（带缓存）</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={id}
            onChange={e => setId(e.target.value)}
            placeholder="输入ID"
            className="border rounded px-2 py-1"
          />
          <button
            onClick={refresh}
            className="bg-blue-500 text-white px-3 py-1 rounded"
            disabled={loading}
          >
            刷新
          </button>
          <button
            onClick={clearAndRefresh}
            className="bg-purple-500 text-white px-3 py-1 rounded"
            disabled={loading}
          >
            清除缓存并刷新
          </button>
        </div>

        {loading && <div className="text-gray-500">加载中...</div>}
        {error && <div className="text-red-500">错误: {error.message}</div>}
        {data && (
          <div className="bg-gray-100 p-3 rounded">
            <h3 className="font-bold">{data.name}</h3>
            <p>{data.description}</p>
            <p className="text-sm text-gray-500">
              创建时间: {new Date(data.createdAt).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">ID: {data.id}</p>
          </div>
        )}
      </div>

      <div className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">数据操作</h2>
        <div className="flex gap-2">
          <button
            onClick={handleCreate}
            className="bg-green-500 text-white px-3 py-1 rounded"
            disabled={submitting}
          >
            创建新数据
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-3 py-1 rounded"
            disabled={submitting || !id}
          >
            删除当前数据
          </button>
        </div>
        {submitting && <div className="mt-2 text-gray-500">提交中...</div>}
      </div>

      <div className="p-4 border rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-2">缓存说明</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>数据会缓存1分钟</li>
          <li>相同ID的重复请求将从缓存获取</li>
          <li>点击「刷新」按钮会优先使用缓存</li>
          <li>点击「清除缓存并刷新」按钮会强制从服务器获取新数据</li>
          <li>创建或删除数据后会自动清除相关缓存</li>
        </ul>
      </div>
    </div>
  );
}
```

## 最佳实践

### 后端 LRU 缓存最佳实践

1. **选择合适的缓存策略**：

   - 对于小型应用，使用内存 LRU 缓存
   - 对于中大型应用，使用 Redis LRU 缓存
   - 对于分布式系统，必须使用 Redis 等分布式缓存

2. **设置合理的缓存大小**：

   - 内存缓存：根据应用内存限制和数据量设置
   - Redis 缓存：在 Redis 配置中设置 `maxmemory` 和 `maxmemory-policy allkeys-lru`

3. **设置合理的过期时间**：

   - 根据数据更新频率设置
   - 对不同类型的数据设置不同的过期时间
   - 使用配置文件或环境变量管理过期时间

4. **缓存键设计**：

   - 使用前缀区分不同类型的数据
   - 包含足够的信息以唯一标识数据
   - 避免过长的键名

5. **缓存失效策略**：

   - 主动使数据失效：当数据更新或删除时
   - 被动失效：通过过期时间或 LRU 策略

6. **缓存预热**：

   - 应用启动时预加载常用数据
   - 避免冷启动性能问题

7. **监控和日志**：
   - 记录缓存命中率
   - 监控缓存大小和内存使用
   - 记录缓存相关错误

### 前端 LRU 缓存最佳实践

1. **只缓存 GET 请求**：

   - POST、PUT、DELETE 等修改数据的请求不应被缓存
   - 修改数据后清除相关缓存

2. **设置合理的缓存大小**：

   - 考虑浏览器内存限制
   - 通常 100-200 个请求结果是合理的

3. **设置合理的过期时间**：

   - 短期缓存（1-5 分钟）用于频繁访问但可能变化的数据
   - 长期缓存（1 小时或更长）用于静态或很少变化的数据

4. **提供清除缓存的机制**：

   - 用户手动刷新
   - 登录/登出时清除
   - 特定操作后清除相关缓存

5. **处理错误和加载状态**：

   - 显示加载指示器
   - 优雅处理错误
   - 提供重试机制

6. **依赖管理**：

   - 当依赖变化时重新加载数据
   - 避免过时数据

7. **组件卸载时清理**：
   - 防止内存泄漏
   - 取消未完成的请求
