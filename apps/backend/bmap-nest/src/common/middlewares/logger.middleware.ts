/**
 * @description 日志中间件
 */
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// 类
@Injectable() // @Injectable()告诉NestJS，这个类是可以依赖注入的服务
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);
  use(req: Request, res: Response, next: NextFunction) {
    this.logger.log('Request...', {
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      headers: req.headers,
    });
    this.logger.log(`LoggerMiddleware Request...[INFO] ${req.method} ${req.baseUrl}`);
    next();
    this.logger.log(`LoggerMiddleware Response...[INFO] ${req.method} ${req.baseUrl}`);
  }
}
