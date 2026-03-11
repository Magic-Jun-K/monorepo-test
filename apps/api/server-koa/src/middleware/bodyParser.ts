import type { Middleware } from 'koa';
import bodyParser from 'koa-bodyparser';

import type { AppContext, AppState } from '../shared/types';

/**
 * 解析请求体中间件
 * @returns 解析请求体中间件函数
 */
export function bodyParserMiddleware(): Middleware<AppState, AppContext> {
  return bodyParser({
    enableTypes: ['json', 'form', 'text'],
    jsonLimit: '10mb',
    formLimit: '10mb',
    textLimit: '10mb',
    strict: true,
    onerror: (err, ctx) => {
      ctx.throw(400, 'Invalid request body');
    },
  });
}
