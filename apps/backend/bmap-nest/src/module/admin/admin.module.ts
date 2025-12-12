import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '../../entities/user.entity';
import { PermissionRequestEntity } from '../../entities/permission-request.entity';
import { AuditLogEntity } from '../../entities/audit-log.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PermissionService } from './permission.service';
import { AuthUtils } from '../../common/utils/auth.utils';
import { RoleModule } from '../role/role.module';

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
