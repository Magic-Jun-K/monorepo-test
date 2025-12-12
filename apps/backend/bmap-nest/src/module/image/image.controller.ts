import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
  HttpException,
  HttpStatus,
  Param,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { Readable } from 'node:stream';
import { existsSync } from 'node:fs';

import { ImageService } from './image.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('image')
export class ImageController {
  private readonly logger = new Logger(ImageController.name);
  
  constructor(private readonly imageService: ImageService) {}

  @Post('compress')
  @UseInterceptors(FileInterceptor('image'))
  async compressImage(
    @UploadedFile() file: Express.Multer.File,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    try {
      // 压缩图片
      const compressedBuffer = await this.imageService.compressImage(file.buffer);

      // 创建可读流
      const stream = Readable.from(compressedBuffer);

      const format = await this.imageService.getImageFormat(compressedBuffer);
      // 设置响应头
      res.set({
        'Content-Type': `image/${format}`,
        'Content-Disposition': `inline; filename="compressed_${file.originalname}"`,
      });

      return new StreamableFile(stream);
    } catch (error) {
      throw new HttpException(`图片处理失败: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Public()
  @Get('public/compressed/:filename')
  async getPublicCompressed(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const filePath = await this.imageService.compressPublicImage(filename);
      // 验证文件存在性
      if (!existsSync(filePath)) {
        throw new Error('压缩文件生成失败');
      }
      res.sendFile(filePath);
    } catch (error) {
      const status = error.message.includes('不存在')
        ? HttpStatus.NOT_FOUND
        : HttpStatus.INTERNAL_SERVER_ERROR;

      throw new HttpException(error.message, status);
    }
  }
}
