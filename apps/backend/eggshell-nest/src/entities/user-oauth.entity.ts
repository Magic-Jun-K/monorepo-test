import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

import type { UserEntity } from './user.entity';

@Entity({ name: 'user_oauth' })
export class UserOAuthEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  provider: string; // 第三方平台名称，如 'github'、'wechat'、'qq'、'google'

  @Column()
  openid: string; // 第三方平台唯一标识

  @Column({ nullable: true })
  unionid: string; // 可选，部分平台有 unionid

  @Column({ nullable: true })
  accessToken: string; // 第三方 access_token

  @Column({ nullable: true })
  refreshToken: string; // 第三方 refresh_token

  @Column({ nullable: true })
  expiresIn: number; // token 过期时间（秒）

  @Column({ nullable: true })
  nickname: string; // 第三方昵称

  @Column({ nullable: true })
  avatar: string; // 第三方头像

  @ManyToOne('UserEntity', 'oAuths')
  user: UserEntity; // 关联的用户实体

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date; // 创建时间

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date; // 更新时间
}
