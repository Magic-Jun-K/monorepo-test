import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, Between } from 'typeorm';
import { Response } from 'express';
import { read, utils, write } from 'xlsx';

import { UserEntity, UserStatus } from './entities/user.entity';
import { UserProfileEntity } from './entities/user-profile.entity';
import { UserOAuthEntity } from './entities/user-oauth.entity';
import { AuthUtils } from '../../common/utils/auth.utils';
import { FileService } from '../file/file.service';

import { CreateUserDto } from './dto/create-user.dto';
import { RoleService } from '../role/role.service';
import { AuthUser } from '../auth/types/user.interface';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto, SetPasswordDto } from './dto/change-password.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(UserProfileEntity)
    private readonly userProfileRepo: Repository<UserProfileEntity>,
    @InjectRepository(UserOAuthEntity)
    private readonly userOAuthRepo: Repository<UserOAuthEntity>,
    private readonly roleService: RoleService,
    private readonly authUtils: AuthUtils,
    private readonly fileService: FileService,
  ) {}

  /**
   * 获取用户角色
   * @param userId 用户ID
   * @returns 用户角色列表
   */
  private async getUserRoles(userId: number): Promise<Array<Record<string, unknown>>> {
    const query = `
      SELECT r.* 
      FROM role r
      INNER JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = $1
    `;
    return this.userRepo.manager.query(query, [userId]);
  }

  /**
   * 上传头像
   * @param userId 用户ID
   * @param file 上传的头像文件
   * @returns 头像存储路径
   */
  async uploadAvatar(userId: number, file: Express.Multer.File) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) throw new BadRequestException('用户不存在');

    // 上传文件
    const savedFile = await this.fileService.uploadFile(file);

    // 更新 Profile
    if (!user.profile) {
      user.profile = this.userProfileRepo.create({
        user: user,
      });
    }

    // 这里假设 fileService 返回的 path 可以直接访问，或者需要转换成 url
    // 简单起见，存储 path
    user.profile.avatar = savedFile.path;
    await this.userProfileRepo.save(user.profile);

    return savedFile.path;
  }

  /**
   * 获取登录方式（密码 + 第三方）
   * @param userId 用户ID
   * @returns 用户登录方式信息
   */
  async getAuthMethods(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['oAuths'],
    });

    if (!user) throw new BadRequestException('用户不存在');

    return {
      hasPassword: !!user.password,
      oAuths: user.oAuths.map((oauth) => ({
        id: oauth.id,
        provider: oauth.provider,
        nickname: oauth.nickname,
        avatar: oauth.avatar,
        createdAt: new Date(), // 暂时 mock
      })),
    };
  }

  /**
   * 解绑登录方式
   * @param userId 用户ID
   * @param provider 登录方式提供者（如 'google', 'github' 等）
   * @returns 解绑成功的确认信息
   */
  async unbindAuth(userId: number, provider: string) {
    // 检查是否只有一种登录方式 (如果有密码，则可以解绑所有第三方；如果没有密码，至少保留一个第三方)
    // 这里逻辑比较复杂，简单实现
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['oAuths'],
    });

    if (!user) throw new BadRequestException('用户不存在');

    const hasPassword = !!user.password;
    const oauthCount = user.oAuths.length;

    if (!hasPassword && oauthCount <= 1) {
      // 检查要解绑的是否是最后一个
      const target = user.oAuths.find((o) => o.provider === provider);
      if (target) {
        throw new BadRequestException('未设置密码且仅剩一种登录方式，无法解绑');
      }
    }

    await this.userOAuthRepo.delete({ user: { id: userId }, provider });
  }

  /**
   * 获取用户个人资料
   * @param userId 用户ID
   * @returns 用户个人资料
   */
  async getProfile(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['profile', 'oAuths', 'roles'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      roles: user.roles,
      profile: user.profile,
      hasPassword: !!user.password,
      oAuths:
        user.oAuths?.map((oauth) => ({
          id: oauth.id,
          provider: oauth.provider,
          providerId: oauth.openid,
          createdAt: oauth.createdAt,
        })) || [],
    };
  }

  /**
   * 更新用户个人资料
   * @param userId 用户ID
   * @param dto 更新个人资料DTO
   * @returns 更新后的用户个人资料
   */
  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    // 更新 UserEntity 字段
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.phone !== undefined) user.phone = dto.phone;

    // 更新 UserProfileEntity 字段
    if (user.profile) {
      if (dto.nickname !== undefined) user.profile.nickname = dto.nickname;
      if (dto.bio !== undefined) user.profile.bio = dto.bio;
      if (dto.avatar !== undefined) user.profile.avatar = dto.avatar;
    } else {
      // 如果没有 profile，创建新的
      // 注意：这里需要确保 UserProfileEntity 已被导入或使用 DeepPartial
      // 使用 any 绕过类型检查，实际运行时 TypeORM 会处理 cascade
      user.profile = {
        nickname: dto.nickname,
        bio: dto.bio,
        avatar: dto.avatar,
        user: user,
      } as unknown as UserProfileEntity;
    }

    await this.userRepo.save(user);
    return this.getProfile(userId);
  }

  /**
   * 修改密码
   * @param userId 用户ID
   * @param dto 修改密码DTO
   * @returns 修改密码结果
   */
  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'password'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.password) {
      throw new Error('User has no password set. Please use setPassword instead.');
    }

    // 验证旧密码
    const isValid = await this.authUtils.verifyPasswordHash(user.password, dto.oldPassword);
    if (!isValid) {
      throw new Error('Invalid old password');
    }

    // 哈希新密码
    const newPasswordHash = await this.authUtils.hashPassword(dto.newPassword);
    user.password = newPasswordHash;
    await this.userRepo.save(user);
    return { success: true };
  }

  /**
   * 设置初始密码
   * @param userId 用户ID
   * @param dto 设置密码DTO
   * @returns 设置密码结果
   */
  async setPassword(userId: number, dto: SetPasswordDto) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'password'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.password) {
      throw new Error('User already has a password. Please use changePassword instead.');
    }

    const newPasswordHash = await this.authUtils.hashPassword(dto.newPassword);
    user.password = newPasswordHash;
    await this.userRepo.save(user);
    return { success: true };
  }

  /**
   * 用户列表（带搜索、分页）
   * @param query 查询参数
   * @param currentUser 当前登录用户
   * @returns 用户列表和总数
   */
  async findAll(query: Record<string, unknown>, currentUser: AuthUser) {
    const {
      page = 1,
      pageSize = 20,
      username,
      email,
      phone,
      status,
      role: roleCode,
      createdAtRange,
      updatedAtRange,
    } = query;
    const where: Record<string, unknown> = {};

    // 权限控制：基于角色权限控制数据访问
    const currentUserRoles = await this.getUserRoles(currentUser.id);
    const hasSuperAdminRole = currentUserRoles.some(
      (userRole: Record<string, unknown>) => userRole.isSuperAdmin,
    );

    // 非超级管理员不能看到超级管理员用户
    if (!hasSuperAdminRole) {
      where.isSuperAdmin = false;
    }

    // 用户名、邮箱、手机号使用模糊搜索，状态使用精确搜索
    if (username) {
      where.username = Like(`%${username}%`);
    }
    if (email) {
      where.email = Like(`%${email}%`);
    }
    if (phone) {
      where.phone = Like(`%${phone}%`);
    }
    if (status) {
      where.status = status;
    }

    // 角色搜索
    if (roleCode) {
      const usersWithRole = await this.userRepo
        .createQueryBuilder('user')
        .leftJoin('user.roles', 'role')
        .where('role.code = :roleCode', { roleCode })
        .select('user.id')
        .getMany();

      if (usersWithRole.length > 0) {
        const userIds = usersWithRole.map((user) => user.id);
        where.id = In(userIds);
      } else {
        // 如果没有找到匹配角色的用户，返回空结果
        return { list: [], total: 0 };
      }
    }

    // 创建时间范围搜索
    if (createdAtRange && Array.isArray(createdAtRange) && createdAtRange.length === 2) {
      const [startDate, endDate] = createdAtRange;

      if (startDate && endDate) {
        // 处理时间字符串格式 YYYY-MM-DD HH:mm:ss
        let startDateTime: Date | null = null;
        let endDateTime: Date | null = null;

        if (typeof startDate === 'string') {
          // 处理 YYYY-MM-DD HH:mm:ss 格式
          if (startDate.includes(' ')) {
            const [datePart, timePart] = startDate.split(' ');
            const [year, month, day] = datePart.split('-').map(Number);
            const [hour, minute, second] = timePart.split(':').map(Number);
            startDateTime = new Date(year, month - 1, day, hour, minute, second);
          } else {
            // 处理 YYYY-MM-DD 格式
            startDateTime = new Date(startDate);
          }
        } else if (startDate instanceof Date) {
          startDateTime = startDate;
        }

        if (typeof endDate === 'string') {
          // 处理 YYYY-MM-DD HH:mm:ss 格式
          if (endDate.includes(' ')) {
            const [datePart, timePart] = endDate.split(' ');
            const [year, month, day] = datePart.split('-').map(Number);
            const [hour, minute, second] = timePart.split(':').map(Number);
            endDateTime = new Date(year, month - 1, day, hour, minute, second);
          } else {
            // 处理 YYYY-MM-DD 格式
            endDateTime = new Date(endDate);
          }
        } else if (endDate instanceof Date) {
          endDateTime = endDate;
        }

        if (
          startDateTime &&
          endDateTime &&
          !Number.isNaN(startDateTime.getTime()) &&
          !Number.isNaN(endDateTime.getTime())
        ) {
          // 只有当结束时间没有指定具体时间时（即只有日期部分），才设置为当天的23:59:59.999
          // 如果已经指定了具体时间，则使用指定的时间
          if (typeof endDate === 'string' && !endDate.includes(' ') && endDateTime) {
            endDateTime.setHours(23, 59, 59, 999);
          }
          where.createdAt = Between(startDateTime, endDateTime);
        }
      }
    }

    // 更新时间范围搜索
    if (updatedAtRange && Array.isArray(updatedAtRange) && updatedAtRange.length === 2) {
      const [startDate, endDate] = updatedAtRange;

      if (startDate && endDate) {
        // 处理时间字符串格式 YYYY-MM-DD HH:mm:ss
        let startDateTime: Date | null = null;
        let endDateTime: Date | null = null;

        if (typeof startDate === 'string') {
          // 处理 YYYY-MM-DD HH:mm:ss 格式
          if (startDate.includes(' ')) {
            const [datePart, timePart] = startDate.split(' ');
            const [year, month, day] = datePart.split('-').map(Number);
            const [hour, minute, second] = timePart.split(':').map(Number);
            startDateTime = new Date(year, month - 1, day, hour, minute, second);
          } else {
            // 处理 YYYY-MM-DD 格式
            startDateTime = new Date(startDate);
          }
        } else if (startDate instanceof Date) {
          startDateTime = startDate;
        }

        if (typeof endDate === 'string') {
          // 处理 YYYY-MM-DD HH:mm:ss 格式
          if (endDate.includes(' ')) {
            const [datePart, timePart] = endDate.split(' ');
            const [year, month, day] = datePart.split('-').map(Number);
            const [hour, minute, second] = timePart.split(':').map(Number);
            endDateTime = new Date(year, month - 1, day, hour, minute, second);
          } else {
            // 处理 YYYY-MM-DD 格式
            endDateTime = new Date(endDate);
          }
        } else if (endDate instanceof Date) {
          endDateTime = endDate;
        }

        if (
          startDateTime &&
          endDateTime &&
          !Number.isNaN(startDateTime.getTime()) &&
          !Number.isNaN(endDateTime.getTime())
        ) {
          // 只有当结束时间没有指定具体时间时（即只有日期部分），才设置为当天的23:59:59.999
          // 如果已经指定了具体时间，则使用指定的时间
          if (typeof endDate === 'string' && !endDate.includes(' ') && endDateTime) {
            endDateTime.setHours(23, 59, 59, 999);
          }
          where.updatedAt = Between(startDateTime, endDateTime);
        }
      }
    }

    const [list, total] = await this.userRepo.findAndCount({
      where,
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
      select: [
        'id',
        'username',
        'email',
        'phone',
        'status',
        'isSuperAdmin',
        'createdAt',
        'updatedAt',
      ],
    });

    // 处理角色数据，只返回必要信息
    const processedList = [];

    // 批量获取所有用户的角色信息
    const userIds = list.map((user) => user.id);
    const allUserRoles: Record<number, Array<Record<string, unknown>>> = {};

    if (userIds.length > 0) {
      // 构建批量查询用户角色的SQL
      const roleQuery = `
        SELECT ur.user_id, r.* 
        FROM role r
        INNER JOIN user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id IN (${userIds.map((_, index) => `$${index + 1}`).join(',')})
      `;
      const roleResults = await this.userRepo.manager.query(roleQuery, userIds);

      // 按用户ID分组角色数据
      for (const roleResult of roleResults) {
        const userId = roleResult.user_id;
        if (!allUserRoles[userId]) {
          allUserRoles[userId] = [];
        }
        allUserRoles[userId].push(roleResult);
      }
    }

    // 构建返回数据
    for (const user of list) {
      const userRoles = allUserRoles[user.id] || [];
      processedList.push({
        ...user,
        roles: userRoles.map((role) => ({
          id: role.id,
          name: role.name,
          code: role.code,
          level: role.level,
          isSuperAdmin: role.isSuperAdmin,
        })),
      });
    }

    return { list: processedList, total };
  }

  /**
   * 新增用户
   * @param dto 创建用户DTO
   * @returns 创建的用户实体
   */
  async create(dto: CreateUserDto) {
    // 检查用户名是否已存在
    if (dto.username) {
      const existingUser = await this.userRepo.findOne({
        where: { username: dto.username },
      });

      if (existingUser) {
        throw new Error('用户名已存在');
      }
    }

    // 检查邮箱是否已存在
    if (dto.email) {
      const existingEmail = await this.userRepo.findOne({
        where: { email: dto.email },
      });

      if (existingEmail) {
        throw new Error('邮箱已存在');
      }
    }

    // 检查手机号是否已存在
    if (dto.phone) {
      const existingPhone = await this.userRepo.findOne({
        where: { phone: dto.phone },
      });

      if (existingPhone) {
        throw new Error('手机号已存在');
      }
    }

    const user = this.userRepo.create({
      ...dto,
      status: (dto.status as UserStatus) || UserStatus.ACTIVE, // 默认为活跃状态
      isSuperAdmin: dto.isSuperAdmin || false, // 默认非超级管理员
    });

    const savedUser = (await this.userRepo.save(user)) as UserEntity;
    const userId = savedUser.id;

    // 如果指定了角色，为用户分配角色
    if (dto.roleIds && dto.roleIds.length > 0) {
      await this.roleService.batchAssignRolesToUser(userId, dto.roleIds);
    } else {
      // 默认分配普通用户角色
      try {
        const defaultRole = await this.roleService.getRoleByCode('USER');
        if (defaultRole) {
          await this.roleService.batchAssignRolesToUser(userId, [defaultRole.id]);
        }
      } catch {
        // 如果默认角色不存在，不分配角色，但不影响用户创建
        this.logger.log('默认角色不存在，跳过角色分配');
      }
    }

    // 获取用户角色信息
    const userRoles = await this.getUserRoles(userId);

    // 重新查询用户基本信息
    const userWithRoles = await this.userRepo.findOne({
      where: { id: userId },
    });

    // 优化角色数据返回
    return {
      ...userWithRoles,
      roles: userRoles.map((role) => ({
        id: role.id,
        name: role.name,
        code: role.code,
        level: role.level,
        isSuperAdmin: role.isSuperAdmin,
      })),
    };
  }

  /**
   * 导入用户（使用SheetJS/xlsx实现Excel文件解析）
   * @param file 上传的Excel文件
   * @returns 导入结果
   */
  async importUsers(file: Express.Multer.File) {
    try {
      // 读取Excel文件
      const workbook = read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // 将Excel数据转换为JSON
      const jsonData: Array<Record<string, unknown>> = utils.sheet_to_json(worksheet);

      // 处理导入的用户数据
      const users = [];
      const errors = [];

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i] as Record<string, string>;

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
            status: UserStatus.ACTIVE, // 默认活跃状态
            isSuperAdmin: false, // 默认非超级管理员
          });

          users.push(user);
        } catch (error: unknown) {
          errors.push(`第${i + 2}行：${error instanceof Error ? error.message : '未知错误'}`);
        }
      }

      // 批量保存用户
      if (users.length > 0) {
        const savedUsers = await this.userRepo.save(users);

        // 为新用户分配默认角色
        try {
          const defaultRole = await this.roleService.getRoleByCode('USER');

          if (defaultRole) {
            for (const user of savedUsers) {
              await this.roleService.batchAssignRolesToUser(user.id, [defaultRole.id]);
            }
          }
        } catch {
          // 如果默认角色不存在，不分配角色，但不影响用户导入
          this.logger.log('默认角色不存在，跳过角色分配');
        }
      }

      return {
        success: true,
        message: `成功导入 ${users.length} 个用户`,
        successCount: users.length,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: '导入失败：' + (error instanceof Error ? error.message : '未知错误'),
      };
    }
  }

  /**
   * 导出用户（使用SheetJS/xlsx实现Excel文件生成）
   * @param query 查询参数
   * @param res HTTP响应对象
   * @param currentUser 当前登录用户
   * @returns 导出的Excel文件
   */
  async exportUsers(query: Record<string, unknown>, res: Response, currentUser: AuthUser) {
    try {
      // 获取用户数据
      const { username, email, phone, status } = query;
      const where: Record<string, unknown> = {};

      // 权限控制：基于角色权限控制数据访问
      const currentUserRoles = await this.getUserRoles(currentUser.id);
      const hasSuperAdminRole = currentUserRoles.some(
        (role: Record<string, unknown>) => role.isSuperAdmin,
      );
      // const hasAdminRole = userRoles.some((role: Record<string, unknown>) => role.type === 'ADMIN');

      // 非超级管理员不能看到超级管理员用户
      if (!hasSuperAdminRole) {
        where.isSuperAdmin = false;
      }

      // 用户名、邮箱、手机号使用模糊搜索，状态使用精确搜索
      if (username) {
        where.username = Like(`%${username}%`);
      }
      if (email) {
        where.email = Like(`%${email}%`);
      }
      if (phone) {
        where.phone = Like(`%${phone}%`);
      }
      if (status) {
        where.status = status;
      }

      // 查询用户数据（导出时不分页，获取所有匹配数据）
      const users = await this.userRepo.find({
        where,
        select: [
          'id',
          'username',
          'email',
          'phone',
          'status',
          'isSuperAdmin',
          'createdAt',
          'updatedAt',
        ],
      });

      // 准备Excel数据
      const excelData = [];
      for (const user of users) {
        // 获取用户角色
        const userRoleList = await this.getUserRoles(user.id);
        // 优化角色数据结构
        const optimizedRoles = userRoleList.map((role: Record<string, unknown>) => ({
          id: role.id,
          name: role.name,
          code: role.code,
          level: role.level,
          isSuperAdmin: role.isSuperAdmin,
        }));

        excelData.push({
          ID: user.id,
          用户名: user.username,
          邮箱: user.email || '',
          手机号: user.phone || '',
          用户状态: user.status,
          超级管理员: user.isSuperAdmin ? '是' : '否',
          用户角色: optimizedRoles.map((role) => role.name).join(', '),
          创建时间: user.createdAt,
          更新时间: user.updatedAt,
        });
      }

      // 创建工作簿
      const worksheet = utils.json_to_sheet(excelData);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, '用户数据');

      // 生成Excel文件
      const excelBuffer = write(workbook, {
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
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        message: '导出失败：' + (error instanceof Error ? error.message : '未知错误'),
      });
    }
  }

  /**
   * 批量导出用户（根据ID列表）
   * @param ids 用户ID列表
   * @param res HTTP响应对象
   * @param currentUser 当前登录用户
   * @returns 导出的Excel文件
   */
  async batchExportUsers(ids: number[], res: Response, currentUser: AuthUser) {
    try {
      // 根据ID列表查询用户
      const where: Record<string, unknown> = { id: In(ids) };

      // 权限控制：基于角色权限控制数据访问
      const userRoles = await this.getUserRoles(currentUser.id);
      const hasSuperAdminRole = userRoles.some(
        (role: Record<string, unknown>) => role.isSuperAdmin,
      );
      // const hasAdminRole = userRoles.some((role: Record<string, unknown>) => role.type === 'ADMIN');

      // 非超级管理员不能看到超级管理员用户
      if (!hasSuperAdminRole) {
        where.isSuperAdmin = false;
      }

      const users = await this.userRepo.find({
        where,
        select: [
          'id',
          'username',
          'email',
          'phone',
          'status',
          'isSuperAdmin',
          'createdAt',
          'updatedAt',
        ],
      });

      // 准备Excel数据
      const excelData = [];
      for (const user of users) {
        // 获取用户角色
        const userRoleList = await this.getUserRoles(user.id);
        // 优化角色数据结构
        const optimizedRoles = userRoleList.map((role: Record<string, unknown>) => ({
          id: role.id,
          name: role.name,
          code: role.code,
          level: role.level,
          isSuperAdmin: role.isSuperAdmin,
        }));

        excelData.push({
          ID: user.id,
          用户名: user.username,
          邮箱: user.email || '',
          手机号: user.phone || '',
          用户状态: user.status,
          超级管理员: user.isSuperAdmin ? '是' : '否',
          用户角色: optimizedRoles.map((role) => role.name).join(', '),
          创建时间: user.createdAt,
          更新时间: user.updatedAt,
        });
      }

      // 创建工作簿
      const worksheet = utils.json_to_sheet(excelData);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, '用户数据');

      // 生成Excel文件
      const excelBuffer = write(workbook, {
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
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        message: '批量导出失败：' + (error instanceof Error ? error.message : '未知错误'),
      });
    }
  }

  /**
   * 更新用户
   * @param id 用户ID
   * @param updateUserDto 更新用户DTO
   * @returns 更新后的用户实体
   */
  async update(id: number, updateUserDto: Record<string, unknown>) {
    const user = await this.userRepo.findOne({
      where: { id },
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    // 更新用户基本信息
    Object.assign(user, updateUserDto);

    // 如果指定了角色，更新用户角色
    if (updateUserDto.roleIds && Array.isArray(updateUserDto.roleIds)) {
      await this.roleService.batchAssignRolesToUser(id, updateUserDto.roleIds);
    }

    const updatedUser = await this.userRepo.save(user);

    // 获取用户角色信息
    const userRoles = await this.getUserRoles(id);

    // 优化角色数据返回
    return {
      ...updatedUser,
      roles: userRoles.map((role) => ({
        id: role.id,
        name: role.name,
        code: role.code,
        level: role.level,
        isSuperAdmin: role.isSuperAdmin,
      })),
    };
  }

  /**
   * 删除用户
   * @param id 用户ID
   * @returns 删除成功的确认信息
   */
  async delete(id: number) {
    const user = await this.userRepo.findOne({
      where: { id },
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    // 不能删除超级管理员
    if (user.isSuperAdmin) {
      throw new Error('不能删除超级管理员');
    }

    await this.userRepo.remove(user);

    // 只返回必要的确认信息，而不是完整的用户数据
    return {
      id: user.id,
      username: user.username,
      message: '用户删除成功',
    };
  }

  /**
   * 设置用户为超级管理员
   * @param userId 用户ID
   * @param isSuperAdmin 是否设置为超级管理员
   * @returns 更新后的用户实体
   */
  async setSuperAdmin(userId: number, isSuperAdmin: boolean) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    user.isSuperAdmin = isSuperAdmin;
    return this.userRepo.save(user);
  }

  /**
   * 批量删除用户
   * @param ids 用户ID列表
   * @returns 删除成功的确认信息
   */
  async batchDelete(ids: number[]) {
    const users = await this.userRepo.find({
      where: { id: In(ids) },
    });

    // 过滤掉超级管理员
    const filteredUsers = users.filter((user) => !user.isSuperAdmin);
    const superAdminUsers = users.filter((user) => user.isSuperAdmin);

    if (filteredUsers.length === 0) {
      throw new Error('没有可删除的用户');
    }

    await this.userRepo.remove(filteredUsers);

    // 返回统计信息，而不是完整的用户数据
    return {
      deletedCount: filteredUsers.length,
      skippedCount: superAdminUsers.length,
      skippedReason: superAdminUsers.length > 0 ? '超级管理员不能删除' : null,
      message: `成功删除 ${filteredUsers.length} 个用户${superAdminUsers.length > 0 ? `，跳过 ${superAdminUsers.length} 个超级管理员` : ''}`,
    };
  }
}
