import { Controller, Get } from '@nestjs/common';
import { HealthCheck } from '@nestjs/terminus';

import { AppService } from './app.service';
import { DbHealthService } from './database/db-health.service';
import { RedisService } from './database/redis/redis.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly dbHealthService: DbHealthService,
    private readonly redisService: RedisService,
  ) {}

  @Get('health')
  @HealthCheck()
  async healthCheck() {
    const redisPing = await this.redisService.ping();
    return {
      status: 'UP',
      timestamp: new Date().toISOString(),
      services: {
        database: this.dbHealthService.check(),
        redis: redisPing === 'PONG',
      },
    };
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
