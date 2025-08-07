/**
 * @description 熔断器服务
 */
import { Injectable } from '@nestjs/common';

export interface CircuitBreakerConfig {
  failureThreshold: number; // 失败次数阈值
  successThreshold?: number; // 半开状态下成功次数阈值，默认为1
  timeout: number; // 超时时间(毫秒)
  resetTimeout: number; // 熔断器重置时间(毫秒)
  windowTime?: number; // 时间窗口(毫秒)，用于计算时间窗口内的失败率
}

// 默认配置
export const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  successThreshold: 1,
  timeout: 60000, // 1分钟
  resetTimeout: 30000, // 30秒
  windowTime: 60000, // 1分钟
};

export enum CircuitBreakerState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

@Injectable()
export class CircuitBreakerService {
  private circuits: Map<string, CircuitBreaker> = new Map(); // 存储所有熔断器的映射

  /**
   * 创建一个新的熔断器
   * @param name 熔断器名称
   * @param config 熔断器配置
   * @returns 新创建的熔断器
   */
  createCircuit(name: string, config: CircuitBreakerConfig): CircuitBreaker {
    const circuit = new CircuitBreaker(config);
    this.circuits.set(name, circuit);
    return circuit;
  }

  /**
   * 获取熔断器
   * @param name 熔断器名称
   * @returns 熔断器实例
   */
  getCircuit(name: string): CircuitBreaker | undefined {
    return this.circuits.get(name);
  }
}

/**
 * 熔断器类
 */
class CircuitBreaker {
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime: number | null = null;
  private failureTimestamps: number[] = []; // 记录失败时间戳
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;

  constructor(private config: CircuitBreakerConfig) {
    // 合并默认配置
    this.config = { ...DEFAULT_CIRCUIT_BREAKER_CONFIG, ...config };
  }

  /**
   * 执行异步操作
   * @param fn 要执行的异步函数
   * @returns 函数执行结果
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now();

    // 检查是否可以尝试执行
    if (this.state === CircuitBreakerState.OPEN) {
      // 检查是否应该进入半开状态
      if (
        this.lastFailureTime &&
        now - this.lastFailureTime > this.config.resetTimeout
      ) {
        this.state = CircuitBreakerState.HALF_OPEN;
        this.successCount = 0; // 重置成功计数
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();

      // 执行成功
      if (this.state === CircuitBreakerState.HALF_OPEN) {
        this.successCount++;
        // 检查是否达到成功阈值
        if (this.successCount >= (this.config.successThreshold || 1)) {
          this.reset();
        }
      } else {
        // 在关闭状态下重置成功计数
        this.successCount = 0;
      }

      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = now;
      this.failureTimestamps.push(now);

      // 清理过期的失败记录
      this.cleanupFailureTimestamps(now);

      // 基于失败次数或失败率检查是否需要打开熔断器
      const shouldOpen =
        this.failureCount >= this.config.failureThreshold ||
        this.getFailureRate(now) >= 0.5; // 50%失败率阈值

      if (shouldOpen) {
        this.state = CircuitBreakerState.OPEN;
      }

      throw error;
    }
  }

  /**
   * 重置熔断器状态
   */
  private reset() {
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.failureTimestamps = [];
    this.state = CircuitBreakerState.CLOSED;
  }

  /**
   * 清理过期的失败记录
   * @param now 当前时间
   */
  private cleanupFailureTimestamps(now: number) {
    const windowTime = this.config.windowTime || 60000; // 默认1分钟
    const cutoffTime = now - windowTime;

    // 移除超出时间窗口的失败记录
    this.failureTimestamps = this.failureTimestamps.filter(
      (timestamp) => timestamp > cutoffTime,
    );

    // 更新失败计数
    this.failureCount = this.failureTimestamps.length;
  }

  /**
   * 获取失败率
   * @param now 当前时间
   * @returns 失败率
   */
  private getFailureRate(now: number): number {
    const windowTime = this.config.windowTime || 60000; // 默认1分钟
    const cutoffTime = now - windowTime;

    // 计算时间窗口内的失败次数
    const recentFailures = this.failureTimestamps.filter(
      (timestamp) => timestamp > cutoffTime,
    ).length;

    // 如果时间窗口内没有请求，返回0
    if (recentFailures === 0) return 0;

    // 简化计算，假设请求数量与失败次数相同
    // 在实际应用中，可能需要跟踪总的请求数量
    return recentFailures / (recentFailures + 1); // 加1避免除零错误
  }

  /**
   * 获取熔断器状态
   * @returns 熔断器状态
   */
  getState(): CircuitBreakerState {
    return this.state;
  }
}
