import type { Middleware } from 'koa';

import { createLogger } from '../infrastructure/logger';
import type { AppContext, AppState } from '../shared/types';

const logger = createLogger('request-logger');

/**
 * 请求日志中间件
 * @returns 请求日志中间件函数
 */
export function requestLoggerMiddleware(): Middleware<AppState, AppContext> {
  return async (ctx, next) => {
    const start = Date.now();
    const requestId = crypto.randomUUID();

    ctx.set('X-Request-ID', requestId);
    ctx.set('X-Response-Time', '');

    logger.info('Incoming request', {
      requestId,
      method: ctx.method,
      path: ctx.path,
      query: ctx.query,
      ip: ctx.ip,
    });

    try {
      await next();
    } finally {
      const ms = Date.now() - start;
      ctx.set('X-Response-Time', `${ms}ms`);

      logger.info('Request completed', {
        requestId,
        method: ctx.method,
        path: ctx.path,
        status: ctx.status,
        duration: ms,
      });
    }
  };
}
