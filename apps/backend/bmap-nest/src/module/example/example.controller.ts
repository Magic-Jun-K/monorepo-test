import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Delete,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ExampleService, ExampleData } from './example.service';

@Controller('example')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  /**
   * 获取数据，使用LRU缓存
   */
  @Get('data/:id')
  async getData(@Param('id') id: string): Promise<ExampleData> {
    try {
      return await this.exampleService.getDataWithCache(id);
    } catch (error) {
      // 如果是数据未找到的错误，抛出404而不是500
      if (error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      // 其他错误继续抛出
      throw error;
    }
  }

  /**
   * 获取所有数据
   */
  @Get('data')
  async getAllData(): Promise<ExampleData[]> {
    return this.exampleService.getAllData();
  }

  /**
   * 创建数据，同时更新缓存
   */
  @Post('data')
  async createData(@Body() data: any): Promise<ExampleData> {
    return this.exampleService.createData(data);
  }

  /**
   * 删除数据，同时清除缓存
   */
  @Delete('data/:id')
  async deleteData(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
    return this.exampleService.deleteData(id);
  }

  /**
   * 清除指定类型的所有缓存
   */
  @Delete('cache')
  async clearCache(@Query('type') type: string): Promise<{ success: boolean; message: string }> {
    return this.exampleService.clearCache(type);
  }
}
