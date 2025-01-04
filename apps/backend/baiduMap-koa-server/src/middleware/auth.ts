import type { AppContext } from '../types/index.js';

/**
 * 认证中间件
 * 检查请求中的身份验证令牌
 */
const authenticate = async (ctx: AppContext, next: () => Promise<void>) => {
  const token = ctx.headers['authorization'];

  if (!token) {
    ctx.status = 401; // Unauthorized
    ctx.body = { message: 'Authentication token is missing' };
    return;
  }

  // Here you would normally verify the token (e.g., using JWT)
  // For demonstration, we'll assume the token is valid if it's not empty
  ctx.state.user = { 
    id: 'user_id',
    roles: ['user'] // Add roles to match AppState type
  };

  await next(); // Proceed to the next middleware
};

export default { authenticate };
