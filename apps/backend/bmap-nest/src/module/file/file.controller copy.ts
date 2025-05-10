import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

import { Public } from '../../common/decorators/public.decorator';
import { FileService } from './file.service';
import config from '../../config/file';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Public()
  @Post('upload')
  // UseInterceptors是一个装饰器，用于在控制器方法上添加拦截器
  @UseInterceptors(
    FileInterceptor('file', {
      storage: config().upload.storage,
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  @Public()
  @Get('download/:filename')
  async downloadFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    await this.fileService.downloadFile(filename, res);
  }
}
