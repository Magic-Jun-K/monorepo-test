import Fontmin from 'fontmin';
import path from 'node:path';
import fs from 'node:fs';
import { globSync } from 'glob';

// 步骤1: 扫描代码中的中文字符
const files = globSync('src/**/*.@(tsx|ts|js|jsx|html)');
let chineseChars = '';

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // 匹配所有中文字符（Unicode范围）
  const matches = content.match(/[\u4e00-\u9fa5]/g) || [];
  chineseChars += matches.join('');
});

// 去重并合并基础字符
const characters = [...new Set(chineseChars)].join('') + 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

// 步骤2: 生成字体
const fontmin = new Fontmin()
  .src(path.resolve(import.meta.dirname, '../font-source/SmileySans-Oblique.ttf')) // 原始字体路径
  .use(
    Fontmin.glyph({
      text: characters
    })
  ) // 子集化
  .use(Fontmin.ttf2woff2()) // 转换为 WOFF2
  .dest(path.resolve(import.meta.dirname, '../src/assets/fonts')); // 输出目录

fontmin.run(err => {
  if (err) throw err;
  console.log('字体子集化完成！');
});
