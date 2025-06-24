import { Module, Global, DynamicModule } from '@nestjs/common';

import { InfluxService } from './influx.service';
import { InfluxConfig } from './influx.interface';

@Global()
@Module({})
export class InfluxModule {
  static registerAsync(options: {
    useFactory: (...args: any[]) => Promise<InfluxConfig> | InfluxConfig;
    inject?: any[];
  }): DynamicModule {
    return {
      module: InfluxModule,
      providers: [
        {
          provide: 'INFLUX_CONFIG',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        {
          provide: InfluxService,
          useFactory: (config: InfluxConfig) => new InfluxService(config),
          inject: ['INFLUX_CONFIG'],
        },
      ],
      exports: [InfluxService],
    };
  }
}
