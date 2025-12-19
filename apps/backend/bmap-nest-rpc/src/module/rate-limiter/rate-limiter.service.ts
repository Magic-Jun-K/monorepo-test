/**
 * @description 限流服务
 */
import { Injectable } from '@nestjs/common';

import { RedisService } from '../redis/redis.service';

export interface RateLimiterConfig {
  windowMs?: number; // 时间窗口(毫秒)，用于固定窗口和滑动窗口算法
  maxRequests?: number; // 最大请求数
  keyPrefix?: string; // Redis键前缀
  strategy?: 'fixed-window' | 'sliding-window' | 'token-bucket' | 'leaky-bucket'; // 限流策略

  // 令牌桶算法配置
  bucketCapacity?: number; // 桶容量
  refillRate?: number; // 每秒补充令牌数

  // 漏桶算法配置
  leakRate?: number; // 每秒漏出请求数
}

// 默认配置
export const DEFAULT_RATE_LIMITER_CONFIG: RateLimiterConfig = {
  windowMs: 60000, // 1分钟
  maxRequests: 100,
  strategy: 'fixed-window',
  keyPrefix: 'rate_limit',
};

@Injectable()
export class RateLimiterService {
  constructor(private readonly redisService: RedisService) {}

  /**
   * 检查是否超过限流阈值
   * @param key 限流键
   * @param config 限流配置
   * @returns 是否超过限流阈值
   */
  async checkRateLimit(key: string, config: RateLimiterConfig): Promise<boolean> {
    // 合并默认配置
    const mergedConfig = { ...DEFAULT_RATE_LIMITER_CONFIG, ...config };

    switch (mergedConfig.strategy) {
      // 令牌桶算法
      case 'token-bucket':
        return this.checkTokenBucket(key, mergedConfig);
      // 漏桶算法
      case 'leaky-bucket':
        return this.checkLeakyBucket(key, mergedConfig);
      // 滑动窗口算法
      case 'sliding-window':
        return this.checkSlidingWindow(key, mergedConfig);
      // 固定窗口算法
      case 'fixed-window':
      default:
        return this.checkFixedWindow(key, mergedConfig);
    }
  }

  /**
   * 获取限流信息
   * @param key 限流键
   * @param config 限流配置
   * @returns 限流信息
   */
  async getRateLimitInfo(key: string, config: RateLimiterConfig) {
    // 合并默认配置
    const mergedConfig = { ...DEFAULT_RATE_LIMITER_CONFIG, ...config };

    switch (mergedConfig.strategy) {
      case 'token-bucket':
        return this.getTokenBucketInfo(key, mergedConfig);
      case 'leaky-bucket':
        return this.getLeakyBucketInfo(key, mergedConfig);
      case 'sliding-window':
        return this.getSlidingWindowInfo(key, mergedConfig);
      case 'fixed-window':
      default:
        return this.getFixedWindowInfo(key, mergedConfig);
    }
  }

  // 固定窗口算法
  /**
   * 检查固定窗口是否超过限流阈值
   * @param key 限流键
   * @param config 限流配置
   * @returns 是否超过限流阈值
   */
  private async checkFixedWindow(key: string, config: RateLimiterConfig): Promise<boolean> {
    const redisKey = `${config.keyPrefix}:${key}:fixed`;
    const redis = this.redisService.getClient();

    const currentTime = Date.now();
    const windowStart = currentTime - (config.windowMs || 60000);

    // 移除时间窗口外的记录
    await redis.zremrangebyscore(redisKey, 0, windowStart);

    // 获取当前窗口内的请求数
    const currentCount = await redis.zcard(redisKey);

    // 检查是否超过限制
    if (currentCount >= (config.maxRequests || 100)) {
      return false; // 超过限制
    }

    // 添加当前请求记录
    await redis.zadd(redisKey, currentTime, `${currentTime}:${Math.random()}`);

    // 设置过期时间
    await redis.expire(redisKey, Math.ceil((config.windowMs || 60000) / 1000));

    return true; // 未超过限制
  }

