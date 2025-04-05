/**
 * @description 路由处理的控制器（控制器层）
 */
import { Controller, Get, Param, UsePipes, UseGuards } from '@nestjs/common';

import { DetailService } from './detail.service';
import { DetailPipe } from '../../common/pipes/detail.pipe';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PgService } from '../../app.service';

// 路由拦截
@Controller('/detail')
export class DetailController {
  constructor(
    private readonly detailService: DetailService,
    private readonly pgService: PgService,
  ) {}

  @Get('/pg')
  async getHelloPg() {
    const res = await this.pgService.query('SELECT * FROM detail');
    console.log(
      'getHelloPg res',
      'res.rows是数据',
      res.rows,
      'res.rowCount是数据条数',
      res.rowCount,
      'res.fields是字段信息',
      res.fields,
    );
  }

  // @Get()
  // // id 假设是一个 string，但是我们需要接收的是一个 number，这时你就可以使用管道转换
  // getHello(@Query('id') id: string): string {
  //   console.log('测试Query id', id);
  //   return this.detailService.getHello();
  // }
  // @Post()
  // // id 假设是一个 string，但是我们需要接收的是一个 number，这时你就可以使用管道转换
  // getHello(@Body('id') id: string): string {
  //   console.log('测试Body id', id);
  //   return this.detailService.getHello();
  // }
  @Get(':id')
  // id 假设是一个 string，但是我们需要接收的是一个 number，这时你就可以使用管道转换
  @UsePipes(new DetailPipe())
  @UseGuards(AuthGuard)
  getHello(@Param('id') id): string {
    console.log('测试Body id', id, typeof id);
    return this.detailService.getHello();
  }
}
