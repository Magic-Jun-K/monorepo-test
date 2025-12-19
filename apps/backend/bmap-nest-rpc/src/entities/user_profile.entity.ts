/**
 * 用户资料实体
 */
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'user_profile' })
export class UserProfileEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  avatar: string; // 头像

  @Column({ nullable: true })
  gender: string; // 性别

  @Column({ nullable: true })
  birthday: Date; // 生日

  @Column({ nullable: true })
  address: string; // 地址

  @OneToOne(() => UserEntity, (user) => user.profile)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
