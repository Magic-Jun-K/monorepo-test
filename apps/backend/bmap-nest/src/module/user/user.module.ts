import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserEntity } from '../../entities/user.entity';
import { RoleEntity } from '../../entities/role.entity';

import { UserProfileEntity } from '../../entities/user-profile.entity';
import { UserOAuthEntity } from '../../entities/user-oauth.entity';
import { RoleModule } from '../role/role.module';
import { PermissionModule } from '../permission/permission.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      RoleEntity,
      UserProfileEntity,
      UserOAuthEntity,
    ]),
    RoleModule,
    PermissionModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
