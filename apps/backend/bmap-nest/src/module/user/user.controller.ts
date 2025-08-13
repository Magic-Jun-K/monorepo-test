import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UploadedFile,
  UseInterceptors,
  Res,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';

import { UserService } from './user.service';
import { CreateUserDto, CreateUserSchema } from './dto/create-user.dto';
import { ZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { UserEntity } from '@/entities/user.entity';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  /**
   * 用户列表（带搜索、分页）
   * @param query
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(@Query() query: any) {
    console.log('user findAll query', query);
    const result = await this.userService.findAll(query || {});
    return {
      success: true,
      data: result
    };
  }

  /**
   * 新增用户
   * @param createUserDto
   * @returns
   */
  @Post()
  async create(
    @Body(new ZodValidationPipe(CreateUserSchema)) createUserDto: CreateUserDto,
  ) {
    const result = await this.userService.create(createUserDto);
    return {
      success: true,
      data: result
    };
  }

  /**
   * 导入用户（上传文件）
   * @param file
   * @returns
   */
  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async import(@UploadedFile() file: Express.Multer.File) {
    const result = await this.userService.importUsers(file);
    return {
      success: true,
      data: result
    };
  }

  /**
   * 导出用户（文件流）
   * @param query
   * @param res
   */
  @Get('export')
  async export(@Query() query: any, @Res() res: Response) {
    try {
      await this.userService.exportUsers(query, res);
    } catch (error) {
      res.status(500).send('导出失败');
      console.error('导出失败', error);
    }
  }

  /**
   * 批量导出用户（根据ID列表）
   * @param ids
   * @param res
   */
  @Post('batch-export')
  async batchExport(@Body('ids') ids: number[], @Res() res: Response) {
    try {
      await this.userService.batchExportUsers(ids, res);
    } catch (error) {
      res.status(500).send('导出失败');
      console.error('批量导出失败', error);
    }
  }
}
