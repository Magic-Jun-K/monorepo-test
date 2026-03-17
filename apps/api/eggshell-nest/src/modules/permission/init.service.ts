/**
 * 初始化服务 - 用于系统启动时创建默认角色和权限
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';

import { PermissionEntity, PermissionType, ResourceType } from './entities/permission.entity';
import { RoleEntity, RoleType, RoleLevel } from '../role/entities/role.entity';
import {
  RolePermissionEntity,
  PermissionAssignmentStatus,
} from '../role/entities/role-permission.entity';
import { UserEntity, UserStatus } from '../user/entities/user.entity';

@Injectable()
export class InitService implements OnModuleInit {
  private readonly logger = new Logger(InitService.name);

  constructor(
    @InjectRepository(PermissionEntity)
    private readonly permissionRepo: Repository<PermissionEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
    @InjectRepository(RolePermissionEntity)
    private readonly rolePermissionRepo: Repository<RolePermissionEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async onModuleInit() {
    try {
      this.logger.log('开始初始化RBAC权限系统...');
      await this.initPermissions();
      await this.initRoles();
      await this.initRolePermissions();
      await this.initSuperAdmin();
      this.logger.log('RBAC权限系统初始化完成');
    } catch (error) {
      this.logger.error('RBAC权限系统初始化失败:', error);
    }
  }

  /**
   * 初始化权限数据
   */
  private async initPermissions() {
    const permissions = [
      // 用户管理权限
      {
        name: '用户管理',
        code: 'USER_MANAGEMENT',
        type: PermissionType.ROLE_MANAGE,
        resourceType: ResourceType.SYSTEM,
        description: '用户管理模块权限',
      },
      {
        name: '查看用户',
        code: 'USER_READ',
        type: PermissionType.USER_MANAGE,
        resourceType: ResourceType.USER,
        description: '查看用户列表和详情',
      },
      {
        name: '创建用户',
        code: 'USER_CREATE',
        type: PermissionType.USER_MANAGE,
        resourceType: ResourceType.USER,
        description: '创建新用户',
      },
      {
        name: '更新用户',
        code: 'USER_UPDATE',
        type: PermissionType.ROLE_MANAGE,
        resourceType: ResourceType.USER,
        description: '更新用户信息',
      },
      {
        name: '删除用户',
        code: 'USER_DELETE',
        type: PermissionType.ROLE_MANAGE,
        resourceType: ResourceType.USER,
        description: '删除用户',
      },
      {
        name: '导入用户',
        code: 'USER_IMPORT',
        type: PermissionType.PERMISSION_MANAGE,
        resourceType: ResourceType.USER,
        description: '导入用户数据',
      },
      {
        name: '导出用户',
        code: 'USER_EXPORT',
        type: PermissionType.PERMISSION_MANAGE,
        resourceType: ResourceType.USER,
        description: '导出用户数据',
      },
      {
        name: '分配用户角色',
        code: 'USER_ASSIGN_ROLE',
        type: PermissionType.PERMISSION_MANAGE,
        resourceType: ResourceType.USER,
        description: '为用户分配角色',
      },
      {
        name: '移除用户角色',
        code: 'USER_REMOVE_ROLE',
        type: PermissionType.SYSTEM_CONFIG,
        resourceType: ResourceType.USER,
        description: '移除用户角色',
      },

      // 角色管理权限
      {
        name: '角色管理',
        code: 'ROLE_MANAGEMENT',
        type: PermissionType.SYSTEM_CONFIG,
        resourceType: ResourceType.SYSTEM,
        description: '角色管理模块权限',
      },
      {
        name: '查看角色',
        code: 'ROLE_READ',
        type: PermissionType.SYSTEM_CONFIG,
        resourceType: ResourceType.ROLE,
        description: '查看角色列表和详情',
      },
      {
        name: '创建角色',
        code: 'ROLE_CREATE',
        type: PermissionType.ROLE_MANAGE,
        resourceType: ResourceType.ROLE,
        description: '创建新角色',
      },
      {
        name: '更新角色',
        code: 'ROLE_UPDATE',
        type: PermissionType.ROLE_MANAGE,
        resourceType: ResourceType.ROLE,
        description: '更新角色信息',
      },
      {
        name: '删除角色',
        code: 'ROLE_DELETE',
        type: PermissionType.ROLE_MANAGE,
        resourceType: ResourceType.ROLE,
        description: '删除角色',
      },
      {
        name: '分配角色权限',
        code: 'ROLE_ASSIGN_PERMISSION',
        type: PermissionType.ROLE_MANAGE,
        resourceType: ResourceType.ROLE,
        description: '为角色分配权限',
      },
      {
        name: '移除角色权限',
        code: 'ROLE_REMOVE_PERMISSION',
        type: PermissionType.ROLE_MANAGE,
        resourceType: ResourceType.ROLE,
        description: '移除角色权限',
      },

      // 权限管理权限
      {
        name: '权限管理',
        code: 'PERMISSION_MANAGEMENT',
        type: PermissionType.PERMISSION_MANAGE,
        resourceType: ResourceType.SYSTEM,
        description: '权限管理模块权限',
      },
      {
        name: '查看权限',
        code: 'PERMISSION_READ',
        type: PermissionType.PERMISSION_MANAGE,
        resourceType: ResourceType.PERMISSION,
        description: '查看权限列表和详情',
      },
      {
        name: '创建权限',
        code: 'PERMISSION_CREATE',
        type: PermissionType.PERMISSION_MANAGE,
        resourceType: ResourceType.PERMISSION,
        description: '创建新权限',
      },
      {
        name: '更新权限',
        code: 'PERMISSION_UPDATE',
        type: PermissionType.PERMISSION_MANAGE,
        resourceType: ResourceType.PERMISSION,
        description: '更新权限信息',
      },
      {
        name: '删除权限',
        code: 'PERMISSION_DELETE',
        type: PermissionType.PERMISSION_MANAGE,
        resourceType: ResourceType.PERMISSION,
        description: '删除权限',
      },

      // 系统配置权限
      {
        name: '系统配置',
        code: 'SYSTEM_CONFIG',
        type: PermissionType.SYSTEM_CONFIG,
        resourceType: ResourceType.SYSTEM,
        description: '系统配置模块权限',
      },
      {
        name: '查看系统配置',
        code: 'SYSTEM_CONFIG_READ',
        type: PermissionType.SYSTEM_CONFIG,
        resourceType: ResourceType.SYSTEM,
        description: '查看系统配置',
      },
      {
        name: '更新系统配置',
        code: 'SYSTEM_CONFIG_UPDATE',
        type: PermissionType.SYSTEM_CONFIG,
        resourceType: ResourceType.SYSTEM,
        description: '更新系统配置',
      },
    ];

    for (const permissionData of permissions) {
      const existingPermission = await this.permissionRepo.findOne({
        where: { code: permissionData.code },
      });

      if (!existingPermission) {
        const permission = this.permissionRepo.create(permissionData);
        await this.permissionRepo.save(permission);
        this.logger.log(`创建权限: ${permissionData.name}`);
      }
    }
  }

  /**
   * 初始化角色数据
   */
  private async initRoles() {
    const roles = [
      {
        name: '超级管理员',
        code: 'SUPER_ADMIN',
        type: RoleType.SYSTEM,
        level: RoleLevel.SUPER_ADMIN,
        description: '系统超级管理员，拥有所有权限',
        isSystem: true,
        isSuperAdmin: true,
        sortOrder: 1,
      },
      {
        name: '管理员',
        code: 'ADMIN',
        type: RoleType.SYSTEM,
        level: RoleLevel.ADMIN,
        description: '系统管理员，拥有大部分管理权限',
        isSystem: true,
        isSuperAdmin: false,
        sortOrder: 2,
      },
      {
        name: '用户管理专员',
        code: 'USER_MANAGER',
        type: RoleType.CUSTOM,
        level: RoleLevel.ADMIN,
        description: '用户管理专员，负责用户管理',
        isSystem: false,
        isSuperAdmin: false,
        sortOrder: 3,
      },
      {
        name: '普通用户',
        code: 'USER',
        type: RoleType.SYSTEM,
        level: RoleLevel.USER,
        description: '普通用户，只有基本权限',
        isSystem: true,
        isSuperAdmin: false,
        sortOrder: 4,
      },
    ];

    for (const roleData of roles) {
      const existingRole = await this.roleRepo.findOne({
        where: { code: roleData.code },
      });

      if (!existingRole) {
        const role = this.roleRepo.create(roleData);
        await this.roleRepo.save(role);
        this.logger.log(`创建角色: ${roleData.name}`);
      }
    }
  }

  /**
   * 初始化角色权限关联
   */
  private async initRolePermissions() {
    // 获取所有角色和权限
    const [roles, permissions] = await Promise.all([
      this.roleRepo.find(),
      this.permissionRepo.find(),
    ]);

    const roleMap = new Map(roles.map((role) => [role.code, role]));
    const permissionMap = new Map(permissions.map((permission) => [permission.code, permission]));

    // 超级管理员拥有所有权限
    const superAdminRole = roleMap.get('SUPER_ADMIN');
    if (superAdminRole) {
      for (const permission of permissions) {
        const existingAssignment = await this.rolePermissionRepo.findOne({
          where: {
            roleId: superAdminRole.id,
            permissionId: permission.id,
          },
        });

        if (!existingAssignment) {
          const rolePermission = this.rolePermissionRepo.create({
            roleId: superAdminRole.id,
            permissionId: permission.id,
            status: PermissionAssignmentStatus.ACTIVE,
            assignedAt: new Date(),
          });
          await this.rolePermissionRepo.save(rolePermission);
        }
      }
    }

    // 管理员拥有大部分权限（除了超级管理员专属权限）
    const adminRole = roleMap.get('ADMIN');
    if (adminRole) {
      const adminPermissions = [
        'USER_MANAGEMENT',
        'USER_READ',
        'USER_CREATE',
        'USER_UPDATE',
        'USER_DELETE',
        'USER_IMPORT',
        'USER_EXPORT',
        'USER_ASSIGN_ROLE',
        'USER_REMOVE_ROLE',
        'ROLE_MANAGEMENT',
        'ROLE_READ',
        'ROLE_CREATE',
        'ROLE_UPDATE',
        'ROLE_ASSIGN_PERMISSION',
        'ROLE_REMOVE_PERMISSION',
        'PERMISSION_MANAGEMENT',
        'PERMISSION_READ',
        'SYSTEM_CONFIG',
        'SYSTEM_CONFIG_READ',
      ];

      for (const permissionCode of adminPermissions) {
        const permission = permissionMap.get(permissionCode);
        if (permission) {
          const existingAssignment = await this.rolePermissionRepo.findOne({
            where: {
              roleId: adminRole.id,
              permissionId: permission.id,
            },
          });

          if (!existingAssignment) {
            const rolePermission = this.rolePermissionRepo.create({
              roleId: adminRole.id,
              permissionId: permission.id,
              status: PermissionAssignmentStatus.ACTIVE,
              assignedAt: new Date(),
            });
            await this.rolePermissionRepo.save(rolePermission);
          }
        }
      }
    }

    // 用户管理专员拥有用户管理相关权限
    const userManagerRole = roleMap.get('USER_MANAGER');
    if (userManagerRole) {
      const userManagerPermissions = [
        'USER_MANAGEMENT',
        'USER_READ',
        'USER_CREATE',
        'USER_UPDATE',
        'USER_IMPORT',
        'USER_EXPORT',
      ];

      for (const permissionCode of userManagerPermissions) {
        const permission = permissionMap.get(permissionCode);
        if (permission) {
          const existingAssignment = await this.rolePermissionRepo.findOne({
            where: {
              roleId: userManagerRole.id,
              permissionId: permission.id,
            },
          });

          if (!existingAssignment) {
            const rolePermission = this.rolePermissionRepo.create({
              roleId: userManagerRole.id,
              permissionId: permission.id,
              status: PermissionAssignmentStatus.ACTIVE,
              assignedAt: new Date(),
            });
            await this.rolePermissionRepo.save(rolePermission);
          }
        }
      }
    }

    // 普通用户只有基本权限
    const userRole = roleMap.get('USER');
    if (userRole) {
      const userPermissions = ['USER_READ'];

      for (const permissionCode of userPermissions) {
        const permission = permissionMap.get(permissionCode);
        if (permission) {
          const existingAssignment = await this.rolePermissionRepo.findOne({
            where: {
              roleId: userRole.id,
              permissionId: permission.id,
            },
          });

          if (!existingAssignment) {
            const rolePermission = this.rolePermissionRepo.create({
              roleId: userRole.id,
              permissionId: permission.id,
              status: PermissionAssignmentStatus.ACTIVE,
              assignedAt: new Date(),
            });
            await this.rolePermissionRepo.save(rolePermission);
          }
        }
      }
    }
  }

  /**
   * 初始化超级管理员用户
   */
  private async initSuperAdmin() {
    const superAdminUsername = process.env.SUPER_ADMIN_USERNAME || 'admin';
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || '&RbaEw%QDRV*eG!SJY85';

    let superAdmin = await this.userRepo.findOne({
      where: { username: superAdminUsername },
      relations: ['roles'],
    });

    if (!superAdmin) {
      // 创建超级管理员用户
      superAdmin = this.userRepo.create({
        username: superAdminUsername,
        email: 'admin@example.com',
        status: UserStatus.ACTIVE,
        isSuperAdmin: true,
      });

      // 设置密码
      superAdmin.password = await argon2.hash(superAdminPassword);

      superAdmin = await this.userRepo.save(superAdmin);
      this.logger.log(`创建超级管理员用户: ${superAdminUsername}`);
    }

    // 确保超级管理员拥有超级管理员角色
    const superAdminRole = await this.roleRepo.findOne({
      where: { code: 'SUPER_ADMIN' },
    });

    if (superAdminRole) {
      // 检查是否已经分配了角色
      const existingRoleAssignment = await this.userRepo.manager.query(
        'SELECT * FROM user_roles WHERE user_id = $1 AND role_id = $2',
        [superAdmin.id, superAdminRole.id],
      );

      if (!existingRoleAssignment || existingRoleAssignment.length === 0) {
        // 使用直接SQL插入的方式分配角色，避免TypeORM元数据解析问题
        await this.userRepo.manager.query(
          'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)',
          [superAdmin.id, superAdminRole.id],
        );
        this.logger.log(`为超级管理员用户分配超级管理员角色`);
      }
    }
  }
}
