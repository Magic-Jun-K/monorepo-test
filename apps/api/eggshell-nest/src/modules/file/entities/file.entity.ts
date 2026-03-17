import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class FileEntity {
  /**
   * 文件ID
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 文件名
   */
  @Column()
  filename: string;

  /**
   * 文件类型
   */
  @Column()
  mimetype: string;

  /**
   * 存储文件路径
   */
  @Column()
  path: string;
  // @Column('bytea') // 存储二进制数据
  // data: Buffer;
}
