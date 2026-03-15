/**
 * @description 数据接收层（高并发处理）
 */
import { Controller, Post, Body, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';

import { PerformanceService } from './performance.service';
import { PerformanceDataDto } from './dto/performance-data.dto';
import { ReportPerformanceSchema } from './dto/report.dto';

@ApiTags('Performance')
@Controller({
  path: 'ingest/performance',
  version: '1',
})
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Post()
  @ApiBody({ type: [PerformanceDataDto] })
  async ingestPerformanceData(@Body() data: PerformanceDataDto[]) {
    await this.performanceService.processBatch(data);
    return { status: 'accepted' };
  }

  @Post('report')
  async report(@Body() body: unknown) {
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
    await this.performanceService.handleReport(result.data);
    return { success: true };
  }

  @Get('list')
  async list(@Query() query: Record<string, unknown>) {
    return this.performanceService.queryPerformance(query);
  }
}
