import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
// import { Request } from 'express';

import { AdminEntity } from '../../entities/admin.entity';
import { RedisService } from '../redis/redis.service';
import { AppLoggerService } from '../../common/services/logger.service';

interface JwtPayload {
  sub: number;
  username: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    // private readonly adminService: AdminService
    @InjectRepository(AdminEntity)
    private readonly adminRepository: Repository<AdminEntity>,
    private readonly configService: ConfigService, // 注入配置服务
    private readonly redisService: RedisService,
    private readonly logger: AppLoggerService,
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
      secretOrKey: process.env.JWT_SECRET, // 密钥
      passReqToCallback: false, // 忽略请求对象
    });
    this.logger.setContext('JwtStrategy');
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

    const user = await this.adminRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    this.logger.debug(`JWT validate payload: ${JSON.stringify(payload)}`);
    this.logger.debug(`JWT validate user: ${JSON.stringify(user)}`);

    // 简化返回，避免暴露过多信息
    return { username: payload.username };
  }
}
