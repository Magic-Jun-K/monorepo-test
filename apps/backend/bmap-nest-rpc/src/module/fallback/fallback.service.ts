/**
 * @description 降级服务
 */
import { Injectable } from '@nestjs/common';
import { AppLoggerService } from '@/common/services/logger.service';

export interface FallbackConfig {
  timeout?: number; // 超时时间(毫秒)
  defaultResponse?: unknown; // 默认响应
  retryAttempts?: number; // 重试次数
  retryDelay?: number; // 重试延迟(毫秒)
  retryBackoff?: 'fixed' | 'exponential' | 'linear'; // 重试退避策略
  retryBackoffMultiplier?: number; // 退避乘数
  circuitBreaker?: boolean; // 是否启用熔断器
  fallbackFunction?: () => Promise<unknown>; // 降级函数
  errorTypeFallbacks?: Record<string, () => Promise<unknown>>; // 基于错误类型的降级函数
  fallbackTimeout?: number; // 降级函数超时时间
}

// 默认配置
export const DEFAULT_FALLBACK_CONFIG: FallbackConfig = {
  timeout: 5000, // 5秒
  retryAttempts: 3,
  retryDelay: 1000, // 1秒
  retryBackoff: 'fixed',
  retryBackoffMultiplier: 1,
  circuitBreaker: false,
  fallbackTimeout: 3000, // 3秒
};

@Injectable()
export class FallbackService {
  constructor(private readonly logger: AppLoggerService) {
    this.logger.setContext('FallbackService');
  }

  /**
   * 执行带降级功能的异步操作
   * @param fn 要执行的异步函数
   * @param config 降级配置
   * @returns 函数执行结果
   */
  async executeWithFallback<T>(fn: () => Promise<T>, config: FallbackConfig): Promise<T> {
    // 合并默认配置
    const mergedConfig = { ...DEFAULT_FALLBACK_CONFIG, ...config };

    // 首先尝试正常执行
    try {
      const result = await this.executeWithTimeout(fn, mergedConfig.timeout!);
      return result;
    } catch (error) {
      // 如果配置了熔断器，检查熔断器状态
      if (mergedConfig.circuitBreaker) {
        // 这里应该集成熔断器逻辑
        // 为简化示例，我们只记录日志
        this.logger.log('Circuit breaker triggered');
      }

      // 如果配置了重试，则尝试重试
      if (mergedConfig.retryAttempts && mergedConfig.retryAttempts > 0) {
        for (let i = 0; i < mergedConfig.retryAttempts; i++) {
          try {
            // 计算重试延迟
            const delay = this.calculateRetryDelay(mergedConfig, i);

            // 等待重试延迟
            if (delay > 0) {
              await this.delay(delay);
            }

            return await this.executeWithTimeout(fn, mergedConfig.timeout!);
          } catch (retryError) {
            this.logger.error(`Retry attempt ${i + 1} failed`, (retryError as Error).stack);

            // 如果是最后一次重试，跳出循环
            if (i === mergedConfig.retryAttempts - 1) {
              break;
            }
          }
        }
      }

      // 尝试基于错误类型的降级函数
      if (mergedConfig.errorTypeFallbacks && error instanceof Error) {
        const errorType = error.constructor.name;
        const fallbackFn = mergedConfig.errorTypeFallbacks[errorType];

        if (fallbackFn) {
          try {
            return await this.executeWithTimeout(fallbackFn, mergedConfig.fallbackTimeout!);
          } catch (fallbackError) {
            this.logger.error(`Error type fallback function failed for ${errorType}`, (fallbackError as Error).stack);
          }
        }
      }

      // 尝试使用通用降级函数
      if (mergedConfig.fallbackFunction) {
        try {
          return await this.executeWithTimeout(
            mergedConfig.fallbackFunction,
            mergedConfig.fallbackTimeout!,
          );
        } catch (fallbackError) {
          this.logger.error('Fallback function failed', (fallbackError as Error).stack);
        }
      }

      // 如果所有重试都失败，返回默认响应或抛出错误
      if (mergedConfig.defaultResponse !== undefined) {
        return mergedConfig.defaultResponse as T;
      }

      throw error;
    }
  }

  /**
   * 执行带超时功能的异步操作
   * @param fn 要执行的异步函数
   * @param timeout 超时时间(毫秒)
   * @returns 函数执行结果
   */
  private async executeWithTimeout<T>(fn: () => Promise<T>, timeout: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Execution timeout'));
      }, timeout);

      fn().then(
        (result) => {
          clearTimeout(timeoutId);
          resolve(result);
        },
        (error) => {
          clearTimeout(timeoutId);
          reject(error);
        },
      );
    });
  }

  /**
   * 延迟执行
   * @param ms 延迟时间(毫秒)
   * @returns 延迟执行结果
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 计算重试延迟
   * @param config 降级配置
   * @param attempt 重试次数
   * @returns 重试延迟(毫秒)
   */
  private calculateRetryDelay(config: FallbackConfig, attempt: number): number {
    const baseDelay = config.retryDelay || 1000;

    switch (config.retryBackoff) {
      case 'exponential':
        return baseDelay * Math.pow(config.retryBackoffMultiplier || 2, attempt);
      case 'linear':
        return baseDelay * (1 + (config.retryBackoffMultiplier || 1) * attempt);
      case 'fixed':
      default:
        return baseDelay;
    }
  }
}
