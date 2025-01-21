import { Body, Controller, Post } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * 用户注册
   * @param username 用户名
   * @param password 前端传递的哈希值
   * @returns 注册结果
   */
  @Post('register')
  async register(@Body() body) {
    console.log('测试register body', body);

    // 保存用户信息到数据库
    await this.adminService.register(body);

    return { message: '注册成功', success: true };
  }
}
