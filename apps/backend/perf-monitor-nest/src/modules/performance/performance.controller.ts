/**
 * @description 数据接收层（高并发处理）
 */
import { Controller, Post, Body, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { FilterQuery } from 'mongoose';

import { PerformanceService } from './performance.service';
import { PerformanceDataDto } from './dto/performance-data.dto';
import { ReportPerformanceSchema } from './dto/report.dto';
import { PerformanceDocument } from './performance.schema';

@ApiTags('Performance')
@Controller('v1/ingest/performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Post()
  @ApiBody({ type: [PerformanceDataDto] })
  async ingestPerformanceData(@Body() data: PerformanceDataDto[]) {
    // 异步处理，立即返回202响应
    await this.performanceService.processBatch(data);
    return { status: 'accepted' };
  }

  @Post('report')
  async report(@Body() body: any) {
    const result = ReportPerformanceSchema.safeParse(body);
    if (!result.success) {
      const errorMessages = result.error.issues.map((err) => {
        return `${err.path.join('.')}: ${err.message}`;
      });
      throw new BadRequestException({
        message: '数据验证失败',
        errors: errorMessages,
        success: false,
      });
    }
    // result.data 就是校验后的数据
    await this.performanceService.handleReport(result.data);
    return { success: true };
  }

  @Get('list')
  async list(@Query() query: FilterQuery<PerformanceDocument>) {
    return this.performanceService.queryPerformance(query);
  }
}
