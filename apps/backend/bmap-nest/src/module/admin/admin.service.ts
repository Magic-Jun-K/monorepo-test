import { HttpException, Injectable, BadRequestException, Logger } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuthUtils } from '../../common/utils/auth.utils';
import { UserEntity, UserType, UserStatus } from '../../entities/user.entity';
import { PermissionService } from './permission.service';
import { RequestType } from '../../entities/permission-request.entity';
import { AuditAction } from '../../entities/audit-log.entity';
import { RoleService } from '../role/role.service';

declare const process: {
  env: Record<string, string | undefined>;
};

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly authUtils: AuthUtils,
    private readonly permissionService: PermissionService,
    private readonly roleService: RoleService,
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
      throw new HttpException({ message: '用户已存在', error: 'user is existed' }, 400);
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

    // 先RSA解密密码，再进行哈希处理
    const decryptedPassword = await this.authUtils.decryptRSA(body.password);

    // let decryptedPassword: string;

    // // 在开发环境中，如果密码不是JWE格式，直接使用明文
    // if (
    //   process.env.NODE_ENV === 'development' &&
    //   (!body.password.includes('.') || body.password.length <= 100)
    // ) {
    //   console.log('开发环境检测到明文密码，跳过RSA解密');
    //   decryptedPassword = body.password;
    // } else {
    //   decryptedPassword = await this.authUtils.decryptRSA(body.password);
    // }

    const hashedPassword = await this.authUtils.hashPassword(decryptedPassword);
    const user = this.userRepository.create({
      ...body,
      password: hashedPassword,
      userType: UserType.EXTERNAL, // 设置用户类型为普通用户
      status: UserStatus.ACTIVE, // 默认激活
    });
    await this.userRepository.save(user);

    // 重新查询用户以获取正确的类型
    const savedUser = await this.userRepository.findOne({
      where: { username: body.username },
    });

    // 为新注册用户分配默认角色
    try {
      // 确保默认角色已初始化
      await this.roleService.initializeDefaultRoles();

      // 获取普通用户角色
      const defaultRole = await this.roleService.getRoleByCode('USER');

      // 为用户分配默认角色
      await this.roleService.assignRoleToUser(savedUser.id, defaultRole.id);

      this.logger.log('✅ 为新用户分配默认USER角色成功');
    } catch (error) {
      this.logger.error('为新用户分配默认角色失败:', error.message);
      // 角色分配失败时抛出异常，确保用户创建失败
      throw new HttpException(
        {
          message: '用户角色分配失败，请重试',
          error: 'role assignment failed',
          details: error.message,
        },
        500,
      );
    }

    return savedUser;
  }

  /**
   * 创建超级管理员账户
   * @param username 用户名
   * @param password 密码
   * @param email 邮箱
   * @returns 创建的用户
   */
  async createSuperAdmin(username: string, password: string, email?: string) {
    // 检查是否已存在超级管理员
    const existingSuperAdmin = await this.userRepository.findOne({
      where: { userType: UserType.INTERNAL, username },
    });

    if (existingSuperAdmin) {
      throw new BadRequestException('超级管理员已存在');
    }

    // 检查用户名是否已被使用
    const existingUser = await this.userRepository.findOne({
      where: { username },
    });

    if (existingUser) {
      throw new BadRequestException('用户名已被使用');
    }

    // 检查邮箱是否已被使用
    if (email) {
      const existingEmail = await this.userRepository.findOne({
        where: { email },
      });

      if (existingEmail) {
        throw new BadRequestException('邮箱已被使用');
      }
    }

    // 创建超级管理员
    const hashedPassword = await this.authUtils.hashPassword(password);
    const superAdmin = this.userRepository.create({
      username,
      password: hashedPassword,
      email,
      userType: UserType.INTERNAL,
      status: UserStatus.ACTIVE,
    });

    await this.userRepository.save(superAdmin);

    // 重新查询用户以获取正确的类型
    const savedAdmin = await this.userRepository.findOne({
      where: { username },
    });

    // 为超级管理员分配SUPER_ADMIN角色
    try {
      // 确保默认角色已初始化
      await this.roleService.initializeDefaultRoles();

      // 获取SUPER_ADMIN角色
      const superAdminRole = await this.roleService.getRoleByCode('SUPER_ADMIN');

      // 为用户分配角色
      await this.roleService.assignRoleToUser(savedAdmin.id, superAdminRole.id);

      this.logger.log('✅ 为超级管理员分配SUPER_ADMIN角色成功');
    } catch (error) {
      this.logger.error('为超级管理员分配角色失败:', error.message);
      // 即使角色分配失败，也不影响用户创建
    }

    // 记录审计日志
    await this.permissionService
      .getAuditLogs(1, 1, undefined, AuditAction.USER_CREATED)
      .catch(() => {}); // 忽略可能的错误

    return savedAdmin;
  }

  /**
   * 申请管理员权限
   * @param targetUserId 目标用户ID
   * @param reason 申请理由
   * @param requestedById 申请人ID
   * @returns 权限申请
   */
  async requestAdminPermission(targetUserId: number, reason: string, requestedById: number) {
    return this.permissionService.createPermissionRequest(
      RequestType.PROMOTE_TO_ADMIN,
      targetUserId,
      reason,
      requestedById,
    );
  }

  /**
   * 批准管理员权限申请
   * @param requestId 申请ID
   * @param approvedById 审批人ID
   * @returns 更新后的申请
   */
  async approveAdminRequest(requestId: number, approvedById: number) {
    return this.permissionService.approvePermissionRequest(requestId, approvedById, true);
  }

  /**
   * 拒绝管理员权限申请
   * @param requestId 申请ID
   * @param approvedById 审批人ID
   * @param rejectionReason 拒绝理由
   * @returns 更新后的申请
   */
  async rejectAdminRequest(requestId: number, approvedById: number, rejectionReason: string) {
    return this.permissionService.approvePermissionRequest(
      requestId,
      approvedById,
      false,
      rejectionReason,
    );
  }

  /**
   * 获取待处理的权限申请
   * @returns 待处理的申请列表
   */
  async getPendingRequests() {
    return this.permissionService.getPendingRequests();
  }

  /**
   * 获取用户申请历史
   * @param userId 用户ID
   * @returns 申请历史
   */
  async getUserRequestHistory(userId: number) {
    return this.permissionService.getUserRequestHistory(userId);
  }

  /**
   * 获取审计日志
   * @param page 页码
   * @param limit 每页数量
   * @param userId 用户ID（可选）
   * @param action 操作类型（可选）
   * @returns 审计日志
   */
  async getAuditLogs(page: number = 1, limit: number = 20, userId?: number, action?: AuditAction) {
    return this.permissionService.getAuditLogs(page, limit, userId, action);
  }

  /**
   * 撤销管理员权限
   * @param targetUserId 目标用户ID
   * @param reason 撤销理由
   * @param requestedById 操作人ID
   * @returns 权限申请
   */
  async revokeAdminPermission(targetUserId: number, reason: string, requestedById: number) {
    return this.permissionService.createPermissionRequest(
      RequestType.DEMOTE_FROM_ADMIN,
      targetUserId,
      reason,
      requestedById,
    );
  }

  /**
   * 获取所有管理员
   * @returns 管理员列表
   */
  async getAllAdmins() {
    return this.userRepository.find({
      where: { userType: UserType.INTERNAL },
      select: ['id', 'username', 'email', 'status', 'createdAt'],
    });
  }

  /**
   * 检查用户是否为超级管理员
   * @param userId 用户ID
   * @returns 是否为超级管理员
   */
  async isSuperAdmin(userId: number): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId, userType: UserType.INTERNAL },
    });

    if (!user) {
      return false;
    }

    return user.username === process.env.SUPER_ADMIN_USERNAME;
  }

  /**
   * 检查用户是否为管理员
   * @param userId 用户ID
   * @returns 是否为管理员
   */
  async isAdmin(userId: number): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId, userType: UserType.INTERNAL },
    });

    return !!user;
  }
}
