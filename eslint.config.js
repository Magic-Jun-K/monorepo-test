import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(
  {
    // 那些文件需要用这个配置
    files: ['**/*.{ts,tsx}'],
    // 继承自什么配置
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    // 那些文件不用这个配置
    ignores: [
      'apps/**/*/{tmp,.dumi}/**/*',
      '**/*/build/**/*',
      '**/*/es/**/*',
      '**/*/dist/**/*',
      '**/*/lib/**/*',
      'apps/**/*/public/**/*',
      'packages/**/*/*.d.ts',
      'packages/**/*/*.config.*',
      'packages/**/*/uno.config.*',
      'packages/ui/tailwind/**/*',
      'apps/api/server-koa/**/*',
      'apps/backend/perf-monitor-nest/**/*',
      'apps/web/react-webpack/**/*',
    ],
    // 自定义规则配置
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
    // 语言选项
    languageOptions: {
      // 转换器
      parser: tseslint.parser,
      // 转换选项
      parserOptions: {
        // ts 项目的 tsconfig 文件位置
        project: [
          './tsconfig.json',
          './apps/api/eggshell-nest/tsconfig.json',
          './apps/frontend/react-vite/tsconfig.json',
          './apps/web/react-vite-tw/tsconfig.json',
          './apps/web/react-webpack-ie/tsconfig.json',
          './apps/web/bmap-next-15/tsconfig.json',
        ],
        // ts 配置更目录
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    // 对JavaScript文件使用基本的ESLint规则，不进行TypeScript类型检查
    files: ['**/*.js'],
    extends: [js.configs.recommended],
    ignores: [
      'apps/**/*/{tmp,.dumi}/**/*',
      '**/*/build/**/*',
      '**/*/es/**/*',
      '**/*/dist/**/*',
      '**/*/lib/**/*',
      'apps/**/*/public/**/*',
    ],
    rules: {
      'no-console': 'off',
    },
    languageOptions: {
      env: {
        node: true,
      },
    },
  },
);
