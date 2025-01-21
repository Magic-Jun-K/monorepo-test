import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class File {
  @PrimaryGeneratedColumn()
  id: number; // 文件ID

  @Column()
  filename: string; // 文件名

  @Column()
  mimetype: string; // 文件类型

  @Column()
  path: string; // 存储文件路径
  // @Column('bytea') // 存储二进制数据
  // data: Buffer;
}
