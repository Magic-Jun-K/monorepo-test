import type { Middleware } from 'koa';
import jwt from 'jsonwebtoken';

import { config } from '../core/config';
import { UnauthorizedError } from '../core/error/handler';
import { createLogger } from '../infrastructure/logger';
import type { AppContext, AppState } from '../shared/types';

const logger = createLogger('auth-middleware');

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * 生成访问令牌
 * @param payload JWT 有效载荷，不包含 iat 和 exp 字段
 * @returns 访问令牌字符串
 */
export function generateAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

/**
 * 生成刷新令牌
 * @param payload JWT 有效载荷，不包含 iat 和 exp 字段
 * @returns 刷新令牌字符串
 */
export function generateRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

/**
 * 验证访问令牌
 * @param token 访问令牌字符串
 * @returns JWT 有效载荷
 */
export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, config.JWT_SECRET) as JwtPayload;
}

/**
 * 验证刷新令牌
 * @param token 刷新令牌字符串
 * @returns JWT 有效载荷
 */
export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, config.JWT_REFRESH_SECRET) as JwtPayload;
}

/**
 * 认证中间件
 * @returns 认证中间件函数
 */
export function authMiddleware(): Middleware<AppState, AppContext> {
  return async (ctx, next) => {
    const authHeader = ctx.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7);

    try {
      const payload = verifyAccessToken(token);
      ctx.state.userId = payload.userId;
      ctx.state.userEmail = payload.email;
      await next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid token');
      }
      throw error;
    }
  };
}

/**
 * 可选认证中间件
 * @returns 可选认证中间件函数
 */
export function optionalAuthMiddleware(): Middleware<AppState, AppContext> {
  return async (ctx, next) => {
    const authHeader = ctx.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const payload = verifyAccessToken(token);
        ctx.state.userId = payload.userId;
        ctx.state.userEmail = payload.email;
      } catch {
        logger.debug('Invalid token provided for optional auth');
      }
    }

    await next();
  };
}

/**
 * 要求未认证用户中间件
 * @returns 要求未认证用户中间件函数
 */
export function requireGuestMiddleware(): Middleware<AppState, AppContext> {
  return async (ctx, next) => {
    const authHeader = ctx.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Already authenticated');
    }

    await next();
  };
}
