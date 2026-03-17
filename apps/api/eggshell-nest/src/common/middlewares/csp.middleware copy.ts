import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';

export function strictCSP(req: Request, res: Response, next: NextFunction) {
  // 生成加密安全的nonce（全环境一致）
  const nonce = crypto.randomBytes(16).toString('base64');

  // 生产级CSP策略（开发/生产环境完全一致）
  const csp = [
    "default-src 'none';",
    "base-uri 'self';",
    `connect-src 'self' ${process.env.API_BASE_URL};`,
    "font-src 'self' https: data:;",
    "form-action 'self';",
    "frame-ancestors 'none';",
    `img-src 'self' data: ${process.env.IMAGE_CDN_URL};`,
    `script-src 'self' 'nonce-${nonce}' ${process.env.ANALYTICS_URL || ''};`,
    `style-src 'self' 'nonce-${nonce}';`,
    'upgrade-insecure-requests;',
    `report-uri ${process.env.CSP_REPORT_URI};`,
    'report-to csp-report;',
  ].join(' ');

  // 设置CSP头
  res.setHeader('Content-Security-Policy', csp);

  // 添加Report-To头（现代浏览器）
  res.setHeader(
    'Report-To',
    JSON.stringify({
      group: 'csp-report',
      max_age: 10886400,
      endpoints: [{ url: process.env.CSP_REPORT_URI }],
    }),
  );

  // 将nonce传递给前端
  res.locals.cspNonce = nonce;
  next();
}
