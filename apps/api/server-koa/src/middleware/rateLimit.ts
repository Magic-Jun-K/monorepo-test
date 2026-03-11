import type { Middleware } from 'koa';

import { config } from '../core/config';
import type { AppContext, AppState } from '../shared/types';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * 限流中间件
 * @returns 限流中间件函数
 */
export function rateLimitMiddleware(): Middleware<AppState, AppContext> {
  return async (ctx, next) => {
    const key = ctx.ip || 'unknown';
    const now = Date.now();
    const windowMs = config.RATE_LIMIT_WINDOW;
    const max = config.RATE_LIMIT_MAX;

    if (process.env.NODE_ENV === 'test') {
      await next();
      return;
    }

    let record = store[key];

    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + windowMs,
      };
      store[key] = record;
    }

    record.count++;

    if (record.count > max) {
      ctx.status = 429;
      ctx.body = {
        success: false,
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: 'Too many requests from this IP, please try again later.',
        },
      };
      return;
    }

    ctx.set('X-RateLimit-Limit', String(max));
    ctx.set('X-RateLimit-Remaining', String(max - record.count));
    ctx.set('X-RateLimit-Reset', String(Math.ceil(record.resetTime / 1000)));

    await next();
  };
}
