import type { Middleware } from 'koa';
import { send } from '@koa/send';
import path from 'node:path';
import fs from 'node:fs/promises';

import logger from '../utils/logger.ts';

const fileExistsCache = new Map<string, boolean>(); // 缓存文件存在性检查
const CACHE_TTL = 60 * 60 * 1000; // 1h

const allowedOrigins = ['http://localhost:3000', 'http://localhost:7000'];

const normalizeUrl = (url: string | undefined) => {
  if (!url) return '';
  try {
    const parsedUrl = new URL(url);
    console.log('测试parsedUrl', parsedUrl);
    // return `${parsedUrl.protocol}//${parsedUrl.host}`;
    return parsedUrl.origin;
  } catch {
    return '';
  }
};

/**
 * 增强的静态文件中间件，具有更好的错误处理和缓存
 */
export default function staticFiles(): Middleware {
  return async (ctx, next) => {
    const filePath = ctx.path;
    // console.log('测试ctx:', ctx);
    console.log('测试ctx.headers:', ctx.headers);
    const fullPath = path.join('public/images', filePath);
    console.log('测试fullPath:', fullPath);

    const normalizedOrigin = normalizeUrl(ctx.get('Origin'));
    const normalizedReferer = normalizeUrl(ctx.get('Referer'));
    console.log('测试allowedOrigins.includes', allowedOrigins.includes(normalizedOrigin || normalizedReferer));

    if (allowedOrigins.includes(normalizedOrigin || normalizedReferer)) {
      try {
        // 先检查缓存
        const cachedExists = fileExistsCache.get(fullPath);
        console.log('测试cachedExists:', cachedExists);
        const fileExists =
          cachedExists ??
          (await fs
            .access(fullPath)
            .then(() => true)
            .catch(() => false));
        console.log('测试fileExists:', fileExists);

        // 更新缓存
        fileExistsCache.set(fullPath, fileExists);
        setTimeout(() => fileExistsCache.delete(fullPath), CACHE_TTL);

        if (!fileExists) {
          console.log('测试文件不存在');
          ctx.status = 404;
          return next();
        }

        await send(ctx, filePath, {
          root: path.resolve('public/images'),
          maxage: 86400000, // 24 hours
          immutable: true, // 将文件标记为不可变，以便浏览器缓存
          index: false,
          hidden: false,
          brotli: true, // 启用Brotli压缩
          gzip: true, // 启用Gzip压缩
          setHeaders: res => {
            res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
          }
        });
      } catch (err: unknown) {
        console.log('测试err', err);
        if (err instanceof Error) {
          logger.error('Static file serving error:', {
            error: err.message,
            stack: err.stack,
            url: ctx.url,
            method: ctx.method
          });

          // 处理特定的错误类型
          if (err.message.includes('ENOENT')) {
            ctx.status = 404;
          } else if (err.message.includes('EACCES')) {
            ctx.status = 403;
          } else {
            ctx.status = 500;
          }
        }

        // 继续下一个中间件
        return next();
      }
    }
  };
}

// 定期清除缓存
setInterval(() => {
  fileExistsCache.clear();
  logger.debug('Cleared static file cache');
}, CACHE_TTL * 2);
