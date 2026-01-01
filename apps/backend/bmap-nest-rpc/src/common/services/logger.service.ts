import { LoggerService, Injectable, Scope, Optional, Inject } from '@nestjs/common';
import { Logger } from '@nestjs/common';

/**
 * 统一的Logger服务
 * 封装NestJS的Logger，提供标准的日志接口
 */
@Injectable({ scope: Scope.TRANSIENT })
export class AppLoggerService implements LoggerService {
  private logger: Logger;
  private context: string;

  constructor(@Optional() @Inject('CONTEXT') context?: string) {
    this.context = context || 'App';
    this.logger = new Logger(this.context);
  }

  /**
   * 设置日志上下文
   * @param context 上下文名称
   */
  setContext(context: string): void {
    this.context = context;
    this.logger = new Logger(context);
  }

  /**
   * 记录日志消息
   * @param message 日志消息
   * @param context 上下文（可选）
   */
  log(message: unknown, context?: string): void {
    this.logger.log(message, context || this.context);
  }

  /**
   * 记录错误消息
   * @param message 错误消息
   * @param trace 堆栈跟踪（可选）
   * @param context 上下文（可选）
   */
  error(message: unknown, trace?: string, context?: string): void {
    this.logger.error(message, trace, context || this.context);
  }

  /**
   * 记录警告消息
   * @param message 警告消息
   * @param context 上下文（可选）
   */
  warn(message: unknown, context?: string): void {
    this.logger.warn(message, context || this.context);
  }

  /**
   * 记录调试消息
   * @param message 调试消息
   * @param data 额外数据（可选）
   * @param context 上下文（可选）
   */
  debug(message: unknown, data?: Record<string, unknown>, context?: string): void {
    if (data && Object.keys(data).length > 0) {
      this.logger.debug(`${message} ${JSON.stringify(data)}`, context || this.context);
    } else {
      this.logger.debug(message, context || this.context);
    }
  }

  /**
   * 记录详细日志消息
   * @param message 详细消息
   * @param context 上下文（可选）
   */
  verbose(message: unknown, context?: string): void {
    this.logger.verbose(message, context || this.context);
  }

  /**
   * 格式化日志消息（支持颜色输出）
   * @param level 日志级别
   * @param message 消息内容
   * @param context 上下文
   * @param data 额外数据
   */
  formatLog(level: string, message: string, context?: string, data?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const ctx = context || this.context;
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    
    switch (level.toUpperCase()) {
      case 'ERROR':
        this.error(`${timestamp} [${ctx}] ${message}${dataStr}`);
        break;
      case 'WARN':
        this.warn(`${timestamp} [${ctx}] ${message}${dataStr}`);
        break;
      case 'DEBUG':
        this.debug(`${timestamp} [${ctx}] ${message}${dataStr}`);
        break;
      case 'VERBOSE':
        this.verbose(`${timestamp} [${ctx}] ${message}${dataStr}`);
        break;
      default:
        this.log(`${timestamp} [${ctx}] ${message}${dataStr}`);
    }
  }

  /**
   * 记录缓存操作日志
   * @param operation 操作类型
   * @param key 缓存键
   * @param data 额外数据
   */
  logCache(operation: string, key: string, data?: Record<string, unknown>): void {
    const colors: Record<string, string> = {
      SET: '\x1b[34m',    // 蓝色
      HIT: '\x1b[32m',    // 绿色
      MISS: '\x1b[33m',   // 黄色
      CLEAR: '\x1b[31m',  // 红色
      RESET: '\x1b[0m',
    };

    const color = colors[operation] || '\x1b[0m';
    const reset = colors.RESET;
    
    const logMessage = `${color}[Cache ${operation}]${reset} Key: ${key}`;
    
    this.debug(logMessage, {}, 'CacheService');
    if (data && Object.keys(data).length > 0) {
      this.debug('Cache data:', data);
    }
  }
}
