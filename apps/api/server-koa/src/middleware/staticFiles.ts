import type { Middleware } from 'koa';
import { createReadStream } from 'node:fs';
import { join, extname } from 'node:path';

import { config } from '../core/config';
import type { AppContext, AppState } from '../shared/types';

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
};

/**
 * 静态文件中间件
 * @returns 静态文件中间件函数
 */
export function staticFilesMiddleware(): Middleware<AppState, AppContext> {
  const root = join(process.cwd(), config.UPLOAD_DIR);

  return async (ctx, next) => {
    const path = ctx.path;

    if (path.startsWith('/public/') || path.startsWith('/uploads/')) {
      const filePath = join(root, path.replace(/^\/uploads\//, '').replace(/^\/public\//, ''));

      try {
        const stream = createReadStream(filePath);
        const ext = extname(filePath).toLowerCase();
        const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

        ctx.type = mimeType;
        ctx.set('Cache-Control', 'public, max-age=31536000');
        ctx.set('X-Content-Type-Options', 'nosniff');

        ctx.body = stream;
      } catch {
        await next();
      }
    } else {
      await next();
    }
  };
}
