import { Injectable, NestMiddleware } from '@nestjs/common';

// 类
@Injectable() // @Injectable()告诉NestJS，这个类是可以依赖注入的服务
export class LoggerMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    console.log(`LoggerMiddleware Request...[INFO] ${req.method} ${req.baseUrl}`);
    next();
    console.log(`LoggerMiddleware Response...[INFO] ${req.method} ${req.baseUrl}`);
  }
}
