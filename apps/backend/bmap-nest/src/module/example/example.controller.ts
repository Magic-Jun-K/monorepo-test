import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Delete,
  Query,
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
    return this.exampleService.getDataWithCache(id);
  }

  /**
   * 获取所有数据
   */
  // @Get('data')
  // async getAllData(): Promise<ExampleData[]> {
  //   // 实现获取所有数据的逻辑
  //   return []; // 返回空数组或模拟数据
  // }

  /**
   * 创建数据，同时更新缓存
   */
  @Post('data')
  async createData(@Body() data: any) {
    return this.exampleService.createData(data);
  }

  /**
   * 删除数据，同时清除缓存
   */
  @Delete('data/:id')
  async deleteData(@Param('id') id: string) {
    return this.exampleService.deleteData(id);
  }

  /**
   * 清除指定类型的所有缓存
   */
  @Delete('cache')
  async clearCache(@Query('type') type: string) {
    return this.exampleService.clearCache(type);
  }
}
