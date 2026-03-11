import type { Middleware } from 'koa';
import cors from '@koa/cors';

import { config } from '../core/config';
import type { AppContext, AppState } from '../shared/types';

/**
 * CORS 中间件
 * @returns CORS 中间件函数
 */
export function corsMiddleware(): Middleware<AppState, AppContext> {
  return cors({
    origin: config.CORS_ORIGIN,
    credentials: config.CORS_CREDENTIALS,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'X-CSRF-Token'],
    exposeHeaders: ['Content-Length', 'X-Request-ID'],
    maxAge: 86400,
  });
}
