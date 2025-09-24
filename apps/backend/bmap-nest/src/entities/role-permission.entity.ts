/**
 * 角色权限关联实体
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { RoleEntity } from './role.entity';
import { PermissionEntity } from './permission.entity';

/**
 * 权限分配状态
 */
export enum PermissionAssignmentStatus {
  ACTIVE = 'ACTIVE', // 激活
  INACTIVE = 'INACTIVE', // 未激活
  EXPIRED = 'EXPIRED', // 已过期
}

@Entity({ name: 'role_permission' })
export class RolePermissionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 关联的角色
   */
  @ManyToOne(() => RoleEntity, (role) => role.rolePermissions)
  @JoinColumn({ name: 'role_id' })
  role: RoleEntity;

  /**
   * 关联的角色ID
   */
  @Column({ name: 'role_id' })
  roleId: number;

  /**
   * 关联的权限
   */
  @ManyToOne(() => PermissionEntity, (permission) => permission.roles)
  @JoinColumn({ name: 'permission_id' })
  permission: PermissionEntity;

  /**
   * 关联的权限ID
   */
  @Column({ name: 'permission_id' })
  permissionId: number;

  /**
   * 权限分配状态
   */
  @Column({
    type: 'enum',
    enum: PermissionAssignmentStatus,
    default: PermissionAssignmentStatus.ACTIVE,
  })
  status: PermissionAssignmentStatus;

  /**
   * 权限分配时间
   */
  @Column({
    name: 'assigned_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  assignedAt: Date;

  /**
   * 权限过期时间
   */
  @Column({ name: 'expires_at', nullable: true })
  expiresAt: Date;

  /**
   * 分配者
   */
  @Column({ name: 'assigned_by', nullable: true })
  assignedBy: string;

  /**
   * 分配备注
   */
  @Column({ nullable: true })
  remarks: string;

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
