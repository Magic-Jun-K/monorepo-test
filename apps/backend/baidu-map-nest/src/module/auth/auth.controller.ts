import {
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminEntity } from '../../entities/admin.entity';

import { AuthService } from './auth.service';

// 路由拦截
@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(AdminEntity)
    private readonly adminRepository: Repository<AdminEntity>,
  ) {}

  /**
   * 用户登录
   * @param username 用户名
   * @param password 前端传递的哈希值
   * @returns 登录结果
   */
  @UseGuards(AuthGuard('local'))
  @Post('/auth/login')
  async login(@Request() req) {
    // 从数据库获取用户信息
    const user = await this.adminRepository.findOne({
      where: { username: req.user.username },
    });

    if (!user) {
      throw new UnauthorizedException({
        message: '用户认证失败',
        detail: '无效的用户凭证',
      });
    }

    const token = await this.authService.login(req.user);

    return { data: token, message: '登录成功', success: true };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/auth/logout')
  async logout() {
    return { success: await this.authService.logout() };
  }

  /**
   * 获取用户信息
   * @param req
   * @returns
   */
  // 测试登录后才可访问的接口，在需要的地方使用守卫，可保证必须携带token才能访问
  @UseGuards(AuthGuard('jwt'))
  @Get('currentUser')
  currentUser(@Request() req) {
    return { data: req.user };
  }

  // 测试登录后才可访问的接口，在需要的地方使用守卫，可保证必须携带token才能访问
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getProfile(@Request() req) {
    return req.user;
  }
}
