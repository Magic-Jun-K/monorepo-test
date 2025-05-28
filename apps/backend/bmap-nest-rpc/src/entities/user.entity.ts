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
} from 'typeorm';

import { UserProfileEntity } from './user_profile.entity';
import { RoleEntity } from './user_role.entity';
import { UserOauthEntity } from './user_oauth.entity';
import { PhotoEntity } from './photo.entity';

@Entity({ name: 'user' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true }) // 用户名
  username: string;

  @Column({ unique: true }) // 手机号码
  phone: string;

  @Column({ unique: true, nullable: true }) // 邮箱
  email: string;

  @OneToOne(() => UserProfileEntity, (profile) => profile.user)
  profile: UserProfileEntity;

  @OneToMany(() => UserOauthEntity, (oauth) => oauth.user)
  oauths: UserOauthEntity[];

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
}
