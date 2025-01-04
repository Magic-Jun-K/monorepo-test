import { Context, Next } from 'koa';

/**
 * CORS middleware for Koa
 */
export default function cors() {
  return async (ctx: Context, next: Next) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:7000',
    ];

    const origin = ctx.get('Origin');
    if (allowedOrigins.includes(origin)) {
      ctx.set('Access-Control-Allow-Origin', origin);
      ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
      ctx.set('Access-Control-Allow-Credentials', 'true');
      ctx.set('Cross-Origin-Resource-Policy', 'cross-origin');
      
      if (ctx.method === 'OPTIONS') {
        ctx.status = 204;
        return;
      }
    }

    await next();
  };
}