  /**
   * 获取固定窗口限流信息
   * @param key 限流键
   * @param config 限流配置
   * @returns 固定窗口限流信息
   */
  private async getFixedWindowInfo(key: string, config: RateLimiterConfig) {
    const redisKey = `${config.keyPrefix}:${key}:fixed`;
    const redis = this.redisService.getClient();

    const currentTime = Date.now();
    const windowStart = currentTime - (config.windowMs || 60000);

    // 移除时间窗口外的记录
    await redis.zremrangebyscore(redisKey, 0, windowStart);

    // 获取当前窗口内的请求数
    const currentCount = await redis.zcard(redisKey);

    return {
      currentCount,
      maxRequests: config.maxRequests || 100,
      remaining: Math.max(0, (config.maxRequests || 100) - currentCount),
      resetTime: currentTime + (config.windowMs || 60000),
      strategy: 'fixed-window',
    };
  }

  // 滑动窗口算法
  /**
   * 检查滑动窗口是否超过限流阈值
   * @param key 限流键
   * @param config 限流配置
   * @returns 是否超过限流阈值
   */
  private async checkSlidingWindow(key: string, config: RateLimiterConfig): Promise<boolean> {
    const redisKey = `${config.keyPrefix}:${key}:sliding`;
    const redis = this.redisService.getClient();

    const currentTime = Date.now();
    const windowStart = currentTime - (config.windowMs || 60000);

    // 移除时间窗口外的记录
    await redis.zremrangebyscore(redisKey, 0, windowStart);

    // 获取当前窗口内的请求数
    const currentCount = await redis.zcard(redisKey);

    // 检查是否超过限制
    if (currentCount >= (config.maxRequests || 100)) {
      return false; // 超过限制
    }

    // 添加当前请求记录
    await redis.zadd(redisKey, currentTime, `${currentTime}:${Math.random()}`);

    // 设置过期时间
    await redis.expire(redisKey, Math.ceil((config.windowMs || 60000) / 1000));

    return true; // 未超过限制
  }

  /**
   * 获取滑动窗口限流信息
   * @param key 限流键
   * @param config 限流配置
   * @returns 滑动窗口限流信息
   */
  private async getSlidingWindowInfo(key: string, config: RateLimiterConfig) {
    const redisKey = `${config.keyPrefix}:${key}:sliding`;
    const redis = this.redisService.getClient();

    const currentTime = Date.now();
    const windowStart = currentTime - (config.windowMs || 60000);

    // 移除时间窗口外的记录
    await redis.zremrangebyscore(redisKey, 0, windowStart);

    // 获取当前窗口内的请求数
    const currentCount = await redis.zcard(redisKey);

    return {
      currentCount,
      maxRequests: config.maxRequests || 100,
      remaining: Math.max(0, (config.maxRequests || 100) - currentCount),
      resetTime: currentTime + (config.windowMs || 60000),
      strategy: 'sliding-window',
    };
  }

  // 令牌桶算法
  /**
   * 检查令牌桶是否超过限流阈值
   * @param key 限流键
   * @param config 限流配置
   * @returns 是否超过限流阈值
   */
  private async checkTokenBucket(key: string, config: RateLimiterConfig): Promise<boolean> {
    const redisKey = `${config.keyPrefix}:${key}:token`;
    const redis = this.redisService.getClient();

    const currentTime = Date.now();
    const bucketCapacity = config.bucketCapacity || 100;
    const refillRate = config.refillRate || 10; // 每秒补充令牌数

    // 获取当前桶中的令牌数和上次更新时间
    const bucketData = await redis.hgetall(redisKey);
    let tokens = bucketData.tokens ? Number.parseFloat(bucketData.tokens) : bucketCapacity;
    const lastRefill = bucketData.lastRefill ? Number.parseInt(bucketData.lastRefill) : currentTime;

    // 计算需要补充的令牌数
    const timePassed = (currentTime - lastRefill) / 1000; // 转换为秒
    const newTokens = timePassed * refillRate;
    tokens = Math.min(bucketCapacity, tokens + newTokens);

    // 检查是否有足够的令牌
    if (tokens < 1) {
      // 更新Redis中的令牌数和时间
      await redis.hmset(redisKey, {
        tokens: tokens.toString(),
        lastRefill: currentTime.toString(),
      });
      await redis.expire(redisKey, 300); // 5分钟过期
      return false; // 没有足够令牌
    }

    // 消耗一个令牌
    tokens -= 1;

    // 更新Redis中的令牌数和时间
    await redis.hmset(redisKey, {
      tokens: tokens.toString(),
      lastRefill: currentTime.toString(),
    });
    await redis.expire(redisKey, 300); // 5分钟过期

    return true; // 有足够的令牌
  }

