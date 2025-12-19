import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { FileController } from './file.controller';
import { FileService } from './file.service';
import { File } from '../../entities/file.entity';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([File])],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
