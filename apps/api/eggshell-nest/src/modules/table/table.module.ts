import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TableData } from './entities/table.entity';
import { TableService } from './table.service';
import { TableController } from './table.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TableData])],
  providers: [TableService],
  controllers: [TableController],
})
export class TableModule {}
