import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AdminEntity } from '../../../entities/admin.entity';
import { AuthUtils } from '../../../common/utils/auth.utils';
import { TokenBlacklistService } from './token-backlist.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(AdminEntity)
    private readonly adminRepository: Repository<AdminEntity>,
    private readonly authUtils: AuthUtils,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) {}

  /**
   * 验证用户
   * @param username
   * @param password
   * @returns
   */
  async validateUser(username: string /* , password: string */): Promise<any> {
    const admin = await this.adminRepository.findOne({
      where: { username },
      select: ['id', 'username', 'password' /* , 'roles' */],
    });

    if (admin) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = admin;
      return result;
    }
    return null;
  }

  /**
   * 验证密码是否正确
   * @param finalHashedPassword 数据库存储的哈希值
   * @param inputHashedPassword 前端传递的哈希值
   * @returns 是否验证成功
   */
  async verifyPassword(
    finalHashedPassword: string,
    inputHashedPassword: string,
  ): Promise<boolean> {
    return this.authUtils.verifyPassword(
      finalHashedPassword,
      inputHashedPassword,
    );
  }

  /**
   * 登录
   * @param user
   * @returns
   */
  async login(user: any, password: string): Promise<any> {
    // 首先验证密码
    const admin = await this.adminRepository.findOne({
      where: { username: user.username },
      select: ['id', 'username', 'password'],
    });

    if (!admin) {
      throw new UnauthorizedException('用户不存在');
    }

    // 验证密码
    const isPasswordValid = await this.verifyPassword(admin.password, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('密码错误');
    }

    const payload = {
      username: user.username,
      sub: user.id,
      role: user.role,
    };
    console.log('测试auth service login user', user);
    console.log(
      '测试auth service login access_token',
      this.jwtService.sign(payload),
    );
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(
        { sub: user.id },
        {
          expiresIn: '7d',
          secret: process.env.JWT_REFRESH_SECRET, // 使用独立密钥
        },
      ),
    };
  }

  /**
   * 刷新token
   * @param refreshToken
   * @returns
   */
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      return this.jwtService.sign({
        sub: payload.sub,
        email: payload.email,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * 撤销token
   * @param token
   */
  async revokeRefreshToken(token: string) {
    await this.tokenBlacklistService.addToBlacklist(token);
  }

  /**
   * 判断token是否被撤销
   * @param token
   * @returns
   */
  async isRefreshTokenRevoked(token: string) {
    return this.tokenBlacklistService.isBlacklisted(token);
  }

  /**
   * 退出登录
   * @returns
   */
  async logout(/* user: any */): Promise<any> {
    // 请注意，jwt token是无状态的，所以不需要做任何操作，没法将其置为失效
    // 但是可以在前端删除token，这样就达到了退出登录的目的
    // 如果要严格来做，有以下几种方案：
    // 1. cookie session 方案，后端存储session，前端存储session_id，退出登录时，后端删除session
    // 2. 双 token 方案，前端存储两个token，一个是access_token，一个是refresh_token，但这个方案依然是无状态的
    // 3. session + refresh_token 方案

    return true;
  }
}
