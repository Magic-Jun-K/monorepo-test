/**
 * 权限申请实体
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { UserEntity } from './user.entity';

export enum RequestStatus {
  PENDING = 'PENDING', // 待处理
  APPROVED = 'APPROVED', // 已批准
  REJECTED = 'REJECTED', // 已拒绝
  CANCELLED = 'CANCELLED', // 已取消
}

/**
 * 权限申请类型
 */
export enum RequestType {
  PROMOTE_TO_ADMIN = 'PROMOTE_TO_ADMIN', // 提升为管理员
  DEMOTE_FROM_ADMIN = 'DEMOTE_FROM_ADMIN', // 降级为普通用户
  SYSTEM_ACCESS = 'SYSTEM_ACCESS', // 系统访问
}

@Entity({ name: 'permission_request' })
export class PermissionRequestEntity {
  /**
   * 权限申请ID
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 权限申请类型
   */
  @Column({
    type: 'enum',
    enum: RequestType,
  })
  requestType: RequestType;

  /**
   * 权限申请状态
   */
  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status: RequestStatus;

  /**
   * 权限申请理由
   */
  @Column({ nullable: true })
  reason: string;

  /**
   * 权限申请详情
   */
  @Column({ type: 'json', nullable: true })
  details: Record<string, unknown>;

  /**
   * 权限申请请求者
   */
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'requested_by' })
  requestedBy: UserEntity;

  /**
   * 权限申请请求者ID
   */
  @Column({ name: 'requested_by' })
  requestedById: number;

  /**
   * 权限申请审批者
   */
  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approvedBy: UserEntity;

  /**
   * 权限申请审批者ID
   */
  @Column({ name: 'approved_by', nullable: true })
  approvedById: number;

  /**
   * 权限申请审批时间
   */
  @Column({ name: 'approved_at', nullable: true })
  approvedAt: Date;

  /**
   * 权限申请拒绝理由
   */
  @Column({ nullable: true })
  rejectionReason: string;

  /**
   * 权限申请目标用户
   */
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'target_user_id' })
  targetUser: UserEntity;

  /**
   * 权限申请目标用户ID
   */
  @Column({ name: 'target_user_id' })
  targetUserId: number;

  /**
   * 权限申请创建时间
   */
  @CreateDateColumn({
    type: 'timestamp with time zone', // 使用标准的带时区时间戳类型
    name: 'created_at',
    comment: '申请创建时间',
  })
  createdAt: Date;

  /**
   * 权限申请更新时间
   */
  @UpdateDateColumn({
    type: 'timestamp with time zone', // 使用标准的带时区时间戳类型
    name: 'updated_at',
    comment: '申请更新时间',
  })
  updatedAt: Date;
}
