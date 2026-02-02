import { BadRequestException, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'node:crypto';

import { UserEntity, UserStatus, UserType } from '../../entities/user.entity';
import { UserOAuthEntity } from '../../entities/user-oauth.entity';
import { AuthUtils } from '../../common/utils/auth.utils';
import { TokenBlacklistService } from './token-backlist.service';
import { RedisService } from '../redis/redis.service';
import { VerificationCodeService } from './verification-code.service';
import { WeChatService } from './wechat.service';
import { AuthUser } from './types/user.interface';
import { RoleService } from '../role/role.service';

interface RoleQueryResult {
  id: number;
  name: string;
  code: string;
  type: string;
  level: number;
  isSuperAdmin: boolean;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly REFRESH_TOKEN_PREFIX = 'refresh_token:';
  private readonly ACCESS_TOKEN_PREFIX = 'access_token:';

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserOAuthEntity)
    private readonly userOAuthRepository: Repository<UserOAuthEntity>,
    private readonly authUtils: AuthUtils,
    private readonly tokenBlacklistService: TokenBlacklistService,
    private readonly redisService: RedisService,
    private readonly verificationCodeService: VerificationCodeService,
    private readonly roleService: RoleService,
    private readonly weChatService: WeChatService,
  ) {}

  /**
   * 根据标识符查找用户 (支持用户名、邮箱、手机号)
   * @param identifier
   * @returns
   */
  async findUserByIdentifier(identifier: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: [{ username: identifier }, { email: identifier }, { phone: identifier }],
      select: ['id', 'username', 'password', 'status', 'isSuperAdmin', 'email', 'phone'],
    });
  }

  /**
   * 验证用户
   * @param username
   * @param password
   * @returns
   */
  async validateUser(username: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findOne({
      where: { username },
      select: ['id', 'username', 'password', 'status', 'isSuperAdmin'],
    });

    if (user && user.status === UserStatus.ACTIVE) {
      // 检查用户是否有密码，如果没有密码说明是邮箱注册用户，不能使用账号密码登录
      if (!user.password) {
        throw new UnauthorizedException('该账户只能通过邮箱验证码登录');
      }
      return user;
    }
    return null;
  }

  /**
   * 验证密码哈希（新版加密方式）
   * @param databaseHash 数据库存储的argon2哈希
   * @param frontendHash 前端传来的scrypt哈希
   */
  async verifyPasswordHash(databaseHash: string, frontendHash: string): Promise<boolean> {
    return this.authUtils.verifyPasswordHash(databaseHash, frontendHash);
  }

  /**
   * 使用密码哈希注册用户
   * @param username 用户名
   * @param passwordHash 前端传来的scrypt哈希密码
   */
  async registerWithHash(
    username: string,
    passwordHash: string,
  ): Promise<{ success: boolean; message: string; user?: UserEntity }> {
    this.logger.log(`开始注册用户: ${username}`);

    // 检查用户名是否已存在
    const existingUser = await this.userRepository.findOne({
      where: { username },
    });

    if (existingUser) {
      return { success: false, message: '用户名已存在' };
    }

    // 将前端传来的scrypt哈希再进行argon2哈希存储
    const finalHash = await this.authUtils.hashPassword(passwordHash);

    // 创建新用户
    const newUser = this.userRepository.create({
      username,
      password: finalHash,
      userType: UserType.EXTERNAL,
      status: UserStatus.ACTIVE,
    });

    const savedUser = await this.userRepository.save(newUser);
    this.logger.log(`用户 ${username} 创建成功，ID: ${savedUser.id}`);

    // 分配默认角色
    await this.assignDefaultRole(savedUser.id);

    return { success: true, message: '注册成功', user: savedUser };
  }

  /**
   * 生成Access Token
   * @param user
   * @returns
   */
  private async generateAccessToken(user: AuthUser): Promise<string> {
    // 使用直接SQL查询获取用户角色，避免TypeORM关系操作
    const userRoles = await this.userRepository.manager.query(
      `SELECT r.id, r.name, r.code, r.type, r.level, r."isSuperAdmin" 
       FROM role r 
       INNER JOIN user_roles ur ON r.id = ur.role_id 
       WHERE ur.user_id = $1`,
      [user.id],
    );

    const roles = (userRoles as unknown as RoleQueryResult[]).map((role) => ({
      id: role.id,
      name: role.name,
      code: role.code,
      type: role.type,
      level: role.level,
      isSuperAdmin: role.isSuperAdmin,
    }));

    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        username: user.username,
        status: user.status,
        isSuperAdmin: user.isSuperAdmin,
        roles: roles,
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
  private async generateRefreshToken(user: AuthUser): Promise<string> {
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
  private async storeTokenInRedis(key: string, token: string, ttl: number): Promise<void> {
    await this.redisService.set(key, token, ttl);
  }

  /**
   * 生成Token对
   * @param user
   * @returns
   */
  private async generateTokenPair(user: AuthUser) {
    this.logger.log('Generating token pair for user:', user);

    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(user),
      this.generateRefreshToken(user),
    ]);

    this.logger.log('Generated accessToken:', accessToken);
    this.logger.log('Generated refreshToken:', refreshToken);

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
  async login(user: AuthUser): Promise<{ access_token: string; refresh_token: string }> {
    this.logger.log('login 登录用户:', user);

    const tokens = await this.generateTokenPair(user);

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
      const storedToken = await this.redisService.get(`${this.REFRESH_TOKEN_PREFIX}${payload.sub}`);

      // 检查Redis中存储的Refresh Token是否匹配
      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException('无效的Refresh Token');
      }

      // 获取用户信息
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
        select: ['id', 'username'],
      });
      this.logger.log('测试refreshToken user', user);

      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      const accessToken = await this.generateAccessToken(user);

      return { access_token: accessToken };
    } catch (error) {
      this.logger.error('刷新token失败:', error);
      throw new UnauthorizedException('无效的Refresh Token');
    }
  }

  // 验证Access Token
  async validateAccessToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);

      // 检查Redis中是否存在该Token
      const storedToken = await this.redisService.get(`${this.ACCESS_TOKEN_PREFIX}${payload.sub}`);

      if (!storedToken || storedToken !== token) {
        throw new UnauthorizedException('Token已失效');
      }

      return payload;
    } catch (error) {
      this.logger.log('验证Access Token失败:', error);
      throw new UnauthorizedException('无效的Token');
    }
  }

  /**
   * 退出登录
   * @returns
   */
  async logout(userId: number): Promise<boolean> {
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
      this.logger.warn('无法解析刷新令牌进行撤销', e);
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
    await this.verificationCodeService.sendCode(email, 'email');
  }

  /**
   * 手机验证码登录 (如果用户不存在则自动注册)
   * @param phone
   * @param code
   * @returns
   */
  async loginWithPhone(phone: string, code: string) {
    // 1. 验证验证码
    const isValid = await this.verificationCodeService.verifyCode(phone, code, 'sms');
    if (!isValid) {
      throw new BadRequestException('验证码错误或已过期');
    }

    // 2. 查找用户
    let user = await this.userRepository.findOne({
      where: { phone },
    });

    if (!user) {
      // 3. 首次登录：自动注册
      const username = this.generateUniqueUsername(phone);
      const newUser = this.userRepository.create({
        phone,
        password: null,
        username,
        userType: UserType.EXTERNAL,
        status: UserStatus.ACTIVE,
      });

      const savedUser = await this.userRepository.save(newUser);
      await this.assignDefaultRole(savedUser.id);

      user = await this.userRepository.findOne({
        where: { id: savedUser.id },
        relations: ['roles'],
      });
    }

    const tokens = await this.generateTokenPair(user);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }

  /**
   * 微信扫码登录
   * @param code 微信回调code
   */
  async loginWithWeChat(code: string) {
    // 1. 获取微信 access_token 和 openid
    const weChatToken = await this.weChatService.getAccessToken(code);

    // 2. 查找是否已绑定用户
    let userOAuth = await this.userOAuthRepository.findOne({
      where: {
        provider: 'wechat',
        openid: weChatToken.openid,
      },
      relations: ['user'],
    });

    let user: UserEntity;

    if (userOAuth) {
      // 已绑定，直接登录
      user = userOAuth.user;
    } else {
      // 3. 未绑定，获取用户信息并注册
      const weChatUserInfo = await this.weChatService.getUserInfo(
        weChatToken.access_token,
        weChatToken.openid,
      );

      // 创建新用户
      // 注意：这里可能需要处理 unionid 关联逻辑，如果同主体下有其他应用
      // 暂时简化为直接创建新用户

      const username = this.generateUniqueUsername(weChatUserInfo.nickname || 'wx_user');
      const newUser = this.userRepository.create({
        username,
        password: null,
        userType: UserType.EXTERNAL,
        status: UserStatus.ACTIVE,
        // 这里可以保存头像等信息，如果 UserEntity 有对应字段
      });

      const savedUser = await this.userRepository.save(newUser);
      await this.assignDefaultRole(savedUser.id);

      user = savedUser;

      // 创建 OAuth 关联
      const newOAuth = this.userOAuthRepository.create({
        provider: 'wechat',
        openid: weChatToken.openid,
        unionid: weChatToken.unionid,
        accessToken: weChatToken.access_token,
        refreshToken: weChatToken.refresh_token,
        expiresIn: weChatToken.expires_in,
        nickname: weChatUserInfo.nickname,
        avatar: weChatUserInfo.headimgurl,
        user: savedUser,
      });

      await this.userOAuthRepository.save(newOAuth);
    }

    // 重新查询以确保包含 roles
    user = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['roles'],
    });

    const tokens = await this.generateTokenPair(user);
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }

  /**
   * 为用户分配默认角色
   * @param userId
   */
  private async assignDefaultRole(userId: number) {
    try {
      const defaultRole = await this.roleService.getRoleByCode('USER');
      if (defaultRole) {
        await this.roleService.batchAssignRolesToUser(userId, [defaultRole.id]);
        this.logger.log(`✅ 为用户 ${userId} 分配默认USER角色成功`);
      } else {
        throw new Error('未找到默认USER角色');
      }
    } catch (error) {
      this.logger.error(`为用户 ${userId} 分配默认角色失败:`, error.message);
      // 这里不抛出异常，以免阻断登录流程，但记录错误
    }
  }

  /**
   * 邮箱验证码登录 (如果用户不存在则自动注册)
   * @param email
   * @param code
   * @returns
   */
  async loginWithEmail(email: string, code: string) {
    // 1. 验证验证码
    const isValid = await this.verificationCodeService.verifyCode(email, code, 'email');
    if (!isValid) {
      throw new BadRequestException('验证码错误或已过期');
    }

    // 2. 查找用户
    let user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      // 3. 首次登录：自动注册
      const username = this.generateUniqueUsername(email);
      const newUser = this.userRepository.create({
        email,
        password: null, // 邮箱注册的用户不设置密码，只能通过邮箱验证码登录
        username,
        userType: UserType.EXTERNAL,
        status: UserStatus.ACTIVE,
      });

      const savedUser = await this.userRepository.save(newUser);
      const userId = savedUser.id;

      // 为新注册的用户分配默认角色
      await this.assignDefaultRole(userId);

      // 重新查询用户以获取角色信息
      user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['roles'],
      });
    }

    const tokens = await this.generateTokenPair(user);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }

  /**
   * 生成唯一的用户名
   * @param prefix 前缀 (如邮箱前缀)
   * @returns
   */
  private generateUniqueUsername(prefix: string): string {
    // 获取前缀，过滤掉非字母数字字符
    const cleanPrefix = prefix.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
    // 生成随机后缀 (6位十六进制字符)
    const suffix = randomBytes(3).toString('hex');
    return `${cleanPrefix}_${suffix}`;
  }

  /**
   * 生成随机密码
   * @returns
   */
  private generateRandomPassword(): string {
    return Math.random().toString(36).slice(-8); // 生成8位随机密码
  }

  /**
   * 为邮箱注册用户设置密码
   * @param userId 用户ID
   * @param newPassword 新密码
   * @returns
   */
  async setPasswordForEmailUser(userId: number, newPassword: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'username', 'password', 'email'],
    });

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    // 只有邮箱注册的用户（没有密码）才能设置密码
    if (user.password !== null) {
      throw new BadRequestException('该账户已有密码，无法重复设置');
    }

    // 验证用户是否是通过邮箱注册的（有email字段）
    if (!user.email) {
      throw new BadRequestException('只有邮箱注册用户才能设置密码');
    }

    // 哈希新密码
    const hashedPassword = await this.authUtils.hashPassword(newPassword);

    // 更新用户密码
    user.password = hashedPassword;
    await this.userRepository.save(user);

    return true;
  }

  /**
   * 检查用户是否可以设置密码（邮箱注册且无密码）
   * @param userId 用户ID
   * @returns
   */
  async canUserSetPassword(userId: number): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'password', 'email'],
    });

    return user && user.email && user.password === null;
  }
}
