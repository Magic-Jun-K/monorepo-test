/**
 * @description 路由处理的控制器（控制器层）
 */
import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

// 路由拦截
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  getHello(): string {
    return this.authService.getHello();
  }
}
