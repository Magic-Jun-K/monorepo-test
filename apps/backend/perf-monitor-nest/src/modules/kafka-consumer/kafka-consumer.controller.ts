import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import { CollectorService } from '../collector/collector.service';
import { PerformanceDataDto } from '../performance/dto/performance-data.dto';
import { ErrorLog } from '../error-log/schemas/error-log.schema';

@Controller()
export class KafkaConsumerController {
  private readonly logger = new Logger(KafkaConsumerController.name);

  constructor(private readonly collectorService: CollectorService) {}

  @EventPattern('performance_data')
  async handlePerformanceData(@Payload() data: PerformanceDataDto) {
    this.logger.log(`Received performance data from Kafka: ${data.projectId} - ${data.url}`);
    // 收到 Kafka 消息后，放入 Bull 队列处理
    await this.collectorService.addToQueue('performance', data);
  }

  @EventPattern('error_log')
  async handleErrorLog(@Payload() data: Partial<ErrorLog>) {
    this.logger.log(`Received error log from Kafka`);
    await this.collectorService.addToQueue('error', data);
  }
}
