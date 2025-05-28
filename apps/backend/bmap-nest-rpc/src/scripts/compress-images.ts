/**
 * 批量压缩图片
 * @param sourcePath 源目录
 * @param destPath 目标目录
 */
import { join, extname } from 'node:path';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import * as sharp from 'sharp';

async function compressImage(sourcePath: string, destPath: string): Promise<void> {
  await sharp(sourcePath)
    .resize({
      width: 1600,      // 分辨率
      height: 1200,     // 分辨率
      fit: 'inside',
      withoutEnlargement: true  // 防止小图被放大而失真
    })
    .toFormat('webp', { 
      quality: 90,      // 提高质量参数
      lossless: false,  // 有损压缩，但质量更高
      effort: 4         // 压缩效果，范围0-6，值越小压缩速度越快，值越大压缩效果越好
    })
    .toFile(destPath);
}

async function main() {
  const publicDir = join(process.cwd(), 'public/images');
  const compressedDir = join(process.cwd(), 'public/compressed');

  // 创建压缩目录
  if (!existsSync(compressedDir)) {
    mkdirSync(compressedDir, { recursive: true });
  }

  // 确保源目录存在
  if (!existsSync(publicDir)) {
    console.error('公共图片目录不存在');
    process.exit(1);
  }

  // 读取目录中的所有文件
  const files = readdirSync(publicDir);

  // 过滤出图片文件
  const imageFiles = files.filter(file => {
    const ext = extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
  });

  console.log(`找到 ${imageFiles.length} 个图片文件需要压缩`);

  // 批量压缩
  const results = { success: 0, failed: 0 };
  for (const file of imageFiles) {
    try {
      const sourcePath = join(publicDir, file);
      const destPath = join(compressedDir, file.replace(/\.[^.]+$/, '.webp'));

      await compressImage(sourcePath, destPath);
      results.success++;
      console.log(`成功压缩: ${file}`);
    } catch (error) {
      results.failed++;
      console.error(`压缩失败 ${file}:`, error);
    }
  }

  console.log(`压缩完成: 成功 ${results.success} 个, 失败 ${results.failed} 个`);
}

main().catch(console.error);
