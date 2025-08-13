import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';

import { UserEntity } from '../../entities/user.entity';

import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  // 用户列表（带搜索、分页）
  async findAll(query: any) {
    const {
      page = 1,
      pageSize = 20,
      username,
      email,
      phone,
      searchType = 'fuzzy',
    } = query;
    const where: any = {};

    // 根据搜索类型决定使用精确搜索还是模糊搜索
    if (username) {
      where.username =
        searchType === 'exact' ? username : Like(`%${username}%`);
    }
    if (email) {
      where.email = searchType === 'exact' ? email : Like(`%${email}%`);
    }
    if (phone) {
      where.phone = searchType === 'exact' ? phone : Like(`%${phone}%`);
    }

    const [list, total] = await this.userRepo.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: Number(pageSize),
    });

    return { list, total };
  }

  // 新增用户
  async create(dto: CreateUserDto) {
    const user = this.userRepo.create({
      ...dto,
      userType: dto.userType || 'user', // 默认为普通用户
      isActive: dto.isActive !== undefined ? dto.isActive : true, // 默认激活
    });
    return this.userRepo.save(user);
  }

  // 导入用户（使用SheetJS/xlsx实现Excel文件解析）
  async importUsers(file: Express.Multer.File) {
    try {
      const XLSX = require('xlsx');

      // 读取Excel文件
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // 将Excel数据转换为JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // 处理导入的用户数据
      const users = [];
      const errors = [];

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];

        try {
          // 验证必要字段
          if (!row.username) {
            errors.push(`第${i + 2}行：用户名为必填项`);
            continue;
          }

          // 检查用户名是否已存在
          const existingUser = await this.userRepo.findOne({
            where: { username: row.username },
          });

          if (existingUser) {
            errors.push(`第${i + 2}行：用户名 ${row.username} 已存在`);
            continue;
          }

          // 创建用户对象
          const user = this.userRepo.create({
            username: row.username,
            email: row.email || null,
            phone: row.phone || null,
            userType: row.userType || 'user', // 默认为普通用户
            isActive: row.isActive !== undefined ? row.isActive : true, // 默认激活
          });

          users.push(user);
        } catch (error) {
          errors.push(`第${i + 2}行：${error.message}`);
        }
      }

      // 批量保存用户
      if (users.length > 0) {
        await this.userRepo.save(users);
      }

      return {
        success: true,
        message: `成功导入 ${users.length} 个用户`,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      return {
        success: false,
        message: '导入失败：' + error.message,
      };
    }
  }

  // 导出用户（使用SheetJS/xlsx实现Excel文件生成）
  async exportUsers(query: any, res: any) {
    try {
      const XLSX = require('xlsx');

      // 获取用户数据
      const { username, email, phone, searchType = 'fuzzy' } = query;
      const where: any = {};

      // 根据搜索类型决定使用精确搜索还是模糊搜索
      if (username) {
        where.username =
          searchType === 'exact' ? username : Like(`%${username}%`);
      }
      if (email) {
        where.email = searchType === 'exact' ? email : Like(`%${email}%`);
      }
      if (phone) {
        where.phone = searchType === 'exact' ? phone : Like(`%${phone}%`);
      }

      // 查询用户数据（导出时不分页，获取所有匹配数据）
      const users = await this.userRepo.find({
        where,
        select: [
          'id',
          'username',
          'email',
          'phone',
          'userType',
          'isActive',
          'createdAt',
          'updatedAt',
        ],
      });

      // 准备Excel数据
      const excelData = users.map((user) => ({
        ID: user.id,
        用户名: user.username,
        邮箱: user.email || '',
        手机号: user.phone || '',
        用户类型: user.userType,
        激活状态: user.isActive ? '是' : '否',
        创建时间: user.createdAt,
        更新时间: user.updatedAt,
      }));

      // 创建工作簿
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '用户数据');

      // 生成Excel文件
      const excelBuffer = XLSX.write(workbook, {
        type: 'buffer',
        bookType: 'xlsx',
      });

      // 设置响应头
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');
      res.setHeader('Content-Length', excelBuffer.length);

      // 发送文件
      res.send(excelBuffer);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '导出失败：' + error.message,
      });
    }
  }

  // 批量导出用户（根据ID列表）
  async batchExportUsers(ids: number[], res: any) {
    try {
      const XLSX = require('xlsx');

      // 根据ID列表查询用户
      const users = await this.userRepo.find({
        where: {
          id: In(ids),
        },
        select: ['id', 'username', 'email', 'phone', 'createdAt', 'updatedAt'],
      });

      // 准备Excel数据
      const excelData = users.map((user) => ({
        ID: user.id,
        用户名: user.username,
        邮箱: user.email || '',
        手机号: user.phone || '',
        创建时间: user.createdAt,
        更新时间: user.updatedAt,
      }));

      // 创建工作簿
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '用户数据');

      // 生成Excel文件
      const excelBuffer = XLSX.write(workbook, {
        type: 'buffer',
        bookType: 'xlsx',
      });

      // 设置响应头
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');
      res.setHeader('Content-Length', excelBuffer.length);

      // 发送文件
      res.send(excelBuffer);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '批量导出失败：' + error.message,
      });
    }
  }
}
