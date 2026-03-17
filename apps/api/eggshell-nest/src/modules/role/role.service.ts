/**
 * 角色服务
 */
import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, FindOptionsWhere } from 'typeorm';

import { RoleEntity, RoleType, RoleLevel } from './entities/role.entity';
import { UserEntity } from '../user/entities/user.entity';
import { RolePermissionEntity } from './entities/role-permission.entity';
import { PermissionService } from '../permission/permission.service';

interface RoleTreeNode {
  id: number;
  name: string;
  code: string;
  type: RoleType;
  level: RoleLevel;
  description: string;
  isSystem: boolean;
  isActive: boolean;
  children: RoleTreeNode[];
}

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(RolePermissionEntity)
    private rolePermissionRepository: Repository<RolePermissionEntity>,
    private readonly permissionService: PermissionService,
  ) {}

  /**
   * 创建角色
   */
  async createRole(createRoleDto: {
    name: string;
    code: string;
    type?: RoleType;
    level?: RoleLevel;
    description?: string;
    parentId?: number;
    sortOrder?: number;
  }): Promise<RoleEntity> {
    const {
      name,
      code,
      type = RoleType.CUSTOM,
      level = RoleLevel.USER,
      description,
      parentId,
      sortOrder = 0,
    } = createRoleDto;

    // 检查角色名称或代码是否已存在
    const existingRole = await this.roleRepository.findOne({
      where: [{ name }, { code }],
    });

    if (existingRole) {
      throw new ConflictException('角色名称或代码已存在');
    }

    // 如果有父角色，检查父角色是否存在
    if (parentId) {
      const parentRole = await this.roleRepository.findOne({
        where: { id: parentId },
      });

      if (!parentRole) {
        throw new NotFoundException('父角色不存在');
      }

      // 检查父角色级别是否高于当前角色
      if (parentRole.level <= level) {
        throw new ConflictException('父角色级别必须高于子角色级别');
      }
    }

    const role = this.roleRepository.create({
      name,
      code,
      type,
      level,
      description,
      parentId,
      sortOrder,
    });

    const savedRole = await this.roleRepository.save(role);
    this.logger.log(`创建角色成功: ${name} (${code})`);

    return savedRole;
  }

  /**
   * 获取所有角色
   */
  async getAllRoles(
    page = 1,
    limit = 10,
    search?: string,
    type?: RoleType,
    level?: RoleLevel,
    isActive?: boolean,
  ): Promise<{ roles: RoleEntity[]; total: number }> {
    const whereConditions: FindOptionsWhere<RoleEntity> = {};

    if (search) {
      whereConditions.name = Like(`%${search}%`);
    }

    if (type) {
      whereConditions.type = type;
    }

    if (level) {
      whereConditions.level = level;
    }

    if (typeof isActive === 'boolean') {
      whereConditions.isActive = isActive;
    }

    const [roles, total] = await this.roleRepository.findAndCount({
      where: whereConditions,
      skip: (page - 1) * limit,
      take: limit,
      order: { level: 'DESC', sortOrder: 'ASC', createdAt: 'DESC' },
    });

    return { roles, total };
  }

  /**
   * 根据ID获取角色
   */
  async getRoleById(id: number): Promise<RoleEntity> {
    const role = await this.roleRepository.findOne({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    return role;
  }

  /**
   * 根据代码获取角色
   */
  async getRoleByCode(code: string): Promise<RoleEntity> {
    // 使用直接SQL查询获取角色，避免TypeORM关系操作
    const roles = await this.roleRepository.manager.query('SELECT * FROM role WHERE code = $1', [
      code,
    ]);

    if (roles.length === 0) {
      throw new NotFoundException('角色不存在');
    }

    // 将查询结果转换为RoleEntity对象
    const roleData = roles[0];
    const role = new RoleEntity();
    role.id = roleData.id;
    role.name = roleData.name;
    role.code = roleData.code;
    role.type = roleData.type;
    role.level = roleData.level;
    role.description = roleData.description;
    role.isSystem = roleData.isSystem;
    role.isActive = roleData.isActive;
    role.isSuperAdmin = roleData.isSuperAdmin;
    role.parentId = roleData.parentId;
    role.sortOrder = roleData.sortOrder;
    role.createdAt = new Date(roleData.created_at);
    role.updatedAt = new Date(roleData.updated_at);

    return role;
  }

  /**
   * 更新角色
   */
  async updateRole(
    id: number,
    updateRoleDto: {
      name?: string;
      code?: string;
      type?: RoleType;
      level?: RoleLevel;
      description?: string;
      parentId?: number;
      sortOrder?: number;
      isActive?: boolean;
    },
  ): Promise<RoleEntity> {
    const role = await this.getRoleById(id);

    // 检查角色名称或代码是否与其他角色冲突
    if (updateRoleDto.name || updateRoleDto.code) {
      const existingRole = await this.roleRepository.findOne({
        where: [{ name: updateRoleDto.name }, { code: updateRoleDto.code }],
      });

      if (existingRole && existingRole.id !== id) {
        throw new ConflictException('角色名称或代码已存在');
      }
    }

    // 如果有父角色，检查父角色是否存在
    if (updateRoleDto.parentId) {
      const parentRole = await this.roleRepository.findOne({
        where: { id: updateRoleDto.parentId },
      });

      if (!parentRole) {
        throw new NotFoundException('父角色不存在');
      }

      // 检查是否会形成循环引用
      if (updateRoleDto.parentId === id) {
        throw new ConflictException('角色不能引用自身作为父角色');
      }

      // 检查父角色级别是否高于当前角色级别
      const newLevel = updateRoleDto.level || role.level;
      if (parentRole.level <= newLevel) {
        throw new ConflictException('父角色级别必须高于子角色级别');
      }
    }

    Object.assign(role, updateRoleDto);
    const updatedRole = await this.roleRepository.save(role);
    this.logger.log(`更新角色成功: ${role.name} (${role.code})`);

    return updatedRole;
  }

  /**
   * 删除角色
   */
  async deleteRole(id: number): Promise<void> {
    const role = await this.getRoleById(id);

    // 检查是否为系统角色
    if (role.isSystem) {
      throw new ConflictException('系统角色不能删除');
    }

    // 检查是否有子角色
    const childRoles = await this.roleRepository.find({
      where: { parentId: id },
    });

    if (childRoles.length > 0) {
      throw new ConflictException('该角色下有子角色，无法删除');
    }

    // 检查是否有关联的用户
    if (role.users && role.users.length > 0) {
      throw new ConflictException('该角色已关联用户，无法删除');
    }

    // 删除角色权限关联
    await this.rolePermissionRepository.delete({ roleId: id });

    await this.roleRepository.remove(role);
    this.logger.log(`删除角色成功: ${role.name} (${role.code})`);
  }

  /**
   * 为用户分配角色
   */
  async assignRoleToUser(userId: number, roleId: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    // 检查用户是否已有该角色
    const userRoles = await this.getUserRoles(userId);
    if (userRoles.some((r) => r.id === roleId)) {
      throw new ConflictException('用户已拥有该角色');
    }

    // 使用直接SQL插入的方式添加角色，避免TypeORM元数据解析问题
    await this.userRepository.manager.query(
      'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)',
      [userId, roleId],
    );

    this.logger.log(`为用户 ${user.username} 分配角色 ${role.name} 成功`);
  }

  /**
   * 移除用户的角色
   */
  async removeRoleFromUser(userId: number, roleId: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 检查用户是否拥有该角色
    const userRoles = await this.getUserRoles(userId);
    const roleIndex = userRoles.findIndex((r) => r.id === roleId);
    if (roleIndex === -1) {
      throw new NotFoundException('用户未拥有该角色');
    }

    // 使用直接SQL删除的方式移除角色，避免TypeORM元数据解析问题
    await this.userRepository.manager.query(
      'DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2',
      [userId, roleId],
    );

    this.logger.log(`移除用户 ${user.username} 的角色成功`);
  }

  /**
   * 获取用户的所有角色
   */
  async getUserRoles(userId: number): Promise<RoleEntity[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 使用直接SQL查询获取用户角色，避免TypeORM关系操作
    const userRoles = await this.userRepository.manager.query(
      `SELECT r.id, r.name, r.code, r.type, r.level, r.description, r."isSystem", r."isActive", r."isSuperAdmin", r."parentId", r."sortOrder", r."created_at", r."updated_at" 
       FROM role r 
       INNER JOIN user_roles ur ON r.id = ur.role_id 
       WHERE ur.user_id = $1`,
      [userId],
    );

    return userRoles || [];
  }

  /**
   * 批量为用户分配角色
   */
  async batchAssignRolesToUser(userId: number, roleIds: number[]): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 获取所有角色
    const roles = await this.roleRepository.find({
      where: { id: In(roleIds) },
    });

    if (roles.length !== roleIds.length) {
      throw new NotFoundException('部分角色不存在');
    }

    // 获取用户当前的角色
    const userRoles = await this.getUserRoles(userId);
    const userRoleIds = new Set(userRoles.map((r) => r.id));

    // 过滤掉用户已有的角色
    const newRoles = roles.filter((role) => !userRoleIds.has(role.id));

    if (newRoles.length > 0) {
      // 使用直接SQL插入的方式添加角色，避免TypeORM元数据解析问题
      for (const role of newRoles) {
        await this.userRepository.manager.query(
          'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)',
          [userId, role.id],
        );
      }

      this.logger.log(`为用户 ${user.username} 批量分配角色成功，共 ${newRoles.length} 个角色`);
    }
  }

  /**
   * 批量移除用户的角色
   */
  async batchRemoveRolesFromUser(userId: number, roleIds: number[]): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 获取用户当前的角色
    const userRoles = await this.getUserRoles(userId);
    const removedRoles = userRoles.filter((role) => roleIds.includes(role.id));

    if (removedRoles.length === 0) {
      throw new NotFoundException('用户未拥有指定的角色');
    }

    // 使用直接SQL删除的方式移除角色，避免TypeORM元数据解析问题
    for (const roleId of roleIds) {
      await this.userRepository.manager.query(
        'DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2',
        [userId, roleId],
      );
    }

    this.logger.log(`批量移除用户角色成功，共 ${removedRoles.length} 个角色`);
  }

  /**
   * 初始化系统默认角色
   */
  async initializeDefaultRoles(): Promise<void> {
    const defaultRoles = [
      {
        name: '超级管理员',
        code: 'SUPER_ADMIN',
        type: RoleType.SYSTEM,
        level: RoleLevel.SUPER_ADMIN,
        description: '系统超级管理员，拥有所有权限',
        isSystem: true,
        sortOrder: 1,
      },
      {
        name: '管理员',
        code: 'ADMIN',
        type: RoleType.SYSTEM,
        level: RoleLevel.ADMIN,
        description: '系统管理员，拥有大部分管理权限',
        isSystem: true,
        sortOrder: 2,
      },
      {
        name: '协调员',
        code: 'MODERATOR',
        type: RoleType.SYSTEM,
        level: RoleLevel.MODERATOR,
        description: '协调员，拥有部分管理权限',
        isSystem: true,
        sortOrder: 3,
      },
      {
        name: '普通用户',
        code: 'USER',
        type: RoleType.SYSTEM,
        level: RoleLevel.USER,
        description: '普通用户，拥有基本功能权限',
        isSystem: true,
        sortOrder: 4,
      },
      {
        name: '访客',
        code: 'GUEST',
        type: RoleType.SYSTEM,
        level: RoleLevel.GUEST,
        description: '访客，拥有最基本权限',
        isSystem: true,
        sortOrder: 5,
      },
    ];

    for (const roleData of defaultRoles) {
      // 使用直接SQL查询检查角色是否存在，避免TypeORM关系操作
      const existingRoles = await this.roleRepository.manager.query(
        'SELECT * FROM role WHERE code = $1',
        [roleData.code],
      );

      if (existingRoles.length === 0) {
        // 使用直接SQL插入创建角色，避免TypeORM元数据解析问题
        await this.roleRepository.manager.query(
          `INSERT INTO role (name, code, type, level, description, isSystem, isActive, isSuperAdmin, parentId, sortOrder, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            roleData.name,
            roleData.code,
            roleData.type,
            roleData.level,
            roleData.description,
            roleData.isSystem,
            true, // isActive
            false, // isSuperAdmin
            null, // parentId
            roleData.sortOrder,
          ],
        );
        this.logger.log(`创建默认角色成功: ${roleData.name}`);
      }
    }
  }

  /**
   * 获取角色树
   */
  async getRoleTree(): Promise<RoleTreeNode[]> {
    const roles = await this.roleRepository.find({
      order: { level: 'DESC', sortOrder: 'ASC' },
    });

    // 构建角色树
    const roleMap = new Map<number, RoleTreeNode>();
    const rootRoles: RoleTreeNode[] = [];

    // 第一遍：创建所有角色节点
    for (const role of roles) {
      roleMap.set(role.id, {
        id: role.id,
        name: role.name,
        code: role.code,
        type: role.type,
        level: role.level,
        description: role.description,
        isSystem: role.isSystem,
        isActive: role.isActive,
        children: [],
      });
    }

    // 第二遍：构建父子关系
    for (const role of roles) {
      const node = roleMap.get(role.id);

      if (role.parentId) {
        const parentNode = roleMap.get(role.parentId);
        if (parentNode) {
          parentNode.children.push(node);
        }
      } else {
        rootRoles.push(node);
      }
    }

    return rootRoles;
  }
}
