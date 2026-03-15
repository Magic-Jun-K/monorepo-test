/**
 * @description 高并发上报接口
 */
import { Body, Controller, Logger, Post, UseInterceptors } from '@nestjs/common';

import { KafkaService } from '../../common/kafka/kafka.service';
import { PerformanceInterceptor } from '../../common/interceptors/performance.interceptor';
import { PerformanceDTO } from './dto/performance.dto';
import { ErrorDTO } from './dto/error.dto';

@Controller('collect')
export class CollectorController {
  private readonly logger = new Logger(CollectorController.name);

  constructor(private readonly kafkaService: KafkaService) {}

  @Post('performance')
  @UseInterceptors(PerformanceInterceptor)
  async collectPerformance(@Body() data: PerformanceDTO) {
    this.logger.log(`Received performance data: ${data.projectId} - ${data.url}`);
    // 数据发送到 Kafka，由 Consumer 处理后续逻辑（如写入 Redis 队列）
    await this.kafkaService.emit('performance_data', data);
    return { code: 0 };
  }

  @Post('error')
  async collectError(@Body() data: ErrorDTO) {
    this.logger.log(`Received error data`);
    await this.kafkaService.emit('error_log', data);
    return { code: 0 };
  }
}
