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
} from 'typeorm';

import { UserProfileEntity } from './user_profile.entity';
import { RoleEntity } from './user_role.entity';
import { UserOAuthEntity } from './user_oauth.entity';
import { PhotoEntity } from './photo.entity';

@Entity({ name: 'user' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true }) // 用户名
  username: string;

  @Column({ nullable: true }) // 密码（加密存储）
  password: string;

  @Column({ unique: true, nullable: true }) // 手机号码
  phone: string;

  @Column({ unique: true, nullable: true }) // 邮箱
  email: string;

  @Column({
    type: 'enum',
    enum: ['admin', 'user'],
    default: 'user',
  }) // 用户类型：admin管理员，user普通用户
  userType: string;

  @Column({ default: true }) // 账户是否激活
  isActive: boolean;

  @OneToOne(() => UserProfileEntity, (profile) => profile.user)
  profile: UserProfileEntity;

  @OneToMany(() => UserOAuthEntity, (oauth) => oauth.user)
  oAuths: UserOAuthEntity[];

  // 如果数据量较大，可以使用懒加载来优化性能 lazy: true
  // @OneToMany(() => PhotoEntity, (photo) => photo.user, { lazy: true })
  @OneToMany(() => PhotoEntity, (photo) => photo.user) // 定义一对多关系
  photos: PhotoEntity[]; // 用户关联的照片列表

  @ManyToMany(() => RoleEntity, (role) => role.users)
  @JoinTable({
    name: 'user_roles', // 中间表名
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: RoleEntity[];

  /**
   * 用户创建时间
   * 用户注册或首次创建记录的时间，当用户记录第一次插入数据库时自动设置，之后不会自动改变
   */
  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    comment: '用户创建时间（注册时间）',
  })
  createdAt: Date;

  /**
   * 用户信息最后更新时间
   * 用户信息（如用户名、邮箱、手机号等）最后一次被修改的时间，每次更新用户信息时都会自动更新
   */
  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
    comment: '用户信息最后更新时间',
  })
  updatedAt: Date;
}
