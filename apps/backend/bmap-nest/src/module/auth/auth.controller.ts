import {
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  UnauthorizedException,
  Body,
  Res,
  Req,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AdminEntity } from '../../entities/admin.entity';
import { AuthService } from './auth.service';
import { Public } from '@/common/decorators/public.decorator';
import { LoginDto } from './dto/login.dto';

// 路由拦截
@Controller('auth')
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
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    console.log('测试auth.controller.ts loginDto', loginDto);
    const result = await this.authService.login(
      loginDto.username,
      loginDto.password,
    );

    console.log('登录时生成的 refresh_token:', result.refresh_token);

    // 设置 httpOnly cookie
    response.cookie('refresh_token', result.refresh_token, {
      httpOnly: true, // 表示该 cookie 只能在服务器端访问，不能在客户端 JS 中访问
      secure: process.env.NODE_ENV === 'production', // 生产环境使用 HTTPS
      sameSite: 'strict', // 表示该 cookie 只允许在当前域名下访问，不允许在子域下访问
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
      // path: '/auth/refresh', // 只允许在刷新接口使用
      path: '/', // 修改为根路径，这样所有路径都能访问到这个cookie
    });

    return { data: result, message: '登录成功', success: true };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(@Request() req) {
    // 从 cookie 中获取 refresh_token
    const refreshToken = req.cookies.refresh_token;
    if (refreshToken) {
      await this.authService.revokeRefreshToken(refreshToken);
    }
    return { success: true };
  }

  /**
   * 刷新token
   * @param refreshToken
   * @returns
   */
  @Public()
  @Post('refresh')
  async refreshToken(
    @Req() req, // 使用 @Req() 装饰器获取请求对象
    @Res({ passthrough: true }) response: Response,
  ) {
    // 从cookie中获取refresh token
    const refreshToken = req.cookies.refresh_token;
    console.log('从cookie获取的refresh_token:', refreshToken);

    if (!refreshToken) {
      console.log('未找到刷新令牌，cookies:', req.cookies);
      throw new UnauthorizedException('未找到刷新令牌');
    }

    // 黑名单验证
    if (await this.authService.isRefreshTokenRevoked(refreshToken)) {
      throw new UnauthorizedException('令牌已失效');
    }

    console.log('🔄 后端正在刷新 Token...', new Date().toLocaleTimeString());

    try {
      // 验证 refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      console.log('验证后的payload:', payload);

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

      // 设置新的refresh token cookie
      response.cookie('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/', // 根路径
      });

      // 确保返回格式一致
      return {
        success: true,
        data: tokens.access_token,
      };
    } catch (error) {
      console.error('Token 刷新失败:', error);
      console.error('错误的refresh_token:', refreshToken);
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
  @Get('current-user')
  currentUser(@Request() req) {
    return { data: req.user };
  }

  // 测试登录后才可访问的接口，在需要的地方使用守卫，可保证必须携带token才能访问
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getProfile(@Request() req) {
    return req.user;
  }

  /**
   * 发送验证码
   * @param email
   * @returns
   */
  @Public()
  @Post('send-code')
  async sendVerificationCode(@Body('email') email: string) {
    console.log('发送验证码:', email);
    return await this.authService.sendVerificationCode(email);
  }

  /**
   * 验证验证码
   * @param email
   * @param code
   * @returns
   */
  @Public()
  @Post('email-login')
  async emailLogin(@Body() body: { email: string; code: string }) {
    const token = await this.authService.verifyEmailCodeAndLogin(
      body.email,
      body.code,
    );
    return { data: token, message: '登录成功', success: true };
  }
}
