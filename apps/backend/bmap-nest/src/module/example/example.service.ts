import { Injectable, Logger } from '@nestjs/common';
import { RedisLRUService } from '../redis/redis-lru.service';
import { ConfigService } from '@nestjs/config';

/**
 * 示例数据接口
 */
export interface ExampleData {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

/**
 * 示例服务
 * 演示如何在NestJS中使用LRU缓存
 */
@Injectable()
export class ExampleService {
  // 缓存前缀
  private readonly CACHE_PREFIX = 'example:data:';
  // 数据类别
  private readonly DATA_CATEGORY = 'example';
  // 日志
  private readonly logger = new Logger(ExampleService.name);

  constructor(
    private readonly redisLRUService: RedisLRUService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 使用LRU缓存获取数据
   * @param id 数据ID
   */
  async getDataWithCache(id: string): Promise<ExampleData> {
    const cacheKey = `${this.CACHE_PREFIX}${id}`;
    
    // 使用getOrSet方法，如果缓存存在则返回缓存，否则执行获取数据的函数并缓存结果
    return this.redisLRUService.getOrSet<ExampleData>(
      cacheKey,
      async () => {
        // 这里是从数据库或其他数据源获取数据的逻辑
        // 模拟数据库查询延迟
        this.logger.log(`Cache miss for ID: ${id}, fetching from database`);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 返回模拟数据
        return {
          id,
          name: `Item ${id}`,
          description: `Description for item ${id}`,
          createdAt: new Date().toISOString(),
        };
      },
      undefined, // 使用配置中的TTL
      this.DATA_CATEGORY // 使用数据类别
    );
  }

  /**
   * 创建数据并更新缓存
   * @param data 要创建的数据
   */
  async createData(data: any) {
    // 模拟数据创建
    const id = Math.random().toString(36).substring(2, 15);
    const newData = {
      id,
      ...data,
      createdAt: new Date().toISOString(),
    };
    
    // 模拟保存到数据库
    this.logger.log(`Creating new data with ID: ${id}`);
    
    // 将新数据存入缓存
    const cacheKey = `${this.CACHE_PREFIX}${id}`;
    await this.redisLRUService.set(
      cacheKey, 
      newData, 
      undefined, // 使用配置中的TTL
      this.DATA_CATEGORY // 使用数据类别
    );
    
    return newData;
  }

  /**
   * 删除数据并清除缓存
   * @param id 数据ID
   */
  async deleteData(id: string) {
    // 模拟数据删除
    // 实际应用中，这里会有数据库删除操作
    this.logger.log(`Deleting data with ID: ${id}`);
    
    // 删除缓存
    const cacheKey = `${this.CACHE_PREFIX}${id}`;
    await this.redisLRUService.delete(cacheKey);
    
    this.logger.log(`Cache entry deleted for ID: ${id}`);
    
    return { success: true, message: `Data with ID ${id} has been deleted` };
  }

  /**
   * 清除指定类型的所有缓存
   * @param type 缓存类型
   */
  async clearCache(type: string) {
    const pattern = type ? `${type}:*` : `${this.CACHE_PREFIX}*`;
    
    // 删除所有匹配的缓存
    await this.redisLRUService.deleteByPattern(pattern);
    
    return { success: true, message: `Cache with pattern ${pattern} has been cleared` };
  }
}