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

  // 内存数据存储（演示用）
  private readonly dataStore: Map<string, ExampleData> = new Map();

  constructor(
    private readonly redisLRUService: RedisLRUService,
    private readonly configService: ConfigService,
  ) {
    // 初始化示例数据
    this.initializeSampleData();
  }

  private initializeSampleData() {
    for (let i = 1; i <= 10; i++) {
      const id = i.toString();
      this.dataStore.set(id, {
        id,
        name: `项目 ${id}`,
        description: `项目 ${id} 的描述`,
        createdAt: new Date().toISOString(),
      });
    }
  }

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
        // 从实际数据存储中获取数据
        this.logger.log(`Cache miss for ID: ${id}, fetching from data store`);

        // 从内存数据存储中获取数据（实际项目中这里应该是数据库查询）
        const data = this.dataStore.get(id);

        if (!data) {
          throw new Error(`Data with ID ${id} not found`);
        }

        return data;
      },
      undefined, // 使用配置中的TTL
      this.DATA_CATEGORY, // 使用数据类别
    );
  }

  /**
   * 创建数据并更新缓存
   * @param data 要创建的数据
   */
  async createData(data: Partial<ExampleData>) {
    // 生成ID（实际项目中可能是数据库自动生成）
    const id = (this.dataStore.size + 1).toString();

    // 创建新数据对象
    const newData: ExampleData = {
      id,
      name: data.name || `项目 ${id}`,
      description: data.description || `项目 ${id} 的描述`,
      createdAt: new Date().toISOString(),
    };

    // 保存到数据存储（实际项目中这里应该是数据库保存操作）
    this.dataStore.set(id, newData);
    this.logger.log(`Creating new data with ID: ${id}`);

    // 将新数据存入缓存
    const cacheKey = `${this.CACHE_PREFIX}${id}`;
    await this.redisLRUService.set(
      cacheKey,
      newData,
      undefined, // 使用配置中的TTL
      this.DATA_CATEGORY, // 使用数据类别
    );

    return newData;
  }

  /**
   * 获取所有数据
   */
  async getAllData(): Promise<ExampleData[]> {
    this.logger.log('Fetching all data');
    // 返回所有数据（实际项目中这里应该是数据库查询）
    return Array.from(this.dataStore.values());
  }

  /**
   * 删除数据并清除缓存
   * @param id 数据ID
   */
  async deleteData(id: string) {
    // 从数据存储中删除数据（实际项目中这里应该是数据库删除操作）
    const deleted = this.dataStore.delete(id);

    if (!deleted) {
      return { success: false, message: `Data with ID ${id} not found` };
    }

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

    return {
      success: true,
      message: `Cache with pattern ${pattern} has been cleared`,
    };
  }
}
