/**
 * @description 角色模块
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RoleEntity } from '../../entities/role.entity';
import { RolePermissionEntity } from '../../entities/role-permission.entity';
import { UserEntity } from '../../entities/user.entity';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { PermissionModule } from '../permission/permission.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleEntity, RolePermissionEntity, UserEntity]),
    PermissionModule,
  ],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
