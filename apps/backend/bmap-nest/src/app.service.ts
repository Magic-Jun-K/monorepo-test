/**
 * @description 服务端项目数据处理、逻辑处理（服务层）
 * 操作数据库
 * 调用第三方接口
 * 数据加工
 */
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

@Injectable() // @Injectable()告诉NestJS，这个类是可以依赖注入的服务
export class AppService {}

// nest 对于模块有统一的管理
// 数据库连接池是在对象初始化时创建
// 是在模块初始化时连接
// 是在模块销毁时关闭
@Injectable()
export class PgService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  constructor(private readonly configService: ConfigService) {
    const dsConfig = {
      host: this.configService.get<string>('PG_HOST'),
      port: parseInt(this.configService.get<string>('PG_PORT'), 10),
      user: this.configService.get<string>('PG_USER'),
      password: this.configService.get<string>('PG_PASSWORD'),
      database: this.configService.get<string>('PG_DATABASE_NAME'),
    };
    // console.log('PG Config:', dsConfig);
    this.pool = new Pool(dsConfig);
  }
  onModuleInit() {
    this.pool.connect();
  }
  onModuleDestroy() {
    this.pool.end();
  }

  /**
   * 提供方法来调用数据库的查询
   */
  async query(sql) {
    try {
      const result = await this.pool.query(sql);
      return result;
    } catch (error) {
      console.error('pg query error', error);
      // 业务异常一般不要吞掉
      throw error;
    }
  }
}
