// 数据库表实体，需要通过 typeorm 来进行装饰
import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { PhotoEntity } from '../../photo/photo.entity';

// @Entity({ name: 'users' })
// export class UsersEntity {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column({ length: 20 })
//   name: string;

//   @Column('varchar')
//   password: string;

//   @Column()
//   status: boolean;

//   @OneToMany(() => PhotoEntity, (photo) => photo.user)
//   photos: [];
// }

/**
 * @Entity() 装饰器用于指定表实体，定义了一个对象来跟数据库中的 User 表进行映射
 */
@Entity({ name: 'users' })
export class UserEntity {
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

  @OneToMany(() => PhotoEntity, (photo) => photo.user)
  photos: [];
}
