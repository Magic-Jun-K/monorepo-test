import { Body, Controller, Delete, Get, Post, Put, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { nanoid } from 'nanoid';

import { UserEntity } from '../../entities/user.entity';
import { ApplicationEntity } from '../../entities/application.entity';
import { ApplicationService } from './application.service';

/**
 * 经典 Restful 风格的控制器
 * 通过装饰器 @Controller('application') 指定了路由前缀
 * 即该控制器下的所有路由都会以 /application 为前缀
 * post 请求 /application 会触发 create 方法，表示创建
 * put 请求 /application 会触发 update 方法，表示更新
 * get 请求 /application 会触发 list 方法，表示获取列表
 * delete 请求 /application 会触发 delete 方法，表示删除
 */

@Controller('application')
@UseGuards(AuthGuard('jwt'))
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  async create(@Body() body, @Request() req) {
    const user = new UserEntity();
    user.id = req.user.id;
    const application = new ApplicationEntity(body);
    Reflect.set<ApplicationEntity, 'appId'>(application, 'appId', application.type + nanoid(6));

    const newUser = await this.applicationService.create({
      ...application,
      user: user,
    });
    return { data: newUser, success: true };
  }

  @Put()
  async update(@Body() body) {
    const newUser = await this.applicationService.update(body);
    return { data: newUser, success: true };
  }

  @Get()
  async list(@Request() req) {
    const list = await this.applicationService.list({ userId: req.user.id });
    return { data: list, success: true };
  }

  @Delete()
  async delete(@Body() body, @Request() req) {
    const newUser = await this.applicationService.delete({
      appId: body.appId,
      userId: req.user.id,
    });
    return { data: newUser, success: true };
  }
}
