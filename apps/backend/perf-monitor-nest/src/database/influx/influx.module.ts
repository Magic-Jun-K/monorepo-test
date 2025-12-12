import { Module, Global, DynamicModule, Type } from '@nestjs/common';

import { InfluxService } from './influx.service';
import { InfluxConfig } from './influx.interface';

@Global()
@Module({})
export class InfluxModule {
  static registerAsync(options: {
    imports?: Array<Type<unknown> | DynamicModule | Promise<DynamicModule>>;
    useFactory: (...args: unknown[]) => Promise<InfluxConfig> | InfluxConfig;
    inject?: Array<Type<unknown> | string | symbol>;
  }): DynamicModule {
    return {
      module: InfluxModule,
      imports: options.imports || [],
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
