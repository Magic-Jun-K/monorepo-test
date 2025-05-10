import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'table' })
export class TableData {
  @PrimaryGeneratedColumn()
  key: number;

  @Column()
  userId: string;

  @Column()
  username: string;

  @Column()
  status: string;

  @Column({ type: 'timestamp' })
  createTime: Date;

  @Column({ type: 'timestamp' })
  updateTime: Date;

  @Column()
  amount: number;

  @Column()
  inventoryQuantity: number;

  @Column('text', { array: true })
  tags: string[];

  @Column()
  isRecommended: boolean;
}
