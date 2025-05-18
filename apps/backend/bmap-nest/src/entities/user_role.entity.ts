/**
 * 用户角色实体
 */
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'role' })
export class RoleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // 角色名

  @Column({ nullable: true })
  description: string; // 角色描述

  @ManyToMany(() => UserEntity, (user) => user.roles)
  users: UserEntity[];
}
