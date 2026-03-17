/**
 * 用户角色实体
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  type Relation,
} from 'typeorm';

import type { UserEntity } from '../../user/entities/user.entity';
import type { PermissionEntity } from '../../permission/entities/permission.entity';
import type { RolePermissionEntity } from './role-permission.entity';

/**
 * 角色类型枚举
 */
export enum RoleType {
  SYSTEM = 'SYSTEM', // 系统角色
  CUSTOM = 'CUSTOM', // 自定义角色
}

/**
 * 角色级别枚举
 */
export enum RoleLevel {
  SUPER_ADMIN = 10, // 超级管理员
  ADMIN = 8, // 管理员
  MODERATOR = 6, // 协调员
  USER = 4, // 普通用户
  GUEST = 2, // 访客
}

@Entity({ name: 'role' })
export class RoleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 角色名称
   */
  @Column({ unique: true })
  name: string;

  /**
   * 角色代码
   */
  @Column({ unique: true })
  code: string;

  /**
   * 角色类型
   */
  @Column({
    type: 'enum',
    enum: RoleType,
    default: RoleType.CUSTOM,
  })
  type: RoleType;

  /**
   * 角色级别
   */
  @Column({
    type: 'enum',
    enum: RoleLevel,
    default: RoleLevel.USER,
  })
  level: RoleLevel;

  /**
   * 角色描述
   */
  @Column({ nullable: true })
  description: string;

  /**
   * 是否为系统内置角色
   */
  @Column({ default: false })
  isSystem: boolean;

  /**
   * 是否启用
   */
  @Column({ default: true })
  isActive: boolean;

  /**
   * 是否为超级管理员
   */
  @Column({ default: false })
  isSuperAdmin: boolean;

  /**
   * 父角色ID（用于构建角色层级）
   */
  @Column({ nullable: true })
  parentId: number;

  /**
   * 角色排序
   */
  @Column({ default: 0 })
  sortOrder: number;

  /**
   * 关联的用户
   */
  @ManyToMany('UserEntity', 'roles')
  users: Relation<UserEntity[]>;

  /**
   * 关联的权限
   */
  @ManyToMany('PermissionEntity', 'roles')
  permissions: Relation<PermissionEntity[]>;

  /**
   * 角色权限关联
   */
  @OneToMany('RolePermissionEntity', 'role')
  rolePermissions: Relation<RolePermissionEntity[]>;

  /**
   * 创建时间
   */
  @CreateDateColumn({
    type: 'timestamp with time zone', // 使用标准的带时区时间戳类型
    name: 'created_at',
    comment: '创建时间',
  })
  createdAt: Date;

  /**
   * 更新时间
   */
  @UpdateDateColumn({
    type: 'timestamp with time zone', // 使用标准的带时区时间戳类型
    name: 'updated_at',
    comment: '更新时间',
  })
  updatedAt: Date;
}
