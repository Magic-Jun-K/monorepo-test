import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserEntity } from '../../entities/user.entity';

import { UserProfileEntity } from '../../entities/user_profile.entity';
import { RoleEntity } from '../../entities/user_role.entity';
import { UserOAuthEntity } from '../../entities/user_oauth.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserProfileEntity,
      RoleEntity,
      UserOAuthEntity,
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
