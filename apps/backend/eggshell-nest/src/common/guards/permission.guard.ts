/**
 * 权限守卫
 */
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PermissionService } from '../../module/permission/permission.service';

import type { PermissionEntity, PermissionType } from '../../entities/permission.entity';
import type { RoleEntity, RoleLevel } from '../../entities/role.entity';
import { UserEntity } from '../../entities/user.entity';

/**
 * 权限检查装饰器
 */
export const RequirePermissions = (...permissions: PermissionType[]) => {
  return (target: unknown, key?: string, descriptor?: PropertyDescriptor) => {
    Reflect.defineMetadata('required_permissions', permissions, descriptor?.value);
  };
};

/**
 * 角色级别检查装饰器
 */
export const RequireRoleLevel = (minLevel: RoleLevel) => {
  return (target: unknown, key?: string, descriptor?: PropertyDescriptor) => {
    Reflect.defineMetadata('required_role_level', minLevel, descriptor?.value);
  };
};

/**
 * 资源权限检查装饰器
 */
export const RequireResourcePermission = (resourceType: string, action: string) => {
  return (target: unknown, key?: string, descriptor?: PropertyDescriptor) => {
    Reflect.defineMetadata(
      'required_resource_permission',
      { resourceType, action },
      descriptor?.value,
    );
  };
};

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: PermissionService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as UserEntity;

    if (!user) {
      throw new ForbiddenException('用户未登录');
    }

    // 检查是否为超级管理员
    if (user.isSuperAdmin) {
      return true;
    }

    // 获取用户角色
    const userRoles = await this.getUserRoles(user.id);
    if (userRoles.length === 0) {
      throw new ForbiddenException('用户没有分配角色');
    }

    // 检查角色级别要求
    const requiredRoleLevel = this.reflector.get<RoleLevel>(
      'required_role_level',
      context.getHandler(),
    );

    if (requiredRoleLevel) {
      const hasSufficientRoleLevel = userRoles.some((role) => role.level >= requiredRoleLevel);
      if (!hasSufficientRoleLevel) {
        throw new ForbiddenException('用户角色级别不足');
      }
    }

    // 检查权限要求
    const requiredPermissions = this.reflector.get<PermissionType[]>(
      'required_permissions',
      context.getHandler(),
    );

    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasRequiredPermissions = await this.checkUserPermissions(user, requiredPermissions);
      if (!hasRequiredPermissions) {
        throw new ForbiddenException('用户权限不足');
      }
    }

    // 检查资源权限要求
    const requiredResourcePermission = this.reflector.get(
      'required_resource_permission',
      context.getHandler(),
    );

    if (requiredResourcePermission) {
      const hasResourcePermission = await this.checkResourcePermission(
        user,
        requiredResourcePermission.resourceType,
        requiredResourcePermission.action,
      );
      if (!hasResourcePermission) {
        throw new ForbiddenException('用户资源权限不足');
      }
    }

    return true;
  }

  /**
   * 获取用户角色
   */
  private async getUserRoles(userId: number): Promise<RoleEntity[]> {
    const query = `
      SELECT r.* 
      FROM role r
      INNER JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = $1
    `;
    return this.userRepository.manager.query(query, [userId]);
  }

  /**
   * 检查用户是否拥有指定权限
   */
  private async checkUserPermissions(
    user: UserEntity,
    requiredPermissions: PermissionType[],
  ): Promise<boolean> {
    const userRoles = await this.getUserRoles(user.id);
    const userPermissionCodes = new Set<string>();

    // 收集用户所有角色的权限
    const rolePermissionsPromises = userRoles.map((role) =>
      this.permissionService.getRolePermissions(role.id),
    );
    const rolePermissionsArray = await Promise.all(rolePermissionsPromises);

    rolePermissionsArray.flat().forEach((permission) => {
      userPermissionCodes.add(permission.type);
    });

    // 检查是否拥有所有必需权限
    return requiredPermissions.every((permission) => userPermissionCodes.has(permission));
  }

  /**
   * 检查用户是否拥有指定资源的权限
   */
  private async checkResourcePermission(
    user: UserEntity,
    resourceType: string,
    action: string,
  ): Promise<boolean> {
    const userRoles = await this.getUserRoles(user.id);
    const userPermissions: PermissionEntity[] = [];

    // 收集用户所有角色的权限
    const rolePermissionsPromises = userRoles.map((role) =>
      this.permissionService.getRolePermissions(role.id),
    );
    const rolePermissionsArray = await Promise.all(rolePermissionsPromises);

    userPermissions.push(...rolePermissionsArray.flat());

    // 检查是否有匹配的资源权限
    return userPermissions.some((permission) => {
      return (
        permission.resourceType === resourceType &&
        (permission.type.includes(action.toUpperCase()) ||
          permission.type === 'SUPER_ADMIN' ||
          permission.type === `${resourceType.toUpperCase()}_MANAGE`)
      );
    });
  }

  /**
   * 检查用户是否为超级管理员
   */
  static isSuperAdmin(user: UserEntity): boolean {
    return user.isSuperAdmin;
  }

  /**
   * 检查用户是否拥有指定角色级别
   */
  static async hasRoleLevel(
    user: UserEntity,
    minLevel: RoleLevel,
    userRepository: Repository<UserEntity>,
  ): Promise<boolean> {
    const query = `
      SELECT r.* 
      FROM role r
      INNER JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = $1
    `;
    const userRoles = await userRepository.manager.query(query, [user.id]);
    return userRoles.some((role) => role.level >= minLevel);
  }

  /**
   * 检查用户是否拥有指定权限
   */
  static async hasPermission(
    user: UserEntity,
    permissionService: PermissionService,
    permissionType: PermissionType,
    userRepository: Repository<UserEntity>,
  ): Promise<boolean> {
    if (user.isSuperAdmin) {
      return true;
    }

    const query = `
      SELECT r.* 
      FROM role r
      INNER JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = $1
    `;
    const userRoles = await userRepository.manager.query(query, [user.id]);
    if (userRoles.length === 0) {
      return false;
    }

    const rolePermissionsPromises = userRoles.map((role) =>
      permissionService.getRolePermissions(role.id),
    );
    const rolePermissionsArray = await Promise.all(rolePermissionsPromises);

    for (const rolePermissions of rolePermissionsArray) {
      if (rolePermissions.some((permission) => permission.type === permissionType)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 检查用户是否拥有指定资源权限
   */
  static async hasResourcePermission(
    user: UserEntity,
    permissionService: PermissionService,
    resourceType: string,
    action: string,
    userRepository: Repository<UserEntity>,
  ): Promise<boolean> {
    if (user.isSuperAdmin) {
      return true;
    }

    const query = `
      SELECT r.* 
      FROM role r
      INNER JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = $1
    `;
    const userRoles = await userRepository.manager.query(query, [user.id]);
    if (userRoles.length === 0) {
      return false;
    }

    const rolePermissionsPromises = userRoles.map((role) =>
      permissionService.getRolePermissions(role.id),
    );
    const rolePermissionsArray = await Promise.all(rolePermissionsPromises);

    for (const rolePermissions of rolePermissionsArray) {
      if (
        rolePermissions.some(
          (permission) =>
            permission.resourceType === resourceType &&
            (permission.type.includes(action.toUpperCase()) ||
              permission.type === 'SUPER_ADMIN' ||
              permission.type === `${resourceType.toUpperCase()}_MANAGE`),
        )
      ) {
        return true;
      }
    }

    return false;
  }
}
