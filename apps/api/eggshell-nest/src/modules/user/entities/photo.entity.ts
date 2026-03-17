import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';

import type { UserEntity } from './user.entity';

@Entity({ name: 'photo' })
export class PhotoEntity {
  /**
   * 照片ID
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 照片的 URL
   */
  @Column()
  url: string;

  /**
   * 关联的用户
   */
  @ManyToOne('UserEntity', 'photos')
  user: UserEntity; // 关联的用户
}
