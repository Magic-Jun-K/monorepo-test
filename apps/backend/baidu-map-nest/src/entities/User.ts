// 数据库表实体，需要通过 typeorm 来进行装饰
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

/**
 * @Entity() 装饰器用于指定表实体，定义了一个对象来跟数据库中的 User 表进行映射
 */
@Entity()
export class User {
  // @PrimaryGeneratedColumn() 指定主键
  @PrimaryGeneratedColumn({
    type: 'int',
    unsigned: true, // 不允许负数
  })
  id: number;

  /**
   * @Column() 装饰器用于指定表字段，定义了一个对象来跟数据库中的 username 表进行映射
   */
  @Column({
    type: 'varchar',
    length: 255,
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  password: string;

  @Column({
    type: 'boolean',
    default: true,
  })
  status: boolean;
}
