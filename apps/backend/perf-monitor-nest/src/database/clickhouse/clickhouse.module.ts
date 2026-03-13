import { Module, Global, DynamicModule, Type } from '@nestjs/common';

import { ClickHouseService } from './clickhouse.service';
import { ClickHouseConfig } from './clickhouse.interface';

@Global()
@Module({})
export class ClickHouseModule {
  static registerAsync(options: {
    imports?: Array<Type<unknown> | DynamicModule | Promise<DynamicModule>>;
    useFactory: (...args: unknown[]) => Promise<ClickHouseConfig> | ClickHouseConfig;
    inject?: Array<Type<unknown> | string | symbol>;
  }): DynamicModule {
    return {
      module: ClickHouseModule,
      imports: options.imports || [],
      providers: [
        {
          provide: 'CLICKHOUSE_CONFIG',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        {
          provide: ClickHouseService,
          useFactory: (config: ClickHouseConfig) => new ClickHouseService(config),
          inject: ['CLICKHOUSE_CONFIG'],
        },
      ],
      exports: [ClickHouseService],
    };
  }
}
