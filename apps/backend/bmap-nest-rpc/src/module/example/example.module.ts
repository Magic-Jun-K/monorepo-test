import { Module } from '@nestjs/common';

import { ExampleController } from './example.controller';
import { KafkaModule } from '../kafka/kafka.module';
import { CircuitBreakerModule } from '../circuit-breaker/circuit-breaker.module';
import { RateLimiterModule } from '../rate-limiter/rate-limiter.module';
import { FallbackModule } from '../fallback/fallback.module';

@Module({
  imports: [KafkaModule, CircuitBreakerModule, RateLimiterModule, FallbackModule],
  controllers: [ExampleController],
})
export class ExampleModule {}
