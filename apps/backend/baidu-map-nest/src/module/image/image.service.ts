import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import { fileTypeFromBuffer } from 'file-type';
import { join } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';

@Injectable()
export class ImageService {
  async compressImage(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .jpeg({
        quality: 75, // 调整JPEG质量（1-100）
        mozjpeg: true, // 启用mozjpeg压缩
      })
      .png({
        // quality: 75, // 调整PNG质量（1-100）
        compressionLevel: 9, // 压缩等级（0-9）
      })
      .resize({
        width: 800,
        height: 800,
        fit: 'inside', // 添加比例保持
        withoutEnlargement: true, // 禁止放大小图
      }) // 调整宽度，高度自动按比例
      .toBuffer();
  }

  // 格式检测方法
  async getImageFormat(buffer: Buffer): Promise<string> {
    const type = await fileTypeFromBuffer(buffer);
    if (!type || !type.mime.startsWith('image/')) {
      throw new Error('无法识别的图片格式');
    }
    return type.mime.split('/')[1]; // 返回格式后缀如jpeg/png
  }

  // 压缩公共图片
  async compressPublicImage(filename: string): Promise<string> {
    const publicDir = join(process.cwd(), 'public/images');
    const compressedDir = join(publicDir, '../compressed');

    // 创建压缩目录
    if (!existsSync(compressedDir)) {
      mkdirSync(compressedDir, { recursive: true });
    }

    const sourcePath = join(publicDir, filename);
    const destPath = join(compressedDir, filename);

    // 源文件存在性检查
    if (!existsSync(sourcePath)) {
      throw new Error(`源文件 ${filename} 不存在`);
    }

    // 存在压缩版本直接返回
    if (existsSync(destPath)) {
      return destPath;
    }

    // 执行压缩
    await sharp(sourcePath)
      .resize({
        width: 1200,
        height: 800,
        fit: 'inside',
      }) // 调整宽度，高度自动按比例
      .toFormat('webp', { quality: 80 }) // 转换为webp格式
      .toFile(destPath); // 保存到目标路径

    return destPath;
  }
}
