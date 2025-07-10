import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import * as argon2 from 'argon2';

import { AdminEntity } from '../../entities/admin.entity';
import { AuthUtils } from '../../common/utils/auth.utils';
import { TokenBlacklistService } from './token-backlist.service';
import { RedisService } from '../redis/redis.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  private readonly REFRESH_TOKEN_PREFIX = 'refresh_token:';
  private readonly ACCESS_TOKEN_PREFIX = 'access_token:';

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(AdminEntity)
    private readonly adminRepository: Repository<AdminEntity>,
    private readonly authUtils: AuthUtils,
    private readonly tokenBlacklistService: TokenBlacklistService,
    private readonly redisService: RedisService,
    private readonly mailService: MailService,
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
   * 生成Access Token
   * @param user
   * @returns
   */
  private async generateAccessToken(user: any): Promise<string> {
    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        username: user.username,
      },
      { expiresIn: '15m' },
    );

    // 将Access Token也存入Redis，用于快速验证和撤销
    await this.storeTokenInRedis(
      `${this.ACCESS_TOKEN_PREFIX}${user.id}`,
      accessToken,
      15 * 60, // 15 minutes expiration
    );

    return accessToken;
  }

  /**
   * 生成Refresh Token
   * @param user
   * @returns
   */
  private async generateRefreshToken(user: any): Promise<string> {
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        expiresIn: '7d',
        secret: process.env.JWT_REFRESH_SECRET,
      },
    );

    await this.storeTokenInRedis(
      `${this.REFRESH_TOKEN_PREFIX}${user.id}`,
      refreshToken,
      7 * 24 * 60 * 60, // 7 days expiration(7天过期)
    );

    return refreshToken;
  }

  /**
   * 存储Token到Redis
   * @param key
   * @param token
   * @param ttl
   * @returns
   */
  private async storeTokenInRedis(
    key: string,
    token: string,
    ttl: number,
  ): Promise<void> {
    await this.redisService.set(key, token, ttl);
  }

  /**
   * 生成Token对
   * @param user
   * @returns
   */
  private async generateTokenPair(user: any) {
    console.log('Generating token pair for user:', user);

    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(user),
      this.generateRefreshToken(user),
    ]);

    console.log('Generated accessToken:', accessToken);
    console.log('Generated refreshToken:', refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  // 新增设备指纹方法
  // private getDeviceFingerprint(req: Request): string {
  //   const userAgent = req.headers['user-agent'] || '';
  //   const ip = req.ip || '';
  //   return argon2
  //     .createHash('sha256')
  //     .update(`${userAgent}:${ip}`)
  //     .digest('hex');
  // }

  // private async generateTokenPair(user: any) {
  //   // 获取设备指纹
  //   // const deviceFingerprint = this.getDeviceFingerprint(req);

  //   const accessToken = this.jwtService.sign(
  //     {
  //       sub: user.id,
  //       username: user.username,
  //       // role: user.role,
  //       // device: deviceFingerprint, // 设备指纹
  //     },
  //     { expiresIn: '15m' }, // Access Token 15分钟过期
  //   );
  // }

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

    // const tokens = await this.generateTokenPair(user);
    const tokens = await this.generateTokenPair(admin);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
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

      // 从Redis获取存储的Refresh Token
      const storedToken = await this.redisService.get(
        `${this.REFRESH_TOKEN_PREFIX}${payload.sub}`,
      );

      // 检查Redis中存储的Refresh Token是否匹配
      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException('无效的Refresh Token');
      }

      // 获取用户信息
      const user = await this.adminRepository.findOne({
        where: { id: payload.sub },
        select: ['id', 'username'],
        // relations: ['user', 'user.roles'], // 如果需要角色信息，通过关联查询获取
      });
      console.log('测试refreshToken user', user);

      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      const accessToken = await this.generateAccessToken(user);

      return { access_token: accessToken };
    } catch (error) {
      console.error('刷新token失败:', error);
      throw new UnauthorizedException('无效的Refresh Token');
    }
  }

  // 验证Access Token
  async validateAccessToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);

      // 检查Redis中是否存在该Token
      const storedToken = await this.redisService.get(
        `${this.ACCESS_TOKEN_PREFIX}${payload.sub}`,
      );

      if (!storedToken || storedToken !== token) {
        throw new UnauthorizedException('Token已失效');
      }

      return payload;
    } catch (error) {
      console.log('验证Access Token失败:', error);
      throw new UnauthorizedException('无效的Token');
    }
  }

  /**
   * 退出登录
   * @returns
   */
  async logout(userId: number): Promise<any> {
    // 请注意，jwt token是无状态的，所以不需要做任何操作，没法将其置为失效
    // 但是可以在前端删除token，这样就达到了退出登录的目的
    // 如果要严格来做，有以下几种方案：
    // 1. cookie session 方案，后端存储session，前端存储session_id，退出登录时，后端删除session
    // 2. 双 token 方案，前端存储两个token，一个是access_token，一个是refresh_token，但这个方案依然是无状态的
    // 3. session + refresh_token 方案

    // 从Redis中删除Refresh Token和Access Token
    await Promise.all([
      this.redisService.del(`${this.REFRESH_TOKEN_PREFIX}${userId}`),
      this.redisService.del(`${this.ACCESS_TOKEN_PREFIX}${userId}`),
    ]);

    return true;
  }

  /**
   * 撤销token
   * @param token
   */
  async revokeRefreshToken(token: string) {
    // 添加到黑名单
    await this.tokenBlacklistService.addToBlacklist(token);

    // 同时从Redis删除
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      await this.redisService.del(`${this.REFRESH_TOKEN_PREFIX}${payload.sub}`);
    } catch (e) {
      console.warn('无法解析刷新令牌进行撤销', e);
    }
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
   * 发送验证码
   * @param email
   */
  async sendVerificationCode(email: string) {
    // 生成6位随机数
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // 缓存验证码到redis
    await this.redisService.set(`email_code:${email}`, code);
    // 发送邮件
    await this.mailService.sendMail(email, '验证码', `您的验证码是：${code}`);
  }

  /**
   * 验证验证码
   * @param email
   * @param code
   * @returns
   */
  async verifyEmailCodeAndLogin(email: string, code: string) {
    const storedCode = await this.redisService.get(`email_code:${email}`);
    if (!storedCode || storedCode !== code) {
      throw new BadRequestException('验证码错误或已过期');
    }

    let user = await this.adminRepository.findOne({ where: { email } });

    if (!user) {
      // 首次登录：自动注册
      const hashedPassword = await this.authUtils.hashPassword(
        this.generateRandomPassword(),
      );
      const username = this.generateUniqueUsername(email);
      user = this.adminRepository.create({
        email,
        password: hashedPassword,
        username,
      });
      await this.adminRepository.save(user);
    }

    const tokens = await this.generateTokenPair(user);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }

  /**
   * 生成唯一的用户名
   * @param email
   * @returns
   */
  private generateUniqueUsername(email: string): string {
    // 获取邮箱的前缀
    const base = email.split('@')[0];
    // 生成三位随机数
    const suffix = Math.floor(Math.random() * 1000);
    return `${base}${suffix}`;
  }

  /**
   * 生成随机密码
   * @returns
   */
  private generateRandomPassword(): string {
    return Math.random().toString(36).slice(-8); // 生成8位随机密码
  }
}
