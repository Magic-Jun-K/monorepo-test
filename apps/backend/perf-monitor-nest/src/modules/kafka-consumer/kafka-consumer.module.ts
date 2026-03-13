import { Module } from '@nestjs/common';
import { KafkaConsumerController } from './kafka-consumer.controller';
import { CollectorModule } from '../collector/collector.module';

@Module({
  imports: [CollectorModule],
  controllers: [KafkaConsumerController],
})
export class KafkaConsumerModule {}
