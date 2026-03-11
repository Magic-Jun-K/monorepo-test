import Koa from 'koa';

import type { AppState, AppContext } from '../shared/types';
import { errorHandler } from '../core/error/handler';
import { validatorMiddleware } from '../core/validator';
import { corsMiddleware } from '../middleware/cors';
import { securityMiddleware, compressionMiddleware } from '../middleware/security';
import { rateLimitMiddleware } from '../middleware/rateLimit';
import { staticFilesMiddleware } from '../middleware/staticFiles';
import { bodyParserMiddleware } from '../middleware/bodyParser';
import { requestLoggerMiddleware } from '../middleware/requestLogger';
import { database } from '../infrastructure/database';
import { cache } from '../infrastructure/cache';
import { config } from '../core/config';
import { logger } from '../infrastructure/logger';
import authRouter from '../modules/auth/router';
import userRouter from '../modules/user/router';

export class App {
  private app: Koa<AppState, AppContext>;

  constructor() {
    this.app = new Koa<AppState, AppContext>();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandlers();
  }

  /**
   * 设置中间件
   */
  private setupMiddlewares() {
    this.app.use(requestLoggerMiddleware());
    this.app.use(securityMiddleware());
    this.app.use(compressionMiddleware());
    this.app.use(errorHandler());
    this.app.use(corsMiddleware());
    this.app.use(validatorMiddleware());
    this.app.use(bodyParserMiddleware());
    this.app.use(rateLimitMiddleware());
    this.app.use(staticFilesMiddleware());
  }

  /**
   * 设置路由
   */
  private setupRoutes() {
    this.app.use(authRouter.routes()).use(authRouter.allowedMethods());
    this.app.use(userRouter.routes()).use(userRouter.allowedMethods());

    this.app.use(async (ctx) => {
      if (!ctx.body) {
        ctx.status = 404;
        ctx.body = {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Route ${ctx.method} ${ctx.path} not found`,
          },
        };
      }
    });
  }

  /**
   * 设置错误处理程序
   */
  private setupErrorHandlers() {
    this.app.on('error', (err, ctx) => {
      logger.error('Server error', {
        error: err.message,
        stack: err.stack,
        path: ctx.path,
        method: ctx.method,
      });
    });

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled rejection', { reason: String(reason) });
    });

    process.on('uncaughtException', (err) => {
      logger.error('Uncaught exception', { error: err.message, stack: err.stack });
      process.exit(1);
    });
  }

  /**
   * 获取Koa应用实例
   */
  getApp() {
    return this.app;
  }

  /**
   * 初始化应用程序
   */
  async init() {
    await database.connect();
    await cache.connect();
    logger.info('Infrastructure connected');
  }

  /**
   * 启动应用程序
   */
  async start() {
    await this.init();

    this.app.listen(config.PORT, () => {
      logger.info(`Server running on port ${config.PORT}`, {
        env: config.NODE_ENV,
        nodeVersion: process.version,
      });
    });
  }

  /**
   * 停止应用程序
   */
  async stop() {
    await database.disconnect();
    await cache.disconnect();
    logger.info('Server stopped');
  }
}

export const app = new App();
