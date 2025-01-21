import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// 类
@Injectable() // @Injectable()告诉NestJS，这个类是可以依赖注入的服务
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request...', {
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      headers: req.headers
    });
    console.log(`LoggerMiddleware Request...[INFO] ${req.method} ${req.baseUrl}`);
    next();
    console.log(`LoggerMiddleware Response...[INFO] ${req.method} ${req.baseUrl}`);
  }
}