  /**
   * 获取令牌桶限流信息
   * @param key 限流键
   * @param config 限流配置
   * @returns 令牌桶限流信息
   */
  private async getTokenBucketInfo(key: string, config: RateLimiterConfig) {
    const redisKey = `${config.keyPrefix}:${key}:token`;
    const redis = this.redisService.getClient();

    const currentTime = Date.now();
    const bucketCapacity = config.bucketCapacity || 100;
    const refillRate = config.refillRate || 10; // 每秒补充令牌数

    // 获取当前桶中的令牌数和上次更新时间
    const bucketData = await redis.hgetall(redisKey);
    let tokens = bucketData.tokens ? Number.parseFloat(bucketData.tokens) : bucketCapacity;
    const lastRefill = bucketData.lastRefill ? Number.parseInt(bucketData.lastRefill) : currentTime;

    // 计算需要补充的令牌数
    const timePassed = (currentTime - lastRefill) / 1000; // 转换为秒
    const newTokens = timePassed * refillRate;
    tokens = Math.min(bucketCapacity, tokens + newTokens);

    return {
      currentTokens: Math.floor(tokens),
      bucketCapacity,
      refillRate,
      lastRefill: currentTime,
      remaining: Math.floor(tokens),
      resetTime: currentTime + Math.ceil((bucketCapacity - tokens) / refillRate) * 1000,
      strategy: 'token-bucket',
    };
  }

  // 漏桶算法
  /**
   * 检查漏桶是否超过限流阈值
   * @param key 限流键
   * @param config 限流配置
   * @returns 是否超过限流阈值
   */
  private async checkLeakyBucket(key: string, config: RateLimiterConfig): Promise<boolean> {
    const redisKey = `${config.keyPrefix}:${key}:leaky`;
    const redis = this.redisService.getClient();

    const currentTime = Date.now();
    const leakRate = config.leakRate || 10; // 每秒漏出请求数

    // 获取桶中的请求数和上次漏水时间
    const bucketData = await redis.hgetall(redisKey);
    let requestCount = bucketData.requestCount ? Number.parseInt(bucketData.requestCount) : 0;
    const lastLeak = bucketData.lastLeak ? Number.parseInt(bucketData.lastLeak) : currentTime;

    // 计算需要漏出的请求数
    const timePassed = (currentTime - lastLeak) / 1000; // 转换为秒
    const leakedRequests = Math.floor(timePassed * leakRate);
    requestCount = Math.max(0, requestCount - leakedRequests);

    // 检查桶是否已满
    const bucketCapacity = config.bucketCapacity || 100;
    if (requestCount >= bucketCapacity) {
      // 更新Redis中的请求数和时间
      await redis.hmset(redisKey, {
        requestCount: requestCount.toString(),
        lastLeak: currentTime.toString(),
      });
      await redis.expire(redisKey, 300); // 5分钟过期
      return false; // 桶已满
    }

    // 添加请求到桶中
    requestCount += 1;

    // 更新Redis中的请求数和时间
    await redis.hmset(redisKey, {
      requestCount: requestCount.toString(),
      lastLeak: currentTime.toString(),
    });
    await redis.expire(redisKey, 300); // 5分钟过期

    return true; // 请求被接受
  }

  /**
   * 获取漏桶限流信息
   * @param key 限流键
   * @param config 限流配置
   * @returns 漏桶限流信息
   */
  private async getLeakyBucketInfo(key: string, config: RateLimiterConfig) {
    const redisKey = `${config.keyPrefix}:${key}:leaky`;
    const redis = this.redisService.getClient();

    const currentTime = Date.now();
    const leakRate = config.leakRate || 10; // 每秒漏出请求数

    // 获取桶中的请求数和上次漏水时间
    const bucketData = await redis.hgetall(redisKey);
    let requestCount = bucketData.requestCount ? Number.parseInt(bucketData.requestCount) : 0;
    const lastLeak = bucketData.lastLeak ? Number.parseInt(bucketData.lastLeak) : currentTime;

    // 计算需要漏出的请求数
    const timePassed = (currentTime - lastLeak) / 1000; // 转换为秒
    const leakedRequests = Math.floor(timePassed * leakRate);
    requestCount = Math.max(0, requestCount - leakedRequests);

    const bucketCapacity = config.bucketCapacity || 100;

    return {
      requestCount,
      bucketCapacity,
      leakRate,
      lastLeak: currentTime,
      remaining: Math.max(0, bucketCapacity - requestCount),
      resetTime: currentTime + Math.ceil(requestCount / leakRate) * 1000,
      strategy: 'leaky-bucket',
    };
  }
}
