import {
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  UnauthorizedException,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AdminEntity } from '../../../entities/admin.entity';
import { AuthService } from './auth.service';
import { Public } from '@/common/decorators/public.decorator';

// 路由拦截
@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(AdminEntity)
    private readonly adminRepository: Repository<AdminEntity>,
    private readonly jwtService: JwtService,
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
    // console.log('测试auth controller login req', req);
    const token = await this.authService.login(
      req.body.username,
      req.body.password,
    );

    return { data: token, message: '登录成功', success: true };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/auth/logout')
  // async logout() {
  //   return { success: await this.authService.logout() };
  // }
  async logout(@Request() req) {
    // 从请求头获取refreshToken（需前端传递）
    const refreshToken = req.body.refresh_token;
    await this.authService.revokeRefreshToken(refreshToken);
    return { success: true };
  }

  /**
   * 刷新token
   * @param refreshToken
   * @returns
   */
  @Public()
  @Post('auth/refresh')
  async refreshToken(@Body() body: { refresh_token: string }) {
    // 黑名单验证
    if (await this.authService.isRefreshTokenRevoked(body.refresh_token)) {
      throw new UnauthorizedException('令牌已失效');
    }

    console.log('🔄 后端正在刷新 Token...', new Date().toLocaleTimeString());

    try {
      // 验证 refresh token
      const payload = this.jwtService.verify(body.refresh_token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      // 检查用户是否存在
      const user = await this.adminRepository.findOne({
        where: { id: payload.sub },
        select: ['id', 'username'],
      });

      if (!user) throw new UnauthorizedException();

      const tokens = {
        access_token: this.jwtService.sign({
          sub: user.id,
          username: user.username,
        }),
        refresh_token: this.jwtService.sign(
          { sub: user.id },
          {
            // expiresIn: '7d',
            expiresIn: '6h',
            secret: process.env.JWT_REFRESH_SECRET,
          },
        ),
      };

      console.log('✅ 后端 Token 刷新成功！用户:', user.username);

      // 确保返回格式一致
      return {
        success: true,
        data: tokens,
      };
    } catch (error) {
      console.error('Token 刷新失败:', error);
      throw new UnauthorizedException('刷新令牌无效');
    }
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
