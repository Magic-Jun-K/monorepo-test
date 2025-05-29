/**
 * @description 路由处理的控制器（控制器层）
 */
import { Controller } from '@nestjs/common';

// import { AppService } from './app.service';

// 路由拦截
@Controller()
export class AppController {
  constructor(
    // private readonly appService: AppService,
  ) {}

  // @Get()
  // getHello(): string {
  //   return this.appService.getHello();
  // }
}
