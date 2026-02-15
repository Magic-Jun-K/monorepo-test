/**
 * 审计日志实体
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import type { UserEntity } from './user.entity';

export enum AuditAction {
  PROMOTE_TO_ADMIN = 'PROMOTE_TO_ADMIN', // 管理员晋升
  DEMOTE_FROM_ADMIN = 'DEMOTE_FROM_ADMIN', // 管理员降级
  CREATE_ADMIN = 'CREATE_ADMIN', // 创建管理员
  DELETE_ADMIN = 'DELETE_ADMIN', // 删除管理员
  USER_LOGIN = 'USER_LOGIN', // 用户登录
  USER_LOGOUT = 'USER_LOGOUT', // 用户退出
  PERMISSION_CHANGE = 'PERMISSION_CHANGE', // 权限变更
  SYSTEM_CONFIG_CHANGE = 'SYSTEM_CONFIG_CHANGE', // 系统配置变更
  PERMISSION_REQUEST = 'PERMISSION_REQUEST', // 权限申请
  PERMISSION_APPROVAL = 'PERMISSION_APPROVAL', // 权限审批
  USER_CREATED = 'USER_CREATED', // 用户创建
}

@Entity({ name: 'audit_log' })
export class AuditLogEntity {
  /**
   * 审计日志ID
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 审计操作类型
   */
  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  /**
   * 审计操作描述
   */
  @Column({ nullable: true })
  description: string;

  /**
   * 审计操作详情
   */
  @Column({ type: 'json', nullable: true })
  details: Record<string, unknown>;

  /**
   * 审计操作用户
   */
  @ManyToOne('UserEntity', { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  /**
   * 审计操作用户ID
   */
  @Column({ name: 'user_id', nullable: true })
  userId: number;

  /**
   * 审计操作目标用户
   */
  @ManyToOne('UserEntity', { nullable: true })
  @JoinColumn({ name: 'target_user_id' })
  targetUser: UserEntity;

  /**
   * 审计操作目标用户ID
   */
  @Column({ name: 'target_user_id', nullable: true })
  targetUserId: number;

  /**
   * 审计操作IP地址
   */
  @Column({ nullable: true })
  ipAddress: string;

  /**
   * 审计操作用户代理
   */
  @Column({ nullable: true })
  userAgent: string;

  /**
   * 审计操作是否成功
   */
  @Column({ default: true })
  success: boolean;

  /**
   * 审计操作错误信息
   */
  @Column({ nullable: true })
  errorMessage: string;

  /**
   * 审计日志创建时间
   */
  @CreateDateColumn({
    type: 'timestamp with time zone', // 使用标准的带时区时间戳类型
    name: 'created_at',
    comment: '审计日志创建时间',
  })
  createdAt: Date;
}
