// 数据库表实体，需要通过 typeorm 来进行装饰
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { UserEntity } from './user.entity';

/**
 * @Entity() 装饰器用于指定表实体，定义了一个对象来跟数据库中的 admin 表进行映射
 */
@Entity({ name: 'admin' })
export class AdminEntity {
  // @PrimaryGeneratedColumn() 指定主键
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * @Column() 装饰器用于指定表字段，定义了一个对象来跟数据库中的 username 表进行映射
   */
  @Column({ unique: true }) // 设置 username 为唯一
  username: string;

  @Column()
  password: string;

  // 设置 phone 为唯一，nullable 表示可以为空
  @Column({ unique: true, nullable: true })
  phone: string;

  // 设置 email 为唯一，nullable 表示可以为空
  @Column({ unique: true, nullable: true })
  email: string;

  @OneToOne(() => UserEntity) // 定义一对一关系
  @JoinColumn({ name: 'userId' }) // 指定外键字段
  user: UserEntity; // 关联的用户实体
}
