/**
 * @description detail模块
 */
import { Module } from '@nestjs/common';
import { DetailController } from './detail.controller';
import { DetailService } from './detail.service';
import { PgService } from 'src/app.service';

@Module({
  imports: [],
  controllers: [DetailController],
  providers: [DetailService, PgService],
})
export class DetailModule {}
