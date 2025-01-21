import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AdminService } from '../admin/admin.service';
import { AuthUtils } from '../../common/utils/auth.utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly adminService: AdminService,
    private readonly authUtils: AuthUtils,
  ) {}

  /**
   * 验证用户
   * @param username
   * @param password
   * @returns
   */
  async validateUser(username: string, password: string): Promise<any> {
    const admin = await this.adminService.validateUser(username, password);

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

  async login(user: any): Promise<any> {
    const payload = { username: user.username, sub: user.userId };
    console.log('测试auth service login payload', payload);
    console.log(
      '测试auth service login access_token',
      this.jwtService.sign(payload),
    );
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

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
