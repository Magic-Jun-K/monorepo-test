import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WebVitalsDTO } from './analytics.dto';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@Controller('analytics') // 修改这里，去掉 'api/' 前缀
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post()
  async receiveWebVitals(@Body() data: WebVitalsDTO) {
    await this.analyticsService.handleWebVitals(data);
    return {
      success: true,
      message: 'Web Vitals data received successfully',
    };
  }
}
