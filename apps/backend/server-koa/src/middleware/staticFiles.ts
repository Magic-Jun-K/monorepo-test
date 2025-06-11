import type { Middleware } from 'koa';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';

import logger from '../utils/logger.ts';

const fileExistsCache = new Map<string, boolean>(); // 缓存文件存在性检查
const CACHE_TTL = 60 * 60 * 1000; // 1h

const allowedOrigins = ['http://localhost:3000', 'http://localhost:7000'];

/**
 * 规范化 URL，提取 origin
 */
const normalizeUrl = (url: string | undefined) => {
  if (!url) return '';
  try {
    const parsedUrl = new URL(url);
    console.log('测试parsedUrl:', parsedUrl);
    return parsedUrl.origin; // 返回协议 + 域名 + 端口
  } catch {
    return '';
  }
};

/**
 * 增强的静态文件中间件，具有更好的错误处理和缓存
 */
export default function staticFiles(): Middleware {
  return async ctx => {
    const filePath = ctx.path;
    const fullPath = path.join('public/images', filePath);

    console.log('测试ctx.header：', ctx.header);

    // 检查来源是否允许
    const origin = normalizeUrl(ctx.get('Origin'));
    const referer = normalizeUrl(ctx.get('Referer'));
    console.log('origin: ', origin, ' referer: ', referer);
    console.log('测试if判断: ', allowedOrigins.includes(origin || referer));
    if (!allowedOrigins.includes(origin || referer)) {
      ctx.status = 403; // 禁止访问
      ctx.body = 'Forbidden: Invalid origin or referer';
      return;
    }

    try {
      // 检查文件是否存在（优先使用缓存）
      let fileExists = fileExistsCache.get(fullPath);
      if (fileExists === undefined) {
        fileExists = await stat(fullPath)
          .then(stats => stats.isFile()) // 检查是否是文件
          .catch(() => false); // 文件不存在或无法访问
        fileExistsCache.set(fullPath, fileExists); // 更新缓存
        setTimeout(() => fileExistsCache.delete(fullPath), CACHE_TTL); // 设置缓存过期时间
      }

      if (!fileExists) {
        ctx.status = 404; // 文件不存在
        ctx.body = 'File not found';
        return;
      }

      // 设置响应头
      ctx.set('Cache-Control', 'public, max-age=86400, immutable'); // 缓存 24 小时
      ctx.type = path.extname(filePath).slice(1) || 'png'; // 根据文件扩展名设置 MIME 类型

      // 使用流式传输发送文件
      ctx.body = createReadStream(fullPath);
    } catch (err: unknown) {
      // 捕获并记录错误
      if (err instanceof Error) {
        logger.error('Static file serving error:', {
          error: err.message,
          stack: err.stack,
          url: ctx.url,
          method: ctx.method
        });

        // 根据错误类型设置状态码
        if (err.message.includes('ENOENT')) {
          ctx.status = 404; // 文件不存在
        } else if (err.message.includes('EACCES')) {
          ctx.status = 403; // 无权限访问
        } else {
          ctx.status = 500; // 服务器内部错误
        }
      } else {
        ctx.status = 500; // 未知错误
      }

      ctx.body = 'Internal server error';
    }
  };
}

// 定期清除缓存
setInterval(() => {
  fileExistsCache.clear();
  logger.debug('Cleared static file cache');
}, CACHE_TTL * 2);
