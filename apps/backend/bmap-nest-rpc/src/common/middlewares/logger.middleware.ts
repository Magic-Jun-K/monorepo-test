/**
 * @description 日志中间件
 */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AppLoggerService } from '../services/logger.service';

// 类
@Injectable() // @Injectable()告诉NestJS，这个类是可以依赖注入的服务
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: AppLoggerService) {
    this.logger.setContext('LoggerMiddleware');
  }

  use(req: Request, res: Response, next: NextFunction) {
    this.logger.log(`Request: ${req.method} ${req.originalUrl}`);
    this.logger.debug('Request details', {
      body: req.body,
      headers: req.headers,
    });
    
    next();
    
    this.logger.log(`Response: ${req.method} ${req.baseUrl} - Status: ${res.statusCode}`);
  }
}
