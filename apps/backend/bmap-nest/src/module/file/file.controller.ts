import { Controller, Post, UploadedFile, UseInterceptors, Get, Param, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

import { FileService } from './file.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Public()
  @Post('upload')
  // UseInterceptors是一个装饰器，用于在控制器方法上添加拦截器
  // 'file'是表单字段名
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any) {
    return this.fileService.uploadFile(file);
  }

  @Public()
  @Get('download/:id')
  async downloadFile(@Param('id') id: number, @Res() res: Response) {
    const file = await this.fileService.getFileById(id);
    console.log('测试controller downloadFile file', file);
    if (!file) {
      return res.status(404).send('File not found');
    }
    await this.fileService.downloadFile(file.filename, res);
  }
}
