import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'photo' })
export class PhotoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column() // 照片的 URL
  url: string;

  @ManyToOne(() => UserEntity, (user) => user.photos) // 定义多对一关系
  user: UserEntity; // 关联的用户
}
