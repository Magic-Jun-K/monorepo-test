/**
 * @description 权限模块
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PermissionEntity } from './entities/permission.entity';
import { RolePermissionEntity } from '../role/entities/role-permission.entity';
import { RoleEntity } from '../role/entities/role.entity';
import { UserEntity } from '../user/entities/user.entity';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { InitService } from './init.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PermissionEntity, RolePermissionEntity, RoleEntity, UserEntity]),
  ],
  controllers: [PermissionController],
  providers: [PermissionService, InitService],
  exports: [PermissionService, InitService],
})
export class PermissionModule {}
