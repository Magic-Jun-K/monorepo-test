import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import {
  createReadStream,
  existsSync,
  mkdirSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { Response } from 'express';

import { File } from '../../entities/file.entity';

@Injectable()
export class FileService {
  private readonly uploadDir: string;

  constructor(
    @InjectRepository(File) private readonly fileRepository: Repository<File>,
    private readonly configService: ConfigService,
  ) {
    // 根据环境变量动态选择存储路径
    this.uploadDir =
      this.configService.get<string>('STORAGE_TYPE') === 'local'
        ? join(process.cwd(), 'upload') // 本地开发环境
        : '/var/www/upload'; // 生产环境
  }

  // 上传文件
  async uploadFile(file: Express.Multer.File): Promise<File> {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
    console.log('测试file', file);
    console.log('测试this.uploadDir', this.uploadDir);
    const filePath = `upload/${file.originalname}`;
    writeFileSync(join(this.uploadDir, file.originalname), file.buffer);

    const newFile = this.fileRepository.create({
      filename: file.originalname,
      mimetype: file.mimetype,
      path: filePath, // 存储完整路径
      // data: file.buffer, // 存储文件的二进制数据
    });
    return this.fileRepository.save(newFile);
  }

  // 获取文件
  async getFileById(id: number): Promise<File> {
    return this.fileRepository.findOne({ where: { id } });
  }

  // 下载文件
  async downloadFile(filename: string, res: Response) {
    console.log('测试service downloadFile filename', filename);

    // const filePath = join(process.cwd(), 'upload', filename);
    const filePath = join(this.uploadDir, filename);
    console.log('测试service downloadFile filePath', filePath);

    if (!existsSync(filePath)) {
      res.status(404).send('File not found');
      return;
    }

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    const fileStream = createReadStream(filePath);
    fileStream.on('error', (err) => {
      console.error('文件流错误:', err);
      res.status(500).send('文件传输失败');
    });
    fileStream.pipe(res);
  }
}
