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
    console.log("测试是否进入111 - All Headers:", ctx.headers)

    const origin = ctx.get('Origin');
    console.log("测试是否进入222", origin)

    if (allowedOrigins.includes(origin)) {
      console.log("测试是否进入333")
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
