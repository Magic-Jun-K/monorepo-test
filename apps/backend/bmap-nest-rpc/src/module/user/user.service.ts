import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Response } from 'express';

import { UserEntity } from '../../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  // 用户列表（带搜索、分页）
  async findAll(query: Record<string, unknown>) {
    const { page = 1, pageSize = 20, username, email, phone } = query;
    const where: Record<string, unknown> = {};
    if (username) where.username = Like(`%${username as string}%`);
    if (email) where.email = Like(`%${email as string}%`);
    if (phone) where.phone = Like(`%${phone as string}%`);
    const [list, total] = await this.userRepo.findAndCount({
      where,
      skip: (page as number - 1) * (pageSize as number),
      take: Number(pageSize),
    });
    return { list, total };
  }

  // 新增用户
  async create(dto: CreateUserDto) {
    const user = this.userRepo.create(dto);
    return this.userRepo.save(user);
  }

  // 导入用户（伪实现，需结合 exceljs/csv-parse 实现文件解析）
  async importUsers(_file: Express.Multer.File) {
    // 解析 file.buffer，批量插入用户
    // 这里只返回示例
    // 可以使用logger替代console.log
    return { success: true, message: '导入成功（请实现文件解析逻辑）' };
  }

  // 导出用户（伪实现，需结合 exceljs 实现文件生成）
  async exportUsers(query: Record<string, unknown>, res: Response) {
    // 查询用户，生成 Excel/CSV，写入 res
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');
    // 这里应写入文件流
    res.end('请实现导出逻辑');
  }
}
