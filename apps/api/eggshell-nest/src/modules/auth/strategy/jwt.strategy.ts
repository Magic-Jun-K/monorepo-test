import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
// import { Request } from 'express';

import { UserEntity, UserStatus } from '../../user/entities/user.entity';
import { RedisService } from '../../redis/redis.service';

// 定义 JWT payload 的类型
interface JwtPayload {
  sub: number;
  roles?: string[];
  isSuperAdmin?: boolean;
  username?: string;
  // 可以根据实际需要添加更多字段
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    // private readonly adminService: AdminService
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly configService: ConfigService, // 注入配置服务
    private readonly redisService: RedisService,
  ) {
    super({
      // 自定义 token 提取方式（从Cookie中获取access_token）
      // jwtFromRequest: ExtractJwt.fromExtractors([
      //   (req: Request) => {
      //     let token = null;
      //     if (req && req.cookies) {
      //       token = req.cookies['access_token'];
      //     }
      //     return token;
      //   },
      // ]),
      // 从 Authorization 头获取 token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // 忽略过期时间
      secretOrKey: process.env.JWT_SECRET || configService.get('JWT_SECRET'), // 密钥
      passReqToCallback: false, // 忽略请求对象
    });
  }

  // 使用标准Passport流程
  /**
   * 验证用户
   * @param payload
   * @returns
   */
  async validate(payload: JwtPayload) {
    // 如果没有 payload 直接返回
    if (!payload || !payload.sub) return null;

    // 检查Redis中是否存在该Token
    const storedToken = await this.redisService.get(`access_token:${payload.sub}`);

    if (!storedToken) {
      throw new UnauthorizedException('Token已失效');
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('账户已被禁用');
    }

    // console.log('测试jwt validate payload', payload);
    // console.log('测试jwt validate user', user);

    // 返回包含用户类型和角色的完整用户信息
    const { password, ...userWithoutPassword } = user;
    this.logger.log('测试jwt validate password', password);
    // console.log('测试jwt validate payload.isSuperAdmin', payload.isSuperAdmin);
    // console.log('测试jwt validate user.isSuperAdmin', user.isSuperAdmin);

    // 将JWT payload中的角色信息合并到用户对象中
    const completeUser = {
      ...userWithoutPassword,
      roles: payload.roles || [], // 从JWT payload中获取角色信息
      isSuperAdmin: payload.isSuperAdmin !== undefined ? payload.isSuperAdmin : user.isSuperAdmin, // 优先使用JWT payload中的值，如果没有则使用数据库中的值
    };

    // console.log('测试jwt validate completeUser', completeUser);
    return completeUser;
  }
}
