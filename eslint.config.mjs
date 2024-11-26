/*
 *   Copyright (c) 2024 妙码学院-Heyi
 *   All rights reserved.
 *   妙码学院官方出品，作者 @Heyi，供学员学习使用，可用作练习，可用作美化简历，不可开源。
 */
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config({
  // 继承自什么配置
  extends: [js.configs.recommended, ...tseslint.configs.recommended],
  // 那些文件需要用这个配置
  files: ['**/*.{ts,tsx,js}'],
  // 那些文件不用这个配置
  ignores: ['apps/**/*/{tmp,.dumi}/**/*', '*.js', '**/*/build/**/*', '**/*/es/**/*', '**/*/dist/**/*'],
  // 自定义规则配置
  rules: {
    'no-console': 'off'
  },
  // 语言选项
  languageOptions: {
    // 转换器
    parser: tseslint.parser,
    // 转换选项
    parserOptions: {
      // ts 项目的 tsconfig 文件位置
      project: [],
      // ts 配置更目录
      tsconfigRootDir: import.meta.dirname
    }
  }
});
