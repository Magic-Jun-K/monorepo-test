import type { Middleware } from 'koa';
import helmet from 'koa-helmet';
import compress from 'koa-compress';
import { constants } from 'node:zlib';

import type { AppContext, AppState } from '../shared/types';

/**
 * 安全中间件
 * @returns 安全中间件函数
 */
export function securityMiddleware(): Middleware<AppState, AppContext> {
  return helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      connectSrc: ["'self'"],
      upgradeInsecureRequests: [],
    },
  });
}

export function compressionMiddleware(): Middleware<AppState, AppContext> {
  return compress({
    threshold: 2048,
    gzip: {
      flush: constants.Z_SYNC_FLUSH,
    },
    deflate: {
      flush: constants.Z_SYNC_FLUSH,
    },
  });
}
