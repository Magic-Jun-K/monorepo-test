import { Module } from '@nestjs/common';
import { ExampleController } from './example.controller';
import { ExampleService } from './example.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule], // 导入Redis模块以使用RedisLRUService
  controllers: [ExampleController],
  providers: [ExampleService],
  exports: [ExampleService],
})
export class ExampleModule {}