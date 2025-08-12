import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '../../entities/user.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuthUtils } from '../../common/utils/auth.utils';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [AdminController],
  providers: [AdminService, AuthUtils],
  exports: [AdminService],
})
export class AdminModule {}
