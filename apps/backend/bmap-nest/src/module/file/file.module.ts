import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { FileController } from './file.controller';
import { FileService } from './file.service';
import { FileEntity } from '../../entities/file.entity';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([FileEntity])],
  controllers: [FileController],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}
