import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from 'typeorm';
import Image from './Image.ts';

/**
 * 用户模型
 * 定义用户在数据库中的结构和方法
 */
@Entity()
@Index(['username'], { unique: true })
@Index(['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  username = '';

  @Column()
  email = '';

  @Column()
  password = '';

  @OneToMany(() => Image, (image) => image.uploadedBy)
  images: Image[] = [];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;

  // 实例方法
  getProfileUrl(): string {
    return `/users/${this.username}`;
  }

  // 静态方法
  static async findByUsername(username: string): Promise<User | null> {
    const { getRepository } = await import('typeorm');
    const repo = getRepository(User);
    return repo.findOne({ where: { username } });
  }
}
