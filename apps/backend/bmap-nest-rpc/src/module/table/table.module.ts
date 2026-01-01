import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminEntity } from '../../entities/admin.entity';
import { TableData } from './table.entity';
import { TableService } from './table.service';
import { TableController } from './table.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AdminEntity, TableData])],
  providers: [TableService],
  controllers: [TableController],
})
export class TableModule {}
