import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RoleModule } from '../role/role.module';

import { AdminController } from './admin.controller';

import { AdminService } from './admin.service';
import { PermissionService } from './permission.service';

import { AuditLogEntity } from './entities/audit-log.entity';
import { PermissionRequestEntity } from '../permission/entities/permission-request.entity';
import { UserEntity } from '../user/entities/user.entity';

import { AuthUtils } from '../../common/utils/auth.utils';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, PermissionRequestEntity, AuditLogEntity]),
    RoleModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, PermissionService, AuthUtils],
  exports: [AdminService, PermissionService],
})
export class AdminModule {}
