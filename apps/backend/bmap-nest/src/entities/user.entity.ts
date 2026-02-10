/**
 * 用户资料实体
 */
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';

import type { UserProfileEntity } from './user-profile.entity';
import type { RoleEntity } from './role.entity';
import type { UserOAuthEntity } from './user-oauth.entity';
import type { PhotoEntity } from './photo.entity';

/**
 * 用户状态枚举
 */
export enum UserStatus {
  ACTIVE = 'ACTIVE', // 激活
  INACTIVE = 'INACTIVE', // 未激活
  SUSPENDED = 'SUSPENDED', // 暂停
  DELETED = 'DELETED', // 已删除
  LOCKED = 'LOCKED', // 锁定
}

/**
 * 用户类型枚举（仅用于标识，权限由角色控制）
 */
export enum UserType {
  INTERNAL = 'INTERNAL', // 内部用户
  EXTERNAL = 'EXTERNAL', // 外部用户
  SYSTEM = 'SYSTEM', // 系统用户
}

@Entity({ name: 'user' })
export class UserEntity {
  /**
   * 用户ID
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 用户名
   */
  @Column({ unique: true, nullable: true })
  username: string;

  /**
   * 密码
   */
  @Column({ nullable: true })
  password: string;

  /**
   * 手机号
   */
  @Column({ unique: true, nullable: true })
  phone: string;

  /**
   * 邮箱
   */
  @Column({ unique: true, nullable: true })
  email: string;

  /**
   * 用户类型（仅用于标识，权限由角色控制）
   */
  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.INTERNAL,
  })
  userType: UserType;

  /**
   * 用户状态
   */
  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  /**
   * 是否为超级管理员（通过环境变量配置）
   */
  @Column({ default: false })
  isSuperAdmin: boolean;

  /**
   * 用户资料
   */
  @OneToOne('UserProfileEntity', 'user', { cascade: true })
  profile: Relation<UserProfileEntity>;

  /**
   * 第三方登录关联
   */
  @OneToMany('UserOAuthEntity', 'user', { cascade: true })
  oAuths: Relation<UserOAuthEntity[]>;

  /**
   * 最后登录时间
   */
  @Column({ name: 'last_login_at', nullable: true })
  lastLoginAt: Date;

  /**
   * 最后登录IP
   */
  @Column({ name: 'last_login_ip', nullable: true })
  lastLoginIp: string;

  /**
   * 登录失败次数
   */
  @Column({ name: 'login_failed_count', default: 0 })
  loginFailedCount: number;

  /**
   * 账户锁定时间
   */
  @Column({ name: 'locked_until', nullable: true })
  lockedUntil: Date;

  /**
   * 密码过期时间
   */
  @Column({ name: 'password_expires_at', nullable: true })
  passwordExpiresAt: Date;

  /**
   * 是否需要修改密码
   */
  @Column({ name: 'password_change_required', default: false })
  passwordChangeRequired: boolean;

  @OneToMany('PhotoEntity', 'user')
  photos: Relation<PhotoEntity[]>;

  @ManyToMany('RoleEntity', 'users')
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Relation<RoleEntity[]>;

  /**
   * 创建时间
   */
  @CreateDateColumn({
    type: 'timestamp with time zone', // 使用标准的带时区时间戳类型
    name: 'created_at',
    comment: '用户创建时间（注册时间）',
  })
  createdAt: Date;

  /**
   * 更新时间
   */
  @UpdateDateColumn({
    type: 'timestamp with time zone', // 使用标准的带时区时间戳类型
    name: 'updated_at',
    comment: '用户信息最后更新时间',
  })
  updatedAt: Date;
}
