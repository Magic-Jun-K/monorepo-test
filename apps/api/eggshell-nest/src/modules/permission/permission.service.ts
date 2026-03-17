/**
 * 权限服务
 */
import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, FindOptionsWhere } from 'typeorm';

import { PermissionEntity, PermissionType, ResourceType } from './entities/permission.entity';
import { RoleEntity } from '../role/entities/role.entity';
import {
  RolePermissionEntity,
  PermissionAssignmentStatus,
} from '../role/entities/role-permission.entity';

export interface PermissionTreeNode {
  id: number;
  name: string;
  code: string;
  type: PermissionType;
  resourceType: ResourceType;
  description: string;
  level: number;
  isActive: boolean;
  children: PermissionTreeNode[];
}

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);

  constructor(
    @InjectRepository(PermissionEntity)
    private permissionRepository: Repository<PermissionEntity>,
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
    @InjectRepository(RolePermissionEntity)
    private rolePermissionRepository: Repository<RolePermissionEntity>,
  ) {}

  /**
   * 创建权限
   */
  async createPermission(createPermissionDto: {
    name: string;
    code: string;
    type: PermissionType;
    resourceType: ResourceType;
    description?: string;
    level?: number;
    parentId?: number;
  }): Promise<PermissionEntity> {
    const {
      name,
      code,
      type,
      resourceType,
      description,
      level = 1,
      parentId,
    } = createPermissionDto;

    // 检查权限名称是否已存在
    const existingPermission = await this.permissionRepository.findOne({
      where: [{ name }, { code }],
    });

    if (existingPermission) {
      throw new ConflictException('权限名称或代码已存在');
    }

    // 如果有父权限，检查父权限是否存在
    if (parentId) {
      const parentPermission = await this.permissionRepository.findOne({
        where: { id: parentId },
      });

      if (!parentPermission) {
        throw new NotFoundException('父权限不存在');
      }
    }

    const permission = this.permissionRepository.create({
      name,
      code,
      type,
      resourceType,
      description,
      level,
      parentId,
    });

    const savedPermission = await this.permissionRepository.save(permission);
    this.logger.log(`创建权限成功: ${name} (${code})`);

    return savedPermission;
  }

  /**
   * 获取所有权限
   */
  async getAllPermissions(
    page = 1,
    limit = 10,
    search?: string,
    type?: PermissionType,
    resourceType?: ResourceType,
  ): Promise<{ permissions: PermissionEntity[]; total: number }> {
    const whereConditions: FindOptionsWhere<PermissionEntity> = {};

    if (search) {
      whereConditions.name = Like(`%${search}%`);
    }

    if (type) {
      whereConditions.type = type;
    }

    if (resourceType) {
      whereConditions.resourceType = resourceType;
    }

    const [permissions, total] = await this.permissionRepository.findAndCount({
      where: whereConditions,
      relations: ['roles'],
      skip: (page - 1) * limit,
      take: limit,
      order: { level: 'DESC', createdAt: 'DESC' },
    });

    return { permissions, total };
  }

  /**
   * 根据ID获取权限
   */
  async getPermissionById(id: number): Promise<PermissionEntity> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!permission) {
      throw new NotFoundException('权限不存在');
    }

    return permission;
  }

  /**
   * 根据代码获取权限
   */
  async getPermissionByCode(code: string): Promise<PermissionEntity> {
    const permission = await this.permissionRepository.findOne({
      where: { code },
      relations: ['roles'],
    });

    if (!permission) {
      throw new NotFoundException('权限不存在');
    }

    return permission;
  }

  /**
   * 更新权限
   */
  async updatePermission(
    id: number,
    updatePermissionDto: {
      name?: string;
      code?: string;
      type?: PermissionType;
      resourceType?: ResourceType;
      description?: string;
      level?: number;
      parentId?: number;
      isActive?: boolean;
    },
  ): Promise<PermissionEntity> {
    const permission = await this.getPermissionById(id);

    // 检查权限名称或代码是否与其他权限冲突
    if (updatePermissionDto.name || updatePermissionDto.code) {
      const existingPermission = await this.permissionRepository.findOne({
        where: [{ name: updatePermissionDto.name }, { code: updatePermissionDto.code }],
      });

      if (existingPermission && existingPermission.id !== id) {
        throw new ConflictException('权限名称或代码已存在');
      }
    }

    // 如果有父权限，检查父权限是否存在
    if (updatePermissionDto.parentId) {
      const parentPermission = await this.permissionRepository.findOne({
        where: { id: updatePermissionDto.parentId },
      });

      if (!parentPermission) {
        throw new NotFoundException('父权限不存在');
      }

      // 检查是否会形成循环引用
      if (updatePermissionDto.parentId === id) {
        throw new ConflictException('权限不能引用自身作为父权限');
      }
    }

    Object.assign(permission, updatePermissionDto);
    const updatedPermission = await this.permissionRepository.save(permission);
    this.logger.log(`更新权限成功: ${permission.name} (${permission.code})`);

    return updatedPermission;
  }

  /**
   * 删除权限
   */
  async deletePermission(id: number): Promise<void> {
    const permission = await this.getPermissionById(id);

    // 检查是否有子权限
    const childPermissions = await this.permissionRepository.find({
      where: { parentId: id },
    });

    if (childPermissions.length > 0) {
      throw new ConflictException('该权限下有子权限，无法删除');
    }

    // 检查是否有关联的角色
    if (permission.roles && permission.roles.length > 0) {
      throw new ConflictException('该权限已关联角色，无法删除');
    }

    await this.permissionRepository.remove(permission);
    this.logger.log(`删除权限成功: ${permission.name} (${permission.code})`);
  }

  /**
   * 为角色分配权限
   */
  async assignPermissionToRole(
    roleId: number,
    permissionId: number,
    assignedBy: string,
    expiresAt?: Date,
    remarks?: string,
  ): Promise<RolePermissionEntity> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    const permission = await this.getPermissionById(permissionId);

    // 检查是否已分配
    const existingAssignment = await this.rolePermissionRepository.findOne({
      where: {
        roleId,
        permissionId,
        status: PermissionAssignmentStatus.ACTIVE,
      },
    });

    if (existingAssignment) {
      throw new ConflictException('该权限已分配给该角色');
    }

    const rolePermission = this.rolePermissionRepository.create({
      roleId,
      permissionId,
      assignedBy,
      expiresAt,
      remarks,
    });

    const savedAssignment = await this.rolePermissionRepository.save(rolePermission);
    this.logger.log(`为角色 ${role.name} 分配权限 ${permission.name} 成功`);

    return savedAssignment;
  }

  /**
   * 移除角色的权限
   */
  async removePermissionFromRole(roleId: number, permissionId: number): Promise<void> {
    const rolePermission = await this.rolePermissionRepository.findOne({
      where: {
        roleId,
        permissionId,
        status: PermissionAssignmentStatus.ACTIVE,
      },
    });

    if (!rolePermission) {
      throw new NotFoundException('该角色未分配该权限');
    }

    await this.rolePermissionRepository.remove(rolePermission);
    this.logger.log(`移除角色权限分配成功`);
  }

  /**
   * 获取角色的所有权限
   */
  async getRolePermissions(roleId: number): Promise<PermissionEntity[]> {
    const rolePermissions = await this.rolePermissionRepository.find({
      where: {
        roleId,
        status: PermissionAssignmentStatus.ACTIVE,
      },
      relations: ['permission'],
    });

    return rolePermissions.map((rp) => rp.permission);
  }

  /**
   * 批量为角色分配权限
   */
  async batchAssignPermissionsToRole(
    roleId: number,
    permissionIds: number[],
    assignedBy: string,
  ): Promise<RolePermissionEntity[]> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    // 获取所有权限
    const permissions = await this.permissionRepository.find({
      where: { id: In(permissionIds) },
    });

    if (permissions.length !== permissionIds.length) {
      throw new NotFoundException('部分权限不存在');
    }

    const assignments: RolePermissionEntity[] = [];

    for (const permission of permissions) {
      // 检查是否已分配
      const existingAssignment = await this.rolePermissionRepository.findOne({
        where: {
          roleId,
          permissionId: permission.id,
          status: PermissionAssignmentStatus.ACTIVE,
        },
      });

      if (!existingAssignment) {
        const rolePermission = this.rolePermissionRepository.create({
          roleId,
          permissionId: permission.id,
          assignedBy,
        });

        assignments.push(await this.rolePermissionRepository.save(rolePermission));
      }
    }

    this.logger.log(`为角色 ${role.name} 批量分配权限成功，共 ${assignments.length} 个权限`);
    return assignments;
  }

  /**
   * 批量移除角色的权限
   */
  async batchRemovePermissionsFromRole(roleId: number, permissionIds: number[]): Promise<void> {
    const rolePermissions = await this.rolePermissionRepository.find({
      where: {
        roleId,
        permissionId: In(permissionIds),
        status: PermissionAssignmentStatus.ACTIVE,
      },
    });

    if (rolePermissions.length === 0) {
      throw new NotFoundException('该角色未分配指定的权限');
    }

    await this.rolePermissionRepository.remove(rolePermissions);
    this.logger.log(`批量移除角色权限成功，共 ${rolePermissions.length} 个权限`);
  }

  /**
   * 获取权限树
   */
  async getPermissionTree(): Promise<PermissionTreeNode[]> {
    const permissions = await this.permissionRepository.find({
      order: { level: 'DESC', id: 'ASC' },
    });

    // 构建权限树
    const permissionMap = new Map<number, PermissionTreeNode>();
    const rootPermissions: PermissionTreeNode[] = [];

    // 第一遍：创建所有权限节点
    for (const permission of permissions) {
      permissionMap.set(permission.id, {
        id: permission.id,
        name: permission.name,
        code: permission.code,
        type: permission.type,
        resourceType: permission.resourceType,
        description: permission.description,
        level: permission.level,
        isActive: permission.isActive,
        children: [],
      });
    }

    // 第二遍：构建父子关系
    for (const permission of permissions) {
      const node = permissionMap.get(permission.id);

      if (permission.parentId) {
        const parentNode = permissionMap.get(permission.parentId);
        if (parentNode) {
          parentNode.children.push(node);
        }
      } else {
        rootPermissions.push(node);
      }
    }

    return rootPermissions;
  }
}
