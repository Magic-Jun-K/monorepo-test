import type { AppContext, AppError } from '../types/index.ts';
import logger from '../utils/logger.ts';

/**
 * 错误处理中间件
 * 统一处理应用中的错误
 */
async function errorHandler(ctx: AppContext, next: () => Promise<void>) {
  try {
    await next();
  } catch (err: unknown) {
    const error = err as AppError;
    
    // 记录错误日志
    logger.error('Application error:', {
      error: error.message,
      stack: error.stack,
      url: ctx.url,
      method: ctx.method,
      body: ctx.request.body,
      headers: ctx.headers
    });

    // 设置状态码
    ctx.status = error.statusCode || 500;

    // 构造错误响应
    const response: {
      success: boolean;
      error: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
      };
      stack?: string;
    } = {
      success: false,
      error: {
        code: error.code || 'INTERNAL_SERVER_ERROR',
        message: process.env.NODE_ENV === 'production' ? 'An internal server error occurred' : error.message,
        details: error.details
      }
    };

    // 在开发环境下添加错误堆栈
    if (process.env.NODE_ENV === 'development' && error.stack) {
      response.stack = error.stack;
    }

    // 设置响应体
    ctx.body = response;

    // 触发应用级错误事件
    ctx.app.emit('error', error, ctx);
  }
}

export default errorHandler;
