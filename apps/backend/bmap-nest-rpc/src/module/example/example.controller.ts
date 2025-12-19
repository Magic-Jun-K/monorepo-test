import { Controller, Post, Get, Body, Ip, BadRequestException, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { KafkaService } from '../kafka/kafka.service';
import { CircuitBreakerService } from '../circuit-breaker/circuit-breaker.service';
import { RateLimiterService } from '../rate-limiter/rate-limiter.service';
import { FallbackService } from '../fallback/fallback.service';

@ApiTags('example')
@Controller('example')
export class ExampleController {
  private circuitBreaker;
  private exampleRateLimiterConfig = {
    windowMs: 60000, // 1分钟
    maxRequests: 10, // 最多10个请求
    keyPrefix: 'example',
  };

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly circuitBreakerService: CircuitBreakerService,
    private readonly rateLimiterService: RateLimiterService,
    private readonly fallbackService: FallbackService,
  ) {
    // 创建一个熔断器实例
    this.circuitBreaker = this.circuitBreakerService.createCircuit('example', {
      failureThreshold: 3, // 3次失败后熔断
      timeout: 5000, // 5秒超时
      resetTimeout: 30000, // 30秒后尝试恢复
    });
  }

  /**
   * 处理请求
   * @param data 请求数据
   * @param ip 请求IP
   * @returns 处理结果
   */
  @Post('process')
  async processRequest(@Body() data: unknown, @Ip() ip: string) {
    // 1. 限流检查
    const isAllowed = await this.rateLimiterService.checkRateLimit(
      `process:${ip}`,
      this.exampleRateLimiterConfig,
    );

    if (!isAllowed) {
      throw new BadRequestException('Too many requests');
    }

    try {
      // 2. 熔断器保护
      const result = await this.circuitBreaker.execute(async () => {
        // 3. 降级处理
        return await this.fallbackService.executeWithFallback(
          async () => {
            // 模拟业务逻辑
            await this.processBusinessLogic(data);
            return { success: true, message: 'Processing completed' };
          },
          {
            timeout: 3000, // 3秒超时
            defaultResponse: {
              success: false,
              message: 'Service temporarily unavailable',
            },
            retryAttempts: 2,
            retryDelay: 1000,
          },
        );
      });

      // 4. 发送Kafka事件
      await this.kafkaService.sendAuthEvent('PROCESS_COMPLETED', {
        data,
        result,
        ip,
      });

      return result;
    } catch (error) {
      // 发送失败事件到Kafka
      await this.kafkaService.sendAuthEvent('PROCESS_FAILED', {
        data,
        error: error.message,
        ip,
      });

      throw error;
    }
  }

  /**
   * 发送Kafka事件
   * @param message 事件消息
   * @returns 发送结果
   */
  @Get('kafka')
  async sendKafkaEvent(@Query('message') message: string = 'Example message') {
    try {
      await this.kafkaService.sendAuthEvent('EXAMPLE_EVENT', {
        message,
        timestamp: new Date(),
      });
      return { success: true, message: 'Event sent to Kafka' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 测试熔断器
   * @param enable 是否启用熔断器
   * @returns 测试结果
   */
  @Get('circuit-breaker')
  async circuitBreakerExample(@Query('enable') enable: boolean = true) {
    if (!enable) {
      // 模拟一个可能失败的调用
      if (Math.random() > 0.7) {
        throw new Error('Random failure');
      }
      return {
        message: 'Success without circuit breaker',
        timestamp: new Date(),
      };
    }

    try {
      const result = await this.circuitBreaker.execute(async () => {
        // 模拟一个可能失败的调用
        if (Math.random() > 0.7) {
          throw new Error('Random failure');
        }
        return { message: 'Success', timestamp: new Date() };
      });
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * 测试限流
   * @param clientId 客户端ID
   * @param enable 是否启用限流
   * @returns 测试结果
   */
  @Get('rate-limit')
  async rateLimitExample(
    @Query('clientId') clientId: string = 'default-client',
    @Query('enable') enable: boolean = true,
  ) {
    if (!enable) {
      // 模拟一些处理逻辑
      await new Promise((resolve) => setTimeout(resolve, 100));
      return {
        success: true,
        message: 'Request processed without rate limiter',
      };
    }

    try {
      const allowed = await this.rateLimiterService.checkRateLimit(
        clientId,
        this.exampleRateLimiterConfig,
      );

      if (!allowed) {
        return { success: false, message: 'Rate limit exceeded' };
      }

      // 获取限流信息
      const rateInfo = await this.rateLimiterService.getRateLimitInfo(
        clientId,
        this.exampleRateLimiterConfig,
      );

      return { success: true, message: 'Request allowed', rateInfo };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 测试降级
   * @param enable 是否启用降级
   * @returns 测试结果
   */
  @Get('fallback')
  async fallbackExample(@Query('enable') enable: boolean = true) {
    if (!enable) {
      // 模拟一个可能失败的调用
      if (Math.random() > 0.7) {
        throw new Error('Random failure in main function');
      }
      return {
        message: 'Main function success without fallback',
        timestamp: new Date(),
      };
    }

    return this.fallbackService.executeWithFallback(
      async () => {
        // 模拟一个可能失败的调用
        if (Math.random() > 0.7) {
          throw new Error('Random failure in main function');
        }
        return { message: 'Main function success', timestamp: new Date() };
      },
      {
        timeout: 3000,
        retryAttempts: 2,
        retryDelay: 1000,
        defaultResponse: { message: 'Default response due to failure' },
        fallbackFunction: async () => ({
          message: 'Fallback function response',
          timestamp: new Date(),
        }),
      },
    );
  }

  /**
   * 测试组合功能
   * @param clientId 客户端ID
   * @param enableCircuitBreaker 是否启用熔断器
   * @param enableRateLimiter 是否启用限流
   * @param enableFallback 是否启用降级
   * @returns 测试结果
   */
  @Get('combined')
  async combinedExample(
    @Query('clientId') clientId: string = 'combined-client',
    @Query('circuitBreaker') enableCircuitBreaker: boolean = false,
    @Query('rateLimiter') enableRateLimiter: boolean = false,
    @Query('fallback') enableFallback: boolean = false,
  ) {
    try {
      // 检查限流
      if (enableRateLimiter) {
        const allowed = await this.rateLimiterService.checkRateLimit(
          clientId,
          this.exampleRateLimiterConfig,
        );

        if (!allowed) {
          return { success: false, message: 'Rate limit exceeded' };
        }
      }

      // 使用熔断器和降级机制执行
      if (enableFallback) {
        return await this.fallbackService.executeWithFallback(
          async () => {
            if (enableCircuitBreaker) {
              return await this.circuitBreaker.execute(async () => {
                // 模拟一个可能失败的调用
                if (Math.random() > 0.7) {
                  throw new Error('Random failure in combined example');
                }

                // 发送Kafka事件
                await this.kafkaService.sendAuthEvent('COMBINED_EXAMPLE_EVENT', {
                  message: 'Combined example event',
                  timestamp: new Date(),
                });

                return {
                  message: 'Combined example success',
                  timestamp: new Date(),
                };
              });
            } else {
              // 模拟一个可能失败的调用
              if (Math.random() > 0.7) {
                throw new Error('Random failure in combined example');
              }

              // 发送Kafka事件
              await this.kafkaService.sendAuthEvent('COMBINED_EXAMPLE_EVENT', {
                message: 'Combined example event',
                timestamp: new Date(),
              });

              return {
                message: 'Combined example success without circuit breaker',
                timestamp: new Date(),
              };
            }
          },
          {
            timeout: 5000,
            retryAttempts: 2,
            retryDelay: 1000,
            circuitBreaker: enableCircuitBreaker,
            defaultResponse: {
              message: 'Default response in combined example',
            },
          },
        );
      } else {
        if (enableCircuitBreaker) {
          const result = await this.circuitBreaker.execute(async () => {
            // 模拟一个可能失败的调用
            if (Math.random() > 0.7) {
              throw new Error('Random failure in combined example');
            }

            // 发送Kafka事件
            await this.kafkaService.sendAuthEvent('COMBINED_EXAMPLE_EVENT', {
              message: 'Combined example event',
              timestamp: new Date(),
            });

            return {
              message: 'Combined example success',
              timestamp: new Date(),
            };
          });
          return result;
        } else {
          // 模拟一个可能失败的调用
          if (Math.random() > 0.7) {
            throw new Error('Random failure in combined example');
          }

          // 发送Kafka事件
          await this.kafkaService.sendAuthEvent('COMBINED_EXAMPLE_EVENT', {
            message: 'Combined example event',
            timestamp: new Date(),
          });

          return {
            message: 'Combined example success without circuit breaker',
            timestamp: new Date(),
          };
        }
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 处理业务逻辑
   * @param data 业务数据
   * @returns 处理结果
   */
  private async processBusinessLogic(_data: unknown): Promise<void> {
    // 模拟一些业务逻辑处理
    // 这里可以是数据库操作、外部API调用等
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, Math.random() * 2000); // 随机延迟
    });
  }
}
