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
import { AuthGuard } from '@nestjs/passport';

import { UserService } from './user.service';
import { CreateUserDto, CreateUserSchema } from './dto/create-user.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AppLoggerService } from '../../common/services/logger.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: AppLoggerService,
  ) {
    this.logger.setContext('UserController');
  }

  /**
   * 用户列表（带搜索、分页）
   * @param query
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(@Query() query: Record<string, unknown>) {
    this.logger.log(`Get users with query: ${JSON.stringify(query)}`);
    return this.userService.findAll(query || {});
  }

  /**
   * 新增用户
   * @param createUserDto
   * @returns
   */
  @Post()
  async create(@Body(new ZodValidationPipe(CreateUserSchema)) createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  /**
   * 导入用户（上传文件）
   * @param file
   * @returns
   */
  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async import(@UploadedFile() file: Express.Multer.File) {
    return this.userService.importUsers(file);
  }

  /**
   * 导出用户（文件流）
   * @param query
   * @param res
   */
  @Get('export')
  async export(@Query() query: Record<string, unknown>, @Res() res: Response) {
    try {
      await this.userService.exportUsers(query, res);
    } catch (error) {
      res.status(500).send('导出失败');
      this.logger.error('导出失败', (error as Error).stack);
    }
  }
}
