/**
 * @description 高并发上报接口
 */
import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';

import { CollectorService } from './collector.service';
import { PerformanceInterceptor } from '../../common/interceptors/performance.interceptor';
import { PerformanceDTO } from './dto/performance.dto';
import { ErrorDTO } from './dto/error.dto';

@Controller('collect')
export class CollectorController {
  constructor(private readonly collectorService: CollectorService) {}

  @Post('performance')
  @UseInterceptors(PerformanceInterceptor)
  async collectPerformance(@Body() data: PerformanceDTO) {
    // 数据加入队列异步处理
    await this.collectorService.addToQueue('performance', data);
    return { code: 0 };
  }

  @Post('error')
  async collectError(@Body() data: ErrorDTO) {
    await this.collectorService.addToQueue('error', data);
    return { code: 0 };
  }
}
