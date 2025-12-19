import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { UserEntity } from './user.entity';

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

  // ManyToOne是多对一的关系，UserOAuthEntity 是多的一方，UserEntity 是一的一方
  @ManyToOne(() => UserEntity, (user) => user.oAuths)
  user: UserEntity;
}
