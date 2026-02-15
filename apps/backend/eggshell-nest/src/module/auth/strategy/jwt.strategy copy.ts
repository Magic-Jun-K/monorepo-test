// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { ConfigService } from '@nestjs/config';

// import { AdminEntity } from '../../entities/admin.entity';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(
//     // private readonly adminService: AdminService
//     @InjectRepository(AdminEntity)
//     private readonly adminRepository: Repository<AdminEntity>,
//     private readonly configService: ConfigService, // 注入配置服务
//   ) {
//     super({
//       // jwtFromRequest: ExtractJwt.fromHeader('token'),
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // 从Authorization头部提取Bearer token
//       ignoreExpiration: false, // 不忽略过期时间
//       secretOrKey: configService.get('JWT_SECRET'), // 使用配置服务获取
//       algorithms: ['HS256'], // 明确指定允许的算法
//     });
//   }

//   // async validate(payload: any) {
//   //   const user = await this.adminService.validateUser(
//   //     payload.username,
//   //     payload.password,
//   //   );
//   //   return user;
//   // }

//   // 使用标准Passport流程
//   /**
//    * 验证用户
//    * @param payload
//    * @returns
//    */
//   async validate(payload: any) {
//     const user = await this.adminRepository.findOne({
//       where: { id: payload.sub },
//     });
//     if (!user) throw new UnauthorizedException();
//     return user;
//   }
// }
