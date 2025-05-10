import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuthUtils } from '../../common/utils/auth.utils';
import { AdminEntity } from '../../entities/admin.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AdminEntity)
    private readonly adminRepository: Repository<AdminEntity>,
    private readonly authUtils: AuthUtils,
  ) {}

  /**
   * 用户注册
   * @param body
   * @returns
   */
  async register(body) {
    const adminIsExist = await this.adminRepository.findOne({
      where: { username: body.username },
    });
    if (adminIsExist) {
      throw new HttpException(
        { message: '用户已存在', error: 'user is existed' },
        400,
      );
    }
    // Hash password before saving(保存前对密码进行哈希)
    const hashedPassword = await this.authUtils.hashPassword(body.password);
    const admin = await this.adminRepository.create({
      ...body,
      password: hashedPassword,
    });
    await this.adminRepository.save(admin);
    return admin;
  }
}
