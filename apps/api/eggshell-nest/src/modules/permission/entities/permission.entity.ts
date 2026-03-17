/**
 * 权限实体
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';

import type { RoleEntity } from '../../role/entities/role.entity';

/**
 * 权限类型枚举
 */
export enum PermissionType {
  // 系统管理权限
  SYSTEM_CONFIG = 'SYSTEM_CONFIG', // 系统配置
  SYSTEM_MONITOR = 'SYSTEM_MONITOR', // 系统监控

  // 用户管理权限
  USER_CREATE = 'USER_CREATE', // 创建用户
  USER_READ = 'USER_READ', // 查看用户
  USER_UPDATE = 'USER_UPDATE', // 更新用户
  USER_DELETE = 'USER_DELETE', // 删除用户
  USER_MANAGE = 'USER_MANAGE', // 用户管理

  // 角色管理权限
  ROLE_CREATE = 'ROLE_CREATE', // 创建角色
  ROLE_READ = 'ROLE_READ', // 查看角色
  ROLE_UPDATE = 'ROLE_UPDATE', // 更新角色
  ROLE_DELETE = 'ROLE_DELETE', // 删除角色
  ROLE_MANAGE = 'ROLE_MANAGE', // 角色管理

  // 权限管理权限
  PERMISSION_CREATE = 'PERMISSION_CREATE', // 创建权限
  PERMISSION_READ = 'PERMISSION_READ', // 查看权限
  PERMISSION_UPDATE = 'PERMISSION_UPDATE', // 更新权限
  PERMISSION_DELETE = 'PERMISSION_DELETE', // 删除权限
  PERMISSION_MANAGE = 'PERMISSION_MANAGE', // 权限管理

  // 审计管理权限
  AUDIT_READ = 'AUDIT_READ', // 查看审计日志
  AUDIT_MANAGE = 'AUDIT_MANAGE', // 管理审计日志

  // 应用管理权限
  APPLICATION_CREATE = 'APPLICATION_CREATE', // 创建应用
  APPLICATION_READ = 'APPLICATION_READ', // 查看应用
  APPLICATION_UPDATE = 'APPLICATION_UPDATE', // 更新应用
  APPLICATION_DELETE = 'APPLICATION_DELETE', // 删除应用
  APPLICATION_MANAGE = 'APPLICATION_MANAGE', // 应用管理

  // 文件管理权限
  FILE_UPLOAD = 'FILE_UPLOAD', // 上传文件
  FILE_READ = 'FILE_READ', // 查看文件
  FILE_UPDATE = 'FILE_UPDATE', // 更新文件
  FILE_DELETE = 'FILE_DELETE', // 删除文件
  FILE_MANAGE = 'FILE_MANAGE', // 文件管理

  // 数据导出权限
  DATA_EXPORT = 'DATA_EXPORT', // 数据导出
  DATA_IMPORT = 'DATA_IMPORT', // 数据导入

  // 管理员权限
  ADMIN_MANAGE = 'ADMIN_MANAGE', // 管理员管理
  SUPER_ADMIN = 'SUPER_ADMIN', // 超级管理员权限
}

/**
 * 权限资源类型
 */
export enum ResourceType {
  USER = 'USER', // 用户资源
  ROLE = 'ROLE', // 角色资源
  PERMISSION = 'PERMISSION', // 权限资源
  APPLICATION = 'APPLICATION', // 应用资源
  FILE = 'FILE', // 文件资源
  AUDIT = 'AUDIT', // 审计资源
  SYSTEM = 'SYSTEM', // 系统资源
}

@Entity({ name: 'permission' })
export class PermissionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 权限名称
   */
  @Column({ unique: true })
  name: string;

  /**
   * 权限代码
   */
  @Column({ unique: true })
  code: string;

  /**
   * 权限类型
   */
  @Column({
    type: 'enum',
    enum: PermissionType,
  })
  type: PermissionType;

  /**
   * 资源类型
   */
  @Column({
    type: 'enum',
    enum: ResourceType,
  })
  resourceType: ResourceType;

  /**
   * 权限描述
   */
  @Column({ nullable: true })
  description: string;

  /**
   * 权限级别（1-10，数字越大权限越高）
   */
  @Column({ default: 1 })
  level: number;

  /**
   * 是否启用
   */
  @Column({ default: true })
  isActive: boolean;

  /**
   * 父权限ID（用于构建权限树）
   */
  @Column({ nullable: true })
  parentId: number;

  /**
   * 关联的角色
   */
  @ManyToMany('RoleEntity', 'permissions')
  roles: Relation<RoleEntity[]>;

  /**
   * 权限创建时间
   */
  @CreateDateColumn({
    type: 'timestamp with time zone', // 使用标准的带时区时间戳类型
    name: 'created_at',
    comment: '权限创建时间',
  })
  createdAt: Date;

  /**
   * 权限更新时间
   */
  @UpdateDateColumn({
    type: 'timestamp with time zone', // 使用标准的带时区时间戳类型
    name: 'updated_at',
    comment: '权限更新时间',
  })
  updatedAt: Date;
}
