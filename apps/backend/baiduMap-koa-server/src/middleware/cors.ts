import cors from '@koa/cors';

/**
 * CORS middleware using @koa/cors
 */
export default cors({
  origin: (ctx) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:7000',
    ];
    const origin = ctx.get('Origin');
    if (allowedOrigins.includes(origin)) {
      return origin;
    }
    return '';
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  maxAge: 86400, // 24 hours
  keepHeadersOnError: true
});
