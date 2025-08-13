import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuthUtils } from '../../common/utils/auth.utils';
import { UserEntity } from '../../entities/user.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly authUtils: AuthUtils,
  ) {}

  /**
   * 用户注册
   * @param body
   * @returns
   */
  async register(body) {
    const userIsExist = await this.userRepository.findOne({
      where: { username: body.username },
    });
    if (userIsExist) {
      throw new HttpException(
        { message: '用户已存在', error: 'user is existed' },
        400,
      );
    }

    // 只在提供了手机号时才检查手机号
    if (body.phone) {
      // Check for existing phone number(检查是否存在手机号)
      const userByPhone = await this.userRepository.findOne({
        where: { phone: body.phone },
      });
      if (userByPhone) {
        throw new HttpException(
          {
            message: '手机号已被注册',
            error: 'phone number already registered',
          },
          400,
        );
      }
    }

    // 只在提供了邮箱时才检查邮箱
    if (body.email) {
      // Check for existing email(检查是否存在邮箱)
      const userByEmail = await this.userRepository.findOne({
        where: { email: body.email },
      });
      if (userByEmail) {
        throw new HttpException(
          { message: '邮箱已被注册', error: 'email already registered' },
          400,
        );
      }
    }

    // Hash password before saving(保存前对密码进行哈希)
    const hashedPassword = await this.authUtils.hashPassword(body.password);
    const user = await this.userRepository.create({
      ...body,
      password: hashedPassword,
      userType: 'user', // 设置用户类型为普通用户
      isActive: true, // 默认激活
    });
    await this.userRepository.save(user);
    return user;
  }
}
