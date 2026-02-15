import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(
  {
    ignores: ['.eslintrc.js', 'dist', 'node_modules'],
  },
  {
    // TypeScript 文件配置
    files: ['src/**/*.ts'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      parser: tseslint.parser, // 使用 TypeScript 解析器
      parserOptions: {
        project: './tsconfig.json', // 指向项目的 tsconfig 文件
        tsconfigRootDir: __dirname, // 指向项目根目录
        sourceType: 'module', // 使用 ES 模块
      },
      ecmaVersion: 'latest', // 使用最新的 ECMAScript 版本
    },
    plugins: {
      prettier: prettierPlugin, // 启用 Prettier 插件
    },
    rules: {
      ...prettierConfig.rules, // 应用 Prettier 的规则
      '@typescript-eslint/interface-name-prefix': 'off', // 关闭特定规则
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    // JavaScript 文件配置
    files: ['**/*.js'],
    plugins: {
      prettier: prettierPlugin,
    },
    languageOptions: {
      ecmaVersion: 'latest', // 使用最新的 ECMAScript 版本
      sourceType: 'module', // 使用 ES 模块
    },
    rules: {
      'prettier/prettier': 'error', // 启用 Prettier 格式化检查
    },
  },
);
