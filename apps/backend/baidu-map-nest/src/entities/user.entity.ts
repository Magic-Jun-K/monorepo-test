import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

import { PhotoEntity } from './photo.entity';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true }) // 用户昵称
  nickname: string;

  @Column({ nullable: true }) // 邮箱
  email: string;

  @Column({ nullable: true }) // 角色
  role: string;

  // 如果数据量较大，可以使用懒加载来优化性能 lazy: true
  // @OneToMany(() => PhotoEntity, (photo) => photo.user, { lazy: true })
  @OneToMany(() => PhotoEntity, (photo) => photo.user) // 定义一对多关系
  photos: PhotoEntity[]; // 用户关联的照片列表
}
